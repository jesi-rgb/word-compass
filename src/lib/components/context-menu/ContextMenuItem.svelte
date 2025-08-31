<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ContextMenu, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<ContextMenu.ItemProps> & {
		children?: Snippet;
		class?: string;
		variant?: 'default' | 'destructive';
	};

	let {
		ref = $bindable(null),
		children,
		class: className = '',
		variant = 'default',
		onSelect,
		...restProps
	}: Props = $props();

	const variantClasses = {
		default: 'focus:bg-primary focus:text-accent-content',
		destructive: 'focus:bg-error focus:text-error-content text-error'
	};
</script>

<ContextMenu.Item
	bind:ref
	{...restProps}
	{onSelect}
	class="relative flex cursor-default items-center px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 {variantClasses[
		variant
	]} {className}"
>
	{@render children?.()}
</ContextMenu.Item>
