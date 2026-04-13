<script lang="ts">
	import type { PageInfo } from '../data/curriculum';

	let { page }: { page: PageInfo } = $props();
</script>

{#if page.disabled}
	<div
		class="flex items-center gap-3 rounded p-2 text-zinc-400 opacity-60 transition-colors select-none hover:bg-zinc-100/50"
	>
		<div class="flex h-6 w-6 items-center justify-center text-lg">{page.icon || '📄'}</div>
		<div class="flex-1">
			<span class="text-[15px] leading-none font-medium">{page.title}</span>
		</div>
		<span
			class="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500 uppercase"
			>Coming Soon</span
		>
	</div>
{:else}
	<a
		href={page.path}
		class="group flex cursor-pointer items-center gap-3 rounded p-2 transition-colors hover:bg-zinc-100 active:bg-zinc-200"
	>
		<div class="flex h-6 w-6 items-center justify-center text-lg">{page.icon || '📄'}</div>
		<div class="flex-1">
			<div class="text-[15px] leading-none font-medium text-zinc-800 group-hover:text-black">
				{page.title}
			</div>
			<div class="mt-1 line-clamp-1 text-[13px] text-zinc-500">{page.description}</div>
		</div>
	</a>
{/if}
