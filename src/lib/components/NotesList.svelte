<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Note } from '$lib/types';
	import { ContextMenu } from 'bits-ui';
	import {
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuSeparator
	} from '$lib/components/context-menu';

	let notes = $state<Note[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let deleteConfirmingIds = $state<number[]>([]);

	onMount(async () => {
		await loadNotes();
	});

	async function loadNotes() {
		try {
			isLoading = true;
			const response = await fetch('/api/notes');
			if (response.ok) {
				notes = await response.json();
			} else {
				error = 'Failed to load notes';
			}
		} catch (err) {
			error = 'Error loading notes';
			console.error('Error loading notes:', err);
		} finally {
			isLoading = false;
		}
	}

	function truncateText(text: string, maxLength: number = 150): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	}

	function formatDate(dateString: string | Date): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function createNewNote() {
		goto('/note/new');
	}

	function initiateDelete(noteId: number) {
		console.log('initiateDelete called with noteId:', noteId);
		if (!deleteConfirmingIds.includes(noteId)) {
			deleteConfirmingIds = [...deleteConfirmingIds, noteId];
		}
		console.log('deleteConfirmingIds after add:', deleteConfirmingIds);

		// Auto-cancel confirmation after 3 seconds
		setTimeout(() => {
			deleteConfirmingIds = deleteConfirmingIds.filter((id) => id !== noteId);
			console.log('Auto-cancelled delete for noteId:', noteId);
		}, 3000);
	}

	async function confirmDelete(noteId: number) {
		console.log('confirmDelete called with noteId:', noteId);
		try {
			const response = await fetch(`/api/notes/${noteId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Remove the note from the local state
				notes = notes.filter((note) => note.id !== noteId);
				deleteConfirmingIds = deleteConfirmingIds.filter((id) => id !== noteId);
				console.log('Note deleted successfully:', noteId);
			} else {
				const errorData = await response.json();
				alert(`Failed to delete note: ${errorData.error || 'Unknown error'}`);
			}
		} catch (err) {
			console.error('Error deleting note:', err);
			alert('Error deleting note. Please try again.');
		}
	}

	function cancelDelete(noteId: number) {
		console.log('cancelDelete called with noteId:', noteId);
		deleteConfirmingIds = deleteConfirmingIds.filter((id) => id !== noteId);
		console.log('deleteConfirmingIds after cancel:', deleteConfirmingIds);
	}

	function handleNoteClick(noteId: number, event: Event) {
		// Prevent navigation if the click came from the context menu
		if ((event.target as Element)?.closest('[data-context-menu-content]')) {
			return;
		}
		goto(`/note/${noteId}`);
	}
</script>

<div class="mx-auto max-w-6xl p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Word Compass</h1>
		<button class="btn btn-primary" onclick={createNewNote}>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Note
		</button>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
				/>
			</svg>
			<span>{error}</span>
			<button class="btn btn-sm" onclick={loadNotes}>Retry</button>
		</div>
	{:else if notes.length === 0}
		<div class="py-12 text-center">
			<div class="mb-4">
				<svg
					class="mx-auto h-24 w-24 text-subtle"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</div>
			<h2 class="text-xl font-semibold text-subtle">No notes yet</h2>
			<p class="mt-2 text-subtle">Create your first note to start analyzing text</p>
			<button class="btn mt-4 btn-primary" onclick={createNewNote}> Create First Note </button>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each notes as note}
				<ContextMenu.Root>
					<ContextMenu.Trigger class="w-full">
						<div
							class="card w-full cursor-pointer border
							border-subtle
							bg-base-100 transition-all hover:border-primary"
							onclick={(e) => handleNoteClick(note.id, e)}
							onkeydown={(e) => e.key === 'Enter' && goto(`/note/${note.id}`)}
							role="button"
							tabindex="0"
						>
							<div class="card-body">
								{#if note.title}
									<h3 class="card-title text-lg">{note.title}</h3>
								{/if}
								<p class="text-sm leading-relaxed">
									{truncateText(note.content)}
								</p>
								<div class="mt-4 card-actions items-center justify-between">
									<div class="text-xs text-subtle">
										{formatDate(note.created_at)}
									</div>
									{#if note.analyzed_words && note.analyzed_words.length > 0}
										<div class="badge badge-sm badge-primary">
											{note.analyzed_words.length} words analyzed
										</div>
									{/if}
								</div>
							</div>
						</div>
					</ContextMenu.Trigger>

					<ContextMenu.Portal>
						<ContextMenuContent>
							<ContextMenuItem onSelect={() => goto(`/note/${note.id}`)}>
								<svg
									class="mr-2 h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								Edit Note
							</ContextMenuItem>

							<ContextMenuItem onSelect={() => goto(`/note/${note.id}`)}>
								<svg
									class="mr-2 h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
								View Note
							</ContextMenuItem>

							<ContextMenuSeparator />

							{#if deleteConfirmingIds.includes(note.id)}
								<ContextMenuItem variant="destructive" onSelect={() => confirmDelete(note.id)}>
									<svg
										class="mr-2 h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Are you sure?
								</ContextMenuItem>
							{:else}
								<ContextMenuItem
									variant="destructive"
									onSelect={() => initiateDelete(note.id)}
									closeOnSelect={false}
								>
									<svg
										class="mr-2 h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
									Delete Note
								</ContextMenuItem>
							{/if}
						</ContextMenuContent>
					</ContextMenu.Portal>
				</ContextMenu.Root>
			{/each}
		</div>
	{/if}
</div>
