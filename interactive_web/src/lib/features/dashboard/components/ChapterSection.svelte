<script lang="ts">
	import type { ChapterInfo } from '../data/curriculum';
	import PageLink from './PageLink.svelte';

	let { chapter, index }: { chapter: ChapterInfo; index: number } = $props();

	// Controls whether the section is expanded
	let isOpen = $state(true);
</script>

<section class="mb-4">
	<!-- Toggle Header -->
	<button
		class="group mb-1 flex w-full items-center gap-1.5 rounded py-1 pl-1 text-left transition-colors hover:bg-zinc-100"
		onclick={() => (isOpen = !isOpen)}
	>
		<div
			class="flex h-6 w-6 items-center justify-center transition-transform duration-200"
			class:rotate-90={isOpen}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4 text-zinc-400 group-hover:text-zinc-600"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
		</div>
		<h2 class="text-base font-bold text-zinc-800">
			Ch {index + 1}. {chapter.title}
		</h2>
	</button>

	<!-- Page Links container (indented) -->
	{#if isOpen}
		<div class="ml-1 flex flex-col gap-0.5 pl-[25px]">
			{#each chapter.pages as page}
				<PageLink {page} />
			{/each}
		</div>
	{/if}
</section>
