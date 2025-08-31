<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ContextMenu, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<ContextMenu.ContentProps> & {
		children?: Snippet;
		class?: string;
	};

	let { ref = $bindable(null), children, class: className = '', ...restProps }: Props = $props();
</script>

<ContextMenu.Content bind:ref {...restProps} forceMount={true}>
	{#snippet child({ wrapperProps, props, open })}
		{#if open}
			<div {...wrapperProps}>
				<div
					{...props}
					class="z-50 min-w-32 border border-subtle bg-base-100 p-1 shadow-lg {className}"
					transition:fly={{ duration: 150, y: -8 }}
				>
					{@render children?.()}
				</div>
			</div>
		{/if}
	{/snippet}
</ContextMenu.Content>
