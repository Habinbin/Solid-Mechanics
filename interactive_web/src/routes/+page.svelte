<script lang="ts">
	// Dashboard minimalist page for Solid Mechanics
</script>

<div class="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-200">
	<div class="mx-auto max-w-5xl px-6 py-20 lg:px-8">
		<header class="mt-12 mb-24">
			<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
				고체역학 (Solid Mechanics)
			</h1>
			<p class="max-w-3xl text-xl leading-relaxed font-light text-zinc-500">
				재료의 거동과 내부 응력을 시각적으로 탐구할 수 있는 대화형 학술 플랫폼입니다. 물리적 변수를 실시간으로 조작하여 고체 내부의 응력 상태와 변환 원리에 대한 깊은 통찰력을 얻어보세요.
			</p>
		</header>

		<div class="space-y-4">
			<h2 class="mb-8 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
				대화형 시각화 도구
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Stress Element Card -->
				<a
					href="/examples/stress-element"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">
							2D 응력 요소 (Stress Element)
						</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						2D 미소 요소에 작용하는 수직 응력(Normal stress)과 전단 응력(Shear stress)을 실시간으로 조정하며 내부 힘의 평형과 응력 텐서를 시각적으로 확인합니다.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>응력 텐서</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>벡터 시각화</span
						>
					</div>
				</a>

				<!-- Mohr's Circle Card -->
				<a
					href="/examples/mohrs-circle"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">
							모어의 원 (Mohr's Circle)
						</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						절단면의 각도 변화에 따른 응력의 변환(Stress Transformation)을 관찰하고 주응력(Principal stress)과 최대 전단 응력을 모어의 원을 통해 직관적으로 해석합니다.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>응력 변환</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>모어의 원</span
						>
					</div>
				</a>
			</div>
		</div>
	</div>
</div>
