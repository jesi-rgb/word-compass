import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { notes } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { UpdateNoteRequest } from '$lib/types.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const noteId = parseInt(params.id!);
		if (isNaN(noteId)) {
			return json({ error: 'Invalid note ID' }, { status: 400 });
		}

		const [note] = await db.select().from(notes).where(eq(notes.id, noteId));

		if (!note) {
			return json({ error: 'Note not found' }, { status: 404 });
		}

		return json(note);
	} catch (error) {
		console.error('Error fetching note:', error);
		return json({ error: 'Failed to fetch note' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const noteId = parseInt(params.id!);
		if (isNaN(noteId)) {
			return json({ error: 'Invalid note ID' }, { status: 400 });
		}

		const body: UpdateNoteRequest = await request.json();

		const [updatedNote] = await db
			.update(notes)
			.set({
				...(body.title !== undefined && { title: body.title }),
				...(body.content !== undefined && { content: body.content }),
				updated_at: new Date()
			})
			.where(eq(notes.id, noteId))
			.returning();

		if (!updatedNote) {
			return json({ error: 'Note not found' }, { status: 404 });
		}

		return json(updatedNote);
	} catch (error) {
		console.error('Error updating note:', error);
		return json({ error: 'Failed to update note' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const noteId = parseInt(params.id!);
		if (isNaN(noteId)) {
			return json({ error: 'Invalid note ID' }, { status: 400 });
		}

		const [deletedNote] = await db.delete(notes).where(eq(notes.id, noteId)).returning();

		if (!deletedNote) {
			return json({ error: 'Note not found' }, { status: 404 });
		}

		return json({ message: 'Note deleted successfully', note: deletedNote });
	} catch (error) {
		console.error('Error deleting note:', error);
		return json({ error: 'Failed to delete note' }, { status: 500 });
	}
};
