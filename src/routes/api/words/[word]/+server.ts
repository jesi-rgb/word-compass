import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { words } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RaeApiResponse } from '$lib/types';

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
		let wordData: RaeApiResponse;

		if (!response.ok) {
			if (response.status === 404) {
				// Try search API with exact match
				const searchResponse = await fetch(
					`${RAE_API_SEARCH_URL}?q=${encodeURIComponent(word)}&eng=exact`
				);

				if (!searchResponse.ok) {
					return json({ error: 'Word not found in dictionary', ok: false }, { status: 404 });
				}

				wordData = await searchResponse.json();
			} else {
				throw new Error(`RAE API responded with status: ${response.status}`);
			}
		} else {
			wordData = await response.json();
		}

		// Validate the response structure
		if (!wordData.ok || !wordData.data) {
			return json({ error: 'Invalid response from RAE API', ok: false }, { status: 502 });
		}

		// Process descriptions to remove synonyms and antonyms
		if (wordData.data.meanings) {
			wordData.data.meanings.forEach((meaning) => {
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
			await db
				.insert(words)
				.values({
					word: word,
					analysis_data: wordData
				})
				.onConflictDoUpdate({
					target: words.word,
					set: {
						analysis_data: wordData,
						created_at: new Date()
					}
				});
		} catch (cacheError) {
			console.error('Error caching word data:', cacheError);
			// Continue even if caching fails
		}

		return json({
			data: wordData,
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
