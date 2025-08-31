<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="mx-auto my-10 max-w-4xl md:mx-0 md:my-20 md:w-full">
	{@render children?.()}
</main>
