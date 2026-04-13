<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });
	const kd = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: true });

	// State variables for stresses
	let sigma_x = $state(50);
	let sigma_y = $state(20);
	let tau_xy = $state(30);

	let svgElement = $state<SVGSVGElement>();

	const width = 400;
	const height = 400;
	const center = { x: width / 2, y: height / 2 };
	const boxSize = 120; // 2D element size

	// Scale for arrows
	let maxStress = $derived(Math.max(Math.abs(sigma_x), Math.abs(sigma_y), Math.abs(tau_xy), 1));
	let arrowScale = $derived(d3.scaleLinear().domain([0, 100]).range([0, 80]));

	function drawElement() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		// Definitions for arrow markers
		const defs = svg.append('defs');
		createMarker(defs, 'arrowhead-normal', '#ef4444'); // Red for normal
		createMarker(defs, 'arrowhead-shear', '#3b82f6'); // Blue for shear

		const g = svg.append('g');

		// Draw the 2D element box
		g.append('rect')
			.attr('x', center.x - boxSize / 2)
			.attr('y', center.y - boxSize / 2)
			.attr('width', boxSize)
			.attr('height', boxSize)
			.attr('fill', '#f4f4f5')
			.attr('stroke', '#52525b')
			.attr('stroke-width', 2);

		// Helper to draw stress arrows
		const drawArrow = (
			x1: number,
			y1: number,
			dx: number,
			dy: number,
			type: 'normal' | 'shear'
		) => {
			const length = Math.sqrt(dx * dx + dy * dy);
			if (length < 2) return;

			const color = type === 'normal' ? '#ef4444' : '#3b82f6';
			g.append('line')
				.attr('x1', x1)
				.attr('y1', y1)
				.attr('x2', x1 + dx)
				.attr('y2', y1 + dy)
				.attr('stroke', color)
				.attr('stroke-width', 3)
				.attr('marker-end', `url(#arrowhead-${type})`);
		};

		// 1. Normal Stresses (Sigma X)
		if (Math.abs(sigma_x) > 0) {
			const signX = Math.sign(sigma_x);
			const lenX = arrowScale(Math.abs(sigma_x));
			// Right face
			drawArrow(center.x + boxSize / 2, center.y, signX * lenX, 0, 'normal');
			// Left face
			drawArrow(center.x - boxSize / 2, center.y, -signX * lenX, 0, 'normal');
		}

		// 2. Normal Stresses (Sigma Y)
		if (Math.abs(sigma_y) > 0) {
			const signY = Math.sign(sigma_y);
			const lenY = arrowScale(Math.abs(sigma_y));
			drawArrow(center.x, center.y - boxSize / 2, 0, -signY * lenY, 'normal');
			drawArrow(center.x, center.y + boxSize / 2, 0, signY * lenY, 'normal');
		}

		// 3. Shear Stresses (Tau XY)
		if (Math.abs(tau_xy) > 0) {
			const signT = Math.sign(tau_xy);
			const lenT = arrowScale(Math.abs(tau_xy));
			drawArrow(center.x + boxSize / 2, center.y, 0, -signT * lenT, 'shear');
			drawArrow(center.x - boxSize / 2, center.y, 0, signT * lenT, 'shear');
			drawArrow(center.x, center.y - boxSize / 2, signT * lenT, 0, 'shear');
			drawArrow(center.x, center.y + boxSize / 2, -signT * lenT, 0, 'shear');
		}
	}

	function createMarker(defs: any, id: string, color: string) {
		defs
			.append('marker')
			.attr('id', id)
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 8)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', color);
	}

	$effect(() => {
		if (svgElement && sigma_x !== undefined) {
			drawElement();
		}
	});
</script>

