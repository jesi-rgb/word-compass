<script lang="ts">
	import type { RaeApiResponse } from '$lib/types';
	import { getWordCategoryLabel } from '$lib/categories';
	import { onMount } from 'svelte';

	type Props = {
		definition: RaeApiResponse | null;
		error?: string;
		class?: string;
	};

	let { definition, error, class: className = '' }: Props = $props();
</script>

<div class="max-w-sm border border-base-300 bg-base-100 {className}">
	<div class="p-3">
		{#if error}
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				<span class="text-xs text-error">{error}</span>
			</div>
		{:else if definition?.ok}
			<h4 class="mb-2 text-sm font-semibold text-primary uppercase">
				{definition.data.word}
			</h4>

			{#if definition.data.meanings && definition.data.meanings.length > 0}
				<div class="space-y-2">
					{#each definition.data.meanings.slice(0, 2) as meaning}
						{#if meaning.senses && meaning.senses.length > 0}
							<div class="border-l-2 border-primary pl-2">
								<div class="text-xs font-medium text-subtle">
									{getWordCategoryLabel(meaning.senses[0].category) || 'Desconocido'}
								</div>
								<p class="mt-1 text-xs">
									{meaning.senses[0].description || 'No description available'}
								</p>
							</div>
						{/if}
					{/each}
					{#if definition.data.meanings.length > 2}
						<div class="text-xs text-subtle italic">
							+{definition.data.meanings.length - 2} more meanings...
						</div>
					{/if}
				</div>
			{:else}
				<div class="text-xs text-error">Definition not available</div>
			{/if}
		{/if}
	</div>
</div>
