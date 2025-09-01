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
	let div: HTMLDivElement | null = $state(null);

	let atTop = $state(false);
	let atBottom = $state(false);

	$effect(() => {
		if (!div) return;

		const handleScroll = () => {
			atTop = div!.scrollTop === 0;
			atBottom = div!.scrollTop + div!.clientHeight >= div!.scrollHeight;
		};

		div.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => {
			div!.removeEventListener('scroll', handleScroll);
		};
	});

	$inspect(atTop, atBottom);
</script>

<div class="relative prose h-[50vh] max-w-none">
	<div class="h-full overflow-scroll" bind:this={div}>
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
	<div
		class:hidden={atBottom}
		class="pointer-events-none absolute right-0 bottom-0 left-0 h-12
		bg-gradient-to-t from-base-100"
	></div>
</div>
