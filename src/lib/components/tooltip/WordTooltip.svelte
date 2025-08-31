<script lang="ts">
	import type { RaeApiResponse } from '$lib/types';
	import { getWordCategoryLabel } from '$lib/categories';
	import { onMount } from 'svelte';

	type Props = {
		definition: RaeApiResponse;
		class?: string;
	};

	let { definition, class: className = '' }: Props = $props();
</script>

<div class="max-w-sm border border-base-300 bg-base-100 {className}">
	<div class="p-3">
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
	</div>
</div>
