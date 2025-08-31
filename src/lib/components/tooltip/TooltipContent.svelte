<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Tooltip, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<Tooltip.ContentProps> & {
		content?: Snippet;
		side?: 'top' | 'bottom' | 'left' | 'right';
		sideOffset?: number;
		class?: string;
		children: Snippet;
	};

	let {
		ref = $bindable(null),
		children,
		side = 'top',
		sideOffset = 8,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<Tooltip.Content bind:ref {side} {sideOffset} {...restProps} forceMount={true}>
	{#snippet child({ wrapperProps, props, open })}
		{#if open}
			<div {...wrapperProps}>
				<div
					{...props}
					class="z-50 overflow-hidden rounded-md bg-base-300 px-3 py-1.5 text-xs shadow-md {className}"
					transition:fly={{
						duration: 150,
						y: side === 'top' ? 8 : side === 'bottom' ? -8 : 0,
						x: side === 'left' ? 8 : side === 'right' ? -8 : 0
					}}
				>
					{@render children?.()}
				</div>
			</div>
		{/if}
	{/snippet}
</Tooltip.Content>
