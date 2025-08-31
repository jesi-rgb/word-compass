import { pgTable, serial, varchar, text, json, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }),
	content: text('content').notNull(),
	analyzed_words: json('analyzed_words').$type<any[]>().default([]),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull()
}).enableRLS();

export const words = pgTable('words', {
	word: varchar('word', { length: 100 }).primaryKey(),
	analysis_data: json('analysis_data').$type<any>().notNull(),
	created_at: timestamp('created_at').defaultNow().notNull()
}).enableRLS();

