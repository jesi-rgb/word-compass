<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Note, RaeApiResponse } from '$lib/types';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import NoteHeader from '$lib/components/NoteHeader.svelte';
	import NoteContent from '$lib/components/NoteContent.svelte';
	import WordDefinitionPanel from '$lib/components/WordDefinitionPanel.svelte';

	let note = $state<Note | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let wordDefinition = $state<RaeApiResponse | null>(null);
	let wordDefinitionTooltip = $state<RaeApiResponse | null>(null);
	let isLoadingDefinition = $state(false);
	let wordError = $state<string | null>(null);
	$inspect(wordDefinition);

	onMount(async () => {
		const id = page.params.id;
		if (id) {
			await loadNote(parseInt(id));
		} else {
			error = 'Invalid note ID';
			isLoading = false;
		}
	});

	async function loadNote(id: number) {
		try {
			isLoading = true;
			const response = await fetch(`/api/notes/${id}`);
			if (response.ok) {
				note = await response.json();
			} else if (response.status === 404) {
				error = 'Note not found';
			} else {
				error = 'Failed to load note';
			}
		} catch (err) {
			error = 'Error loading note';
			console.error('Error loading note:', err);
		} finally {
			isLoading = false;
		}
	}

	async function handleWordClick(word: string) {
		isLoadingDefinition = true;
		wordError = null;

		try {
			const response = await fetch(`/api/words/${encodeURIComponent(word)}`);
			if (response.ok) {
				const result = await response.json();
				if (result.ok && result.data) {
					// Validate that the response has the expected structure
					if (result.data.data && result.data.data.word && result.data.data.meanings) {
						wordDefinition = result.data;
						wordError = null;
					} else {
						console.warn('Invalid word definition structure:', result.data);
						wordDefinition = null;
						wordError = 'Estructura de definición inválida';
					}
				} else {
					console.warn('Word definition not found or API error:', result.error);
					wordDefinition = null;
					wordError = result.error || 'Palabra no encontrada en el diccionario';
				}
			} else {
				const result = await response.json().catch(() => ({}));
				console.warn('Failed to fetch word definition:', response.status);
				wordDefinition = null;
				if (response.status === 404) {
					wordError = result.error || 'Palabra no encontrada en el diccionario';
				} else {
					wordError = 'Error al buscar la palabra';
				}
			}
		} catch (error) {
			console.error('Error fetching word definition:', error);
			wordDefinition = null;
			wordError = 'Error al conectar con el diccionario';
		} finally {
			isLoadingDefinition = false;
		}
	}

	function renderTextWithHoverableWords(text: string) {
		const words = text.split(/(\s+)/);
		return words.map((segment, index) => {
			const cleanWord = segment.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
			if (cleanWord && segment.trim()) {
				return {
					type: 'word' as const,
					text: segment,
					cleanWord,
					index
				};
			}
			return {
				type: 'space' as const,
				text: segment,
				index
			};
		});
	}

	const renderedWords = $derived(note?.content ? renderTextWithHoverableWords(note.content) : []);

	function goBack() {
		goto('/');
	}

	function formatDate(dateString: string | Date): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{note?.title || 'Note'} - Word Compass</title>
</svelte:head>

<div class="">
	{#if error}
		<ErrorDisplay {error} onGoBack={goBack} />
	{:else if note}
		<div class="mx-section">
			<NoteHeader {note} onGoBack={goBack} {formatDate} />
			<NoteContent {renderedWords} onWordClick={handleWordClick} />
		</div>
	{/if}

	<WordDefinitionPanel {wordDefinition} {wordError} {isLoadingDefinition} />
</div>
