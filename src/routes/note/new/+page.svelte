<script lang="ts">
	import { goto } from '$app/navigation';
	import NoteEditor from '$lib/components/NoteEditor.svelte';

	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Create New Note - Word Compass</title>
</svelte:head>

<div class="px-section py-section">
	<div class="mb-6 flex flex-col gap-4">
		<button class="btn w-fit btn-ghost btn-sm" onclick={goBack}>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Notes
		</button>
		<h1 class="font-display text-2xl font-bold">Create New Note</h1>
	</div>
	<NoteEditor />
</div>
