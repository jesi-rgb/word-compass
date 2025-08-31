<script lang="ts">
	import { ContextMenu, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<ContextMenu.SeparatorProps> & {
		class?: string;
	};

	let { ref = $bindable(null), class: className = '', ...restProps }: Props = $props();
</script>

<ContextMenu.Separator bind:ref {...restProps} class="divider my-0 px-5" />
