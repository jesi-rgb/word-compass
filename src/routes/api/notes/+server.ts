import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { notes } from '$lib/server/db/schema.js';
import type { CreateNoteRequest } from '$lib/types.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
	try {
		const allNotes = await db.select().from(notes).orderBy(notes.created_at);
		return json(allNotes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		return json({ error: 'Failed to fetch notes' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: CreateNoteRequest = await request.json();

		if (!body.content) {
			return json({ error: 'Content is required' }, { status: 400 });
		}

		const [newNote] = await db
			.insert(notes)
			.values({
				title: body.title || null,
				content: body.content,
				analyzed_words: [],
				updated_at: new Date()
			})
			.returning();

		return json(newNote, { status: 201 });
	} catch (error) {
		console.error('Error creating note:', error);
		return json({ error: 'Failed to create note' }, { status: 500 });
	}
};
