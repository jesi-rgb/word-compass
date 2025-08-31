<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Note, RaeApiResponse } from '$lib/types';
	import { getWordCategoryLabel } from '$lib/categories';

	let note = $state<Note | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let hoveredWord = $state<string | null>(null);
	let wordDefinition = $state<RaeApiResponse | null>(null);
	let wordDefinitionTooltip = $state<RaeApiResponse | null>(null);
	let isLoadingDefinition = $state(false);
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
		hoveredWord = word;
		isLoadingDefinition = true;

		try {
			const response = await fetch(`/api/words/${encodeURIComponent(word)}`);
			if (response.ok) {
				const result = await response.json();
				if (result.ok && result.data) {
					// Validate that the response has the expected structure
					if (result.data.data && result.data.data.word && result.data.data.meanings) {
						wordDefinition = result.data;
					} else {
						console.warn('Invalid word definition structure:', result.data);
						wordDefinition = null;
					}
				} else {
					console.warn('Word definition not found or API error:', result.error);
					wordDefinition = null;
				}
			} else {
				console.warn('Failed to fetch word definition:', response.status);
				wordDefinition = null;
			}
		} catch (error) {
			console.error('Error fetching word definition:', error);
			wordDefinition = null;
		} finally {
			isLoadingDefinition = false;
		}
	}

	async function handleWordHover(word: string) {
		if (hoveredWord === word) return;

		hoveredWord = word;

		try {
			const response = await fetch(`/api/words/${encodeURIComponent(word)}`);
			if (response.ok) {
				const result = await response.json();
				console.log('Word data:', result);
				wordDefinitionTooltip = result.data;
			} else {
				console.warn('Failed to fetch word data:', response.status);
			}
		} catch (error) {
			console.error('Error fetching word data:', error);
		}
	}

	function handleWordLeave() {
		isLoadingDefinition = false;
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
		<div class="mx-auto max-w-4xl">
			<div class="alert alert-error">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				<span>{error}</span>
				<button class="btn btn-sm" onclick={goBack}>Go Back</button>
			</div>
		</div>
	{:else if note}
		<div class="mx-section">
			<div class="mb-6 flex items-center justify-between">
				<div class="flex flex-col gap-4">
					<button class="btn w-fit btn-sm" onclick={goBack}> Back to Notes </button>
					<div>
						{#if note.title}
							<h1 class="text-2xl font-bold">{note.title}</h1>
						{:else}
							<h1 class="font-display text-2xl font-bold">Nota #{note.id}</h1>
						{/if}
						<p class="text-sm text-subtle">Creada el {formatDate(note.created_at)}</p>
					</div>
				</div>
			</div>

			<div class="prose max-w-none">
				<div class="font-serif text-base leading-relaxed">
					{#each renderedWords as segment}
						{#if segment.type === 'word'}
							<button
								class="cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-content"
								onmouseenter={() => handleWordHover(segment.cleanWord)}
								onmouseleave={handleWordLeave}
								onclick={() => handleWordClick(segment.cleanWord)}
								tabindex="0"
							>
								{segment.text}
							</button>
						{:else}
							<span>{segment.text}</span>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}

	{#if wordDefinition}
		<div class="mt-4 w-full bg-base-200 px-section py-5">
			<div class="">
				<div class="flex items-center justify-between gap-2">
					<h4 class="mb-5 font-semibold text-primary uppercase">
						{wordDefinition?.data.word}
					</h4>
					{#if isLoadingDefinition}
						<div class="loading loading-bars"></div>
					{/if}
				</div>

				{#if wordDefinition?.data?.meanings}
					<div class="space-y-2">
						{#each wordDefinition.data.meanings as meaning, i}
							<div class="mb-7 border-l-4 border-primary pl-3">
								{#if meaning.origin}
									<div
										class="mb-5 font-noto text-sm
										font-medium text-subtle italic"
									>
										{meaning.origin.raw}
									</div>
								{/if}
								<div class="space-y-5">
									{#each meaning.senses || [] as sense, j}
										<div class="">
											<span class="text-sm text-subtle">{j + 1}.</span>
											<span
												class="text-sm
												font-semibold text-primary">{getWordCategoryLabel(sense.category) || 'Desconocido'}</span
											>
											<p class="mt-1 text-sm">
												{sense.description || 'No description available'}
											</p>
											{#if sense.synonyms?.length > 0}
												<div
													class="mt-1 pl-2 text-xs
													text-subtle"
												>
													<strong>Sinónimos:</strong>
													{sense.synonyms.join(', ')}
												</div>
											{/if}

											{#if sense.antonyms?.length > 0}
												<div
													class="mt-1 pl-2 text-xs
													text-subtle"
												>
													<strong>Antónimos:</strong>
													{sense.antonyms.join(', ')}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-sm text-error">Definition not found or error occurred</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
