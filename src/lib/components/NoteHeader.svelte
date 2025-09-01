<script lang="ts">
	import type { Note } from '$lib/types';

	interface Props {
		note: Note;
		onGoBack: () => void;
		formatDate: (date: string | Date) => string;
	}

	let { note, onGoBack, formatDate }: Props = $props();
</script>

<div class="mb-6 flex items-center justify-between">
	<div class="flex flex-col gap-4">
		<button class="btn w-fit btn-sm" onclick={onGoBack}> Back to Notes </button>
		<div>
			{#if note.title}
				<h1 class="text-2xl font-bold">{note.title}</h1>
			{:else}
				<h1 class="font-display text-2xl font-bold">Nota #{note.id}</h1>
			{/if}
			<p class="text-sm text-subtle">Creada el {formatDate(note.created_at)}</p>
		</div>
	</div>
</div>
