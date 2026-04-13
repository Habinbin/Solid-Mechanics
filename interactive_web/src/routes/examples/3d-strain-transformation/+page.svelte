<script lang="ts">
	import {
		DirectionCosineVisualizer,
		PrincipalStrainEquations,
		createTransform3DState
	} from '$lib/features/transform-3d';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	const transformState = createTransform3DState();
</script>

<svelte:head>
	<title>3D Strain Transformation - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-16 px-6 py-12">
	<div>
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			3D Strain Transformation & Principal Strains
		</h1>
		<p class="mt-4 max-w-4xl text-lg text-zinc-600">
			Explore the mathematical transformation of a 3D strain tensor to an arbitrary coordinate
			system defined by
			<strong>direction cosines</strong> ({@html k('l, m, n')}). Understand how invariant properties
			map directly from stress rules simply by replacing {@html k('\\tau_{ij}')} with {@html k(
				'\\gamma_{ij} / 2'
			)}.
		</p>
	</div>

	<!-- Direction Cosine Section -->
	<section>
		<h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-zinc-800">
			1. Direction Cosines Visualizer
		</h2>
		<DirectionCosineVisualizer state={transformState} />
	</section>

	<hr class="border-zinc-200" />

	<!-- Principal Strain Equation Section -->
	<section>
		<h2 class="mb-6 text-2xl font-bold text-zinc-800">
			2. Principal Strains & Invariants ({@html k('J_1, J_2, J_3')})
		</h2>
		<PrincipalStrainEquations state={transformState} />
	</section>
</div>