<svelte:head>
	<title>2D Stress Element - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">2D Stress Element</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Manipulate normal ({@html k('\\sigma')}) and shear ({@html k('\\tau')}) stresses on an
			infinitesimal element to observe the internal force equilibrium and stress tensor matrix in
			real-time.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls -->
		<div class="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="mb-6 text-xl font-bold text-zinc-900">Stress Control Panel</h2>

			<div class="space-y-8">
				<div>
					<div class="mb-2 flex items-center justify-between">
						<label for="sigmax" class="block font-medium text-zinc-700"
							>{@html k('\\sigma_x')} (Normal X)</label
						>
						<span class="text-sm font-semibold text-red-500">{sigma_x} MPa</span>
					</div>
					<input
						id="sigmax"
						type="range"
						min="-100"
						max="100"
						bind:value={sigma_x}
						class="w-full accent-red-500"
					/>
					<div class="mt-1 flex justify-between text-sm text-zinc-500">
						<span>Compression</span>
						<span>Tension</span>
					</div>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between">
						<label for="sigmay" class="block font-medium text-zinc-700"
							>{@html k('\\sigma_y')} (Normal Y)</label
						>
						<span class="text-sm font-semibold text-red-500">{sigma_y} MPa</span>
					</div>
					<input
						id="sigmay"
						type="range"
						min="-100"
						max="100"
						bind:value={sigma_y}
						class="w-full accent-red-500"
					/>
					<div class="mt-1 flex justify-between text-sm text-zinc-500">
						<span>Compression</span>
						<span>Tension</span>
					</div>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between">
						<label for="tauxy" class="block font-medium text-zinc-700"
							>{@html k('\\tau_{xy}')} (Shear)</label
						>
						<span class="text-sm font-semibold text-blue-500">{tau_xy} MPa</span>
					</div>
					<input
						id="tauxy"
						type="range"
						min="-100"
						max="100"
						bind:value={tau_xy}
						class="w-full accent-blue-500"
					/>
				</div>
			</div>

			<div class="mt-12 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
					Stress Tensor Matrix ({@html k('\\tau_{ij}')})
				</h3>
				<div class="flex items-center justify-center font-mono text-2xl text-zinc-800">
					<span class="mr-2">[</span>
					<div class="mx-2 flex flex-col items-center gap-2 text-center">
						<div class="flex w-32 justify-between">
							<span class="w-16 whitespace-nowrap text-red-600">{sigma_x}</span>
							<span class="w-16 whitespace-nowrap text-blue-600">{tau_xy}</span>
						</div>
						<div class="flex w-32 justify-between">
							<span class="w-16 whitespace-nowrap text-blue-600">{tau_xy}</span>
							<span class="w-16 whitespace-nowrap text-red-600">{sigma_y}</span>
						</div>
					</div>
					<span class="ml-2">]</span>
				</div>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-inner"
		>
			<h3 class="mb-4 text-lg font-bold text-zinc-700">Micro-Element Visualization</h3>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<div class="mt-6 flex gap-4 text-sm">
				<div class="flex items-center">
					<span class="mr-2 h-3 w-3 rounded-full bg-red-500"></span>Normal Stress ({@html k(
						'\\sigma'
					)})
				</div>
				<div class="flex items-center">
					<span class="mr-2 h-3 w-3 rounded-full bg-blue-500"></span>Shear Stress ({@html k(
						'\\tau'
					)})
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Row: Physical Insights & Glossary -->
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
				In continuum mechanics, the internal state of stress at any point within a solid object can
				be fully described by a concept called the <strong>Stress Tensor</strong> ({@html k(
					'\\tau_{ij}'
				)}). To visualize this, we imagine an infinitesimally small coordinate-aligned cube (or
				square in 2D) centered exactly at that point.
			</p>

			<h4>Symbol Glossary</h4>
			<ul>
				<li>
					{@html k('\\sigma_x, \\sigma_y')} : <strong>Normal Stresses</strong>. Forces acting
					perpendicular to the faces. A positive value induces tension (pulling out), while a
					negative value induces compression (pushing in).
				</li>
				<li>
					{@html k('\\tau_{xy}')} : <strong>Shear Stress</strong>. Forces acting parallel to the
					faces. It represents the intensity of internal forces trying to slide structural layers
					past one another.
				</li>
			</ul>

			<h4>Key Principles Observed</h4>
			<p>
				<strong>1. Internal Force Equilibrium:</strong> Notice that when you increase {@html k(
					'\\sigma_x'
				)}, arrows emerge symmetrically on both the left and right faces. The sum of forces ({@html k(
					'\\sum F = 0'
				)}) and moments ({@html k('\\sum M = 0')}) must be zero holding this point in static
				equilibrium.
			</p>
			<p>
				<strong>2. Equality of Cross Shears:</strong> The shear stress on the right vertical face ({@html k(
					'\\tau_{xy}'
				)}) must be identically matched by the top horizontal face ({@html k('\\tau_{yx}')}) to
				prevent the element from rotating (zero net moment). Thus, the standard 2D stress tensor
				matrix is always symmetric.
			</p>
		</div>
	</div>
</div>
