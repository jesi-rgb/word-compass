<script lang="ts">
	interface RenderedWord {
		type: 'word' | 'space';
		text: string;
		cleanWord?: string;
		index: number;
	}

	interface Props {
		renderedWords: RenderedWord[];
		onWordClick: (word: string) => void;
	}

	let { renderedWords, onWordClick }: Props = $props();
</script>

<div class="prose h-[50vh] max-w-none overflow-scroll">
	<div class="font-serif text-base leading-relaxed">
		{#each renderedWords as segment}
			{#if segment.type === 'word'}
				<button
					class="cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-content"
					onclick={() => onWordClick(segment.cleanWord!)}
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
