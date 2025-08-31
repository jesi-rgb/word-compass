export const WORD_CATEGORIES = {
	noun: 'Sustantivo',
	verb: 'Verbo',
	adjective: 'Adjetivo',
	adverb: 'Adverbio',
	pronoun: 'Pronombre',
	article: 'Artículo',
	preposition: 'Preposición',
	conjunction: 'Conjunción',
	interjection: 'Interjección'
} as const;

export const USAGE_CATEGORIES = {
	common: 'Uso común',
	rare: 'Uso poco común',
	outdated: 'Anticuado',
	colloquial: 'Coloquial',
	obsolete: 'En desuso'
} as const;

export type WordCategory = keyof typeof WORD_CATEGORIES;
export type UsageCategory = keyof typeof USAGE_CATEGORIES;

export function getWordCategoryLabel(category: string): string {
	return WORD_CATEGORIES[category as WordCategory] || category;
}

export function getUsageCategoryLabel(usage: string): string {
	return USAGE_CATEGORIES[usage as UsageCategory] || usage;
}
