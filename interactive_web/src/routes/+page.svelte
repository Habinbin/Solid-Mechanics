<script lang="ts">
	import { ChapterSection, curriculumData } from '$lib/features/dashboard';
</script>

<div
	class="flex min-h-screen justify-center bg-white font-sans text-zinc-900 selection:bg-zinc-200"
>
	<div class="w-full max-w-3xl px-6 py-20">
		<header class="mb-16">
			<div class="mb-4 text-6xl">📚</div>
			<h1 class="mb-3 text-4xl font-extrabold tracking-tight text-zinc-900">
				Solid Mechanics Interactive
			</h1>
			<p class="text-[15px] leading-relaxed text-zinc-500">
				고체역학의 핵심 개념인 응력(Stress)과 변형률(Strain), 그리고 이들의 변환 과정을 인터랙티브
				시뮬레이션을 통해 직관적으로 탐구하는 교육 플랫폼입니다.
			</p>
		</header>

		<main class="border-t border-zinc-100 pt-8">
			{#each curriculumData as chapter, i}
				<ChapterSection {chapter} index={i} />
			{/each}
		</main>
	</div>
</div>
