import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { words } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RaeApiResponse, RaeErrorResponse, WordAnalysisResponse } from '$lib/types';

const RAE_API_BASE_URL = 'https://rae-api.com/api/words';
const RAE_API_SEARCH_URL = 'https://rae-api.com/api/search';

function parseDescription(description: string): string {
	if (!description) return description;

	// Split on 'Sin.:' and take everything before it, remove numbers and periods
	const beforeSynonyms = description.split(/Sin\.\:/g)[0];
	const beforeAntonyms = beforeSynonyms.split(/Ant\.\:/g)[0];
	const removeNumber = beforeAntonyms.replace(/\d+\.\s*/, '');

	// Remove trailing period and trim
	return removeNumber.trim().replace(/\.\s*$/, '');
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	try {
		const word = params.word!.toLowerCase().trim();

		if (!word) {
			return json({ error: 'Word parameter is required', ok: false }, { status: 400 });
		}

		// Check cache first
		const [cachedWord] = await db.select().from(words).where(eq(words.word, word));

		if (cachedWord) {
			return json({
				data: cachedWord.analysis_data,
				ok: true,
				cached: true
			});
		}

		// Fetch from RAE API if not in cache
		let response = await fetch(`${RAE_API_BASE_URL}/${encodeURIComponent(word)}`);

		let wordData: RaeApiResponse = await response.json();

		// Check if the response indicates word not found (200 OK but ok: false)
		if (!wordData.ok) {
			const errorData = wordData as RaeErrorResponse;
			if (errorData.error === 'NOT_FOUND') {
				// Check if there are suggestions
				if (errorData.suggestions && errorData.suggestions.length > 0) {
					// Try the first suggestion
					const firstSuggestion = errorData.suggestions[0];
					const suggestionResponse = await fetch(
						`${RAE_API_BASE_URL}/${encodeURIComponent(firstSuggestion)}`
					);

					if (suggestionResponse.ok) {
						const suggestionData = await suggestionResponse.json();

						// If the suggestion worked, use that data
						if (suggestionData.ok) {
							wordData = suggestionData;
						} else {
							// Suggestion also failed, fall back to search API
							const searchResponse = await fetch(
								`${RAE_API_SEARCH_URL}?q=${encodeURIComponent(word)}&eng=exact`
							);

							if (!searchResponse.ok) {
								return json({ error: 'Word not found in dictionary', ok: false }, { status: 404 });
							}

							wordData = await searchResponse.json();
						}
					} else {
						// Suggestion request failed, fall back to search API
						const searchResponse = await fetch(
							`${RAE_API_SEARCH_URL}?q=${encodeURIComponent(word)}&eng=exact`
						);

						if (!searchResponse.ok) {
							return json({ error: 'Word not found in dictionary', ok: false }, { status: 404 });
						}

						wordData = await searchResponse.json();
					}
				} else {
					// No suggestions, go directly to search API
					const searchResponse = await fetch(
						`${RAE_API_SEARCH_URL}?q=${encodeURIComponent(word)}&eng=exact`
					);

					if (!searchResponse.ok) {
						return json({ error: 'Word not found in dictionary', ok: false }, { status: 404 });
					}

					wordData = await searchResponse.json();
				}
			}
		}

		// Ensure we have a valid success response
		const successData = wordData as WordAnalysisResponse;

		// Validate the response structure
		if (!successData.ok || !successData.data) {
			return json({ error: 'Invalid response from RAE API', ok: false }, { status: 502 });
		}

		// Process descriptions to remove synonyms and antonyms
		if (successData.data.meanings) {
			successData.data.meanings.forEach((meaning) => {
				if (meaning.senses) {
					meaning.senses.forEach((sense) => {
						if (sense.description) {
							sense.description = parseDescription(sense.raw);
						}
					});
				}
			});
		}

		// Cache the result
		try {
			// Always cache the originally searched word
			await db
				.insert(words)
				.values({
					word: word,
					analysis_data: successData
				})
				.onConflictDoUpdate({
					target: words.word,
					set: {
						analysis_data: successData,
						created_at: new Date()
					}
				});

			// If we got data via suggestion, also cache the actual found word
			if (successData.data?.word && successData.data.word !== word) {
				await db
					.insert(words)
					.values({
						word: successData.data.word,
						analysis_data: successData
					})
					.onConflictDoUpdate({
						target: words.word,
						set: {
							analysis_data: successData,
							created_at: new Date()
						}
					});
			}
		} catch (cacheError) {
			console.error('Error caching word data:', cacheError);
			// Continue even if caching fails
		}

		return json({
			data: successData,
			ok: true,
			cached: false
		});
	} catch (error) {
		console.error('Error fetching word definition:', error);
		return json(
			{
				error: 'Failed to fetch word definition',
				ok: false
			},
			{ status: 500 }
		);
	}
};
