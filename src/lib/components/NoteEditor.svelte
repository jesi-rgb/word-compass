<script lang="ts">
	import type { Note } from '$lib/types';
	import { goto } from '$app/navigation';

	let content = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!content.trim()) return;

		isSubmitting = true;
		try {
			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: content.trim()
				})
			});

			if (response.ok) {
				const note: Note = await response.json();
				goto(`/note/${note.id}`);
			} else {
				console.error('Failed to save note');
			}
		} catch (error) {
			console.error('Error saving note:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSubmit();
	}}
	class="space-y-4"
>
	<div class="form-control flex flex-col">
		<label for="content" class="label">
			<span class="label-text">Paste your text here</span>
		</label>
		<textarea
			id="content"
			bind:value={content}
			class="textarea-bordered textarea h-32 w-full"
			placeholder="Enter the text you want to analyze..."
			required
		></textarea>
	</div>

	<div class="flex justify-end">
		<button type="submit" class="btn btn-primary" disabled={!content.trim() || isSubmitting}>
			{#if isSubmitting}
				<span class="loading loading-sm loading-spinner"></span>
				Saving...
			{:else}
				Create Note
			{/if}
		</button>
	</div>
</form>
