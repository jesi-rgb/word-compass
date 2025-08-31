import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes, words } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RaeApiResponse } from '$lib/types';

const RAE_API_BASE_URL = 'https://rae-api.com/api/words';

// Common Spanish stop words to filter out
const SPANISH_STOPWORDS = new Set([
	'el',
	'la',
	'de',
	'que',
	'y',
	'a',
	'en',
	'un',
	'es',
	'se',
	'no',
	'te',
	'lo',
	'le',
	'da',
	'su',
	'por',
	'son',
	'con',
	'para',
	'como',
	'las',
	'del',
	'los',
	'una',
	'al',
	'todo',
	'esta',
	'son',
	'me',
	'uno',
	'tiene',
	'más',
	'si',
	'ya',
	'muy',
	'dos',
	'tres',
	'han',
	'bien',
	'pero',
	'ese',
	'esa',
	'esto',
	'nos',
	'ser',
	'sobre',
	'hasta',
	'hace',
	'tan',
	'sin',
	'otro',
	'otra',
	'vez',
	'años',
	'tiempo',
	'donde',
	'cuando',
	'aunque',
	'quien',
	'cual',
	'porque',
	'mismo',
	'misma',
	'también',
	'entonces',
	'después',
	'antes',
	'desde',
	'hacia',
	'entre',
	'contra',
	'durante'
]);

// Enhanced function to extract meaningful Spanish words from text
function extractWords(text: string): string[] {
	// Normalize and clean the text while preserving Spanish characters
	const wordsArray = text
		.toLowerCase()
		.normalize('NFD') // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove accent marks for normalization
		.replace(/[^\w\sáéíóúñüç]/g, ' ') // Keep Spanish characters including ñ and ç
		.split(/\s+/)
		.filter((word) => {
			// Filter out very short words, numbers, and stop words
			return word.length > 2 && !SPANISH_STOPWORDS.has(word) && !/^\d+$/.test(word);
		});

	// Remove duplicates
	return [...new Set(wordsArray)];
}

async function fetchWordDefinition(word: string): Promise<RaeApiResponse | null> {
	try {
		// Check cache first
		const [cachedWord] = await db.select().from(words).where(eq(words.word, word));

		if (cachedWord) {
			return cachedWord.analysis_data as RaeApiResponse;
		}

		// Fetch from RAE API
		const response = await fetch(`${RAE_API_BASE_URL}/${encodeURIComponent(word)}`);

		if (!response.ok) {
			return null;
		}

		const wordData: RaeApiResponse = await response.json();

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
			console.error('Error guardando palabra en caché:', cacheError);
		}

		return wordData;
	} catch (error) {
		console.error(`Error obteniendo definición para la palabra "${word}":`, error);
		return null;
	}
}

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const noteId = parseInt(params.id!);
		if (isNaN(noteId)) {
			return json({ error: 'ID de nota inválido', ok: false }, { status: 400 });
		}

		// Get the note
		const [note] = await db.select().from(notes).where(eq(notes.id, noteId));

		if (!note) {
			return json({ error: 'Nota no encontrada', ok: false }, { status: 404 });
		}

		// Get optional words list from request body
		const body = await request.json().catch(() => ({}));
		const requestedWords: string[] = body.words || [];

		// Extract words from content if no specific words requested
		const wordsToAnalyze =
			requestedWords.length > 0
				? requestedWords.map((w) => w.toLowerCase().trim())
				: extractWords(note.content);

		// Fetch definitions for all words
		const analyzedWords: any[] = [];
		const batchSize = 5; // Process words in batches to avoid overwhelming the API

		for (let i = 0; i < wordsToAnalyze.length; i += batchSize) {
			const batch = wordsToAnalyze.slice(i, i + batchSize);
			const batchPromises = batch.map((word) => fetchWordDefinition(word));
			const batchResults = await Promise.all(batchPromises);

			batch.forEach((word, index) => {
				const definition = batchResults[index];
				if (definition && definition.ok) {
					analyzedWords.push({
						word,
						definition
					});
				}
			});

			// Small delay between batches to be respectful to the API
			if (i + batchSize < wordsToAnalyze.length) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		// Update the note with analyzed words
		const [updatedNote] = await db
			.update(notes)
			.set({
				analyzed_words: analyzedWords,
				updated_at: new Date()
			})
			.where(eq(notes.id, noteId))
			.returning();

		return json({
			data: {
				note: updatedNote,
				analyzed_count: analyzedWords.length,
				total_words: wordsToAnalyze.length,
				message: `Se analizaron ${analyzedWords.length} de ${wordsToAnalyze.length} palabras encontradas`
			},
			ok: true,
			mensaje: 'Análisis completado exitosamente'
		});
	} catch (error) {
		console.error('Error analizando nota:', error);
		return json({ error: 'Error al analizar la nota', ok: false }, { status: 500 });
	}
};
