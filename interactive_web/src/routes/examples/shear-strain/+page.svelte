<script lang="ts">
	import { ShearVisualization, ShearControls, createShearState } from '$lib/features/shear-strain';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });
	const kd = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: true });

	const shearState = createShearState();
</script>

<svelte:head>
	<title>2D Shear Strain - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">2D Shear Strain</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Visualize how small translational displacements in orthogonal directions ({@html k('u, v')})
			create an angular deformation ({@html k('\\gamma')}), defining the engineering shear strain of
			a differential element.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls -->
		<div class="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="mb-6 text-xl font-bold text-zinc-900">Strain Control Panel</h2>
			<ShearControls state={shearState} />
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-inner"
		>
			<h3 class="mb-4 text-lg font-bold text-zinc-700">Deformation Visualization</h3>
			<ShearVisualization state={shearState} />
		</div>
	</div>

	<!-- Bottom Row: Physical Insights -->
	<div class="mt-8 rounded-2xl border-l-[6px] border-indigo-500 bg-indigo-50/50 p-8 shadow-sm">
		<h2 class="mb-6 flex items-center gap-3 text-2xl font-bold text-indigo-900">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8 w-8 text-indigo-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			Physical Insights
		</h2>

		<div class="prose prose-sm max-w-none text-indigo-900/80 prose-indigo">
			<p>
				In engineering mechanics, <strong>shear strain</strong> ({@html k('\\gamma')}) measures the
				change in angle that occurs between two line segments that were originally perpendicular to
				one another. It quantifies the distortion or "skew" of the material element.
			</p>

			<h4>Mathematical Definition</h4>
			<p>
				For small deformations, the angles {@html k('\\alpha')} and {@html k('\\beta')} are very small,
				allowing us to approximate the tangent of the angle with the angle itself (in radians).
			</p>
			<div class="my-4 border-l-4 border-indigo-300 pl-4">
				{@html kd(
					'\\gamma_{xy} = \\alpha + \\beta \\approx \\frac{\\partial v}{\\partial x} + \\frac{\\partial u}{\\partial y}'
				)}
			</div>

			<h4>Key Principles Observed</h4>
			<ul>
				<li>
					<strong>Coupled Displacements:</strong> Shear strain does not depend on rigid body
					rotation, but purely on the relative angle change. If {@html k('\\alpha = -\\beta')}, the
					strain is zero (pure rotation!).
				</li>
				<li>
					<strong>Small Angle Approximation:</strong> The mathematical derivations in solid mechanics
					rely on these deformations being infinitesimal, which allows for linearizing the geometric combinations.
				</li>
			</ul>
		</div>
	</div>
</div>
