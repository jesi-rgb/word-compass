export interface WordConjugations {
	non_personal: {
		infinitive: string;
		participle: string;
		gerund: string;
		compound_infinitive: string;
		compound_gerund: string;
	};
	indicative: {
		present: {
			singular_first_person: string;
			singular_second_person: string;
			singular_formal_second_person: string;
			singular_third_person: string;
			plural_first_person: string;
			plural_second_person: string;
			plural_formal_second_person: string;
			plural_third_person: string;
		};
		imperfect: Record<string, string>;
		preterite: Record<string, string>;
		future: Record<string, string>;
		conditional: Record<string, string>;
	};
	subjunctive: {
		present: Record<string, string>;
		imperfect: Record<string, string>;
		future: Record<string, string>;
	};
	imperative: {
		singular_second_person: string;
		singular_formal_second_person: string;
		plural_second_person: string;
		plural_formal_second_person: string;
	};
}

export interface WordSense {
	raw: string;
	meaning_number: number;
	category: string;
	usage: string;
	description: string;
	synonyms: string[];
	antonyms: string[];
}

export interface WordMeaning {
	origin: {
		raw: string;
		type: string;
		voice: string;
		text: string;
	};
	senses: WordSense[];
	conjugations: WordConjugations;
}

export interface WordAnalysisResponse {
	data: {
		word: string;
		meanings: WordMeaning[];
	};
	ok: boolean;
}

export type RaeApiResponse = WordAnalysisResponse;

export interface Note {
	id: number;
	title: string | null;
	content: string;
	analyzed_words: any[];
	created_at: Date;
	updated_at: Date;
}

export interface CreateNoteRequest {
	title?: string;
	content: string;
}

export interface UpdateNoteRequest {
	title?: string;
	content?: string;
}
