<script lang="ts">
	import type { RaeApiResponse } from '$lib/types';
	import { getWordCategoryLabel } from '$lib/categories';

	interface Props {
		wordDefinition: RaeApiResponse | null;
		wordError: string | null;
		isLoadingDefinition: boolean;
	}

	let { wordDefinition, wordError, isLoadingDefinition }: Props = $props();
</script>

{#if wordDefinition || wordError || isLoadingDefinition}
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

			{#if wordError}
				<div class="rounded-md border border-error/20 bg-error/10 p-4">
					<div class="flex items-center gap-2">
						<svg class="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
						<span class="text-sm font-medium text-error">{wordError}</span>
					</div>
				</div>
			{:else if wordDefinition?.data?.meanings}
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
			{:else if !isLoadingDefinition}
				<div class="text-sm text-error">Definition not found or error occurred</div>
			{/if}
		</div>
	</div>
{/if}
