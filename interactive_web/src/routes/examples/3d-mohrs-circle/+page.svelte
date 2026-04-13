<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	// Raw inputs from user
	let v1 = $state(100);
	let v2 = $state(40);
	let v3 = $state(-60);

	// Derived sorted principal stresses
	let sortedStresses = $derived([v1, v2, v3].sort((a, b) => b - a)); // Descending
	let S1 = $derived(sortedStresses[0]);
	let S2 = $derived(sortedStresses[1]);
	let S3 = $derived(sortedStresses[2]);

	let cubeSvgElement = $state<SVGSVGElement>();
	let chartSvgElement = $state<SVGSVGElement>();

	const colors = {
		S1: '#ef4444', // Red
		S2: '#10b981', // Emerald
		S3: '#3b82f6', // Blue
		base: '#e4e4e7', // Zinc-200
		dark: '#18181b', // Zinc-900
		purple: '#9333ea' // Purple-600
	};

	function drawCube() {
		if (!cubeSvgElement) return;
		const svg = d3.select(cubeSvgElement);
		svg.selectAll('*').remove();

		// Dimensions
		const L = 80;
		const dx = L * Math.cos(Math.PI / 6); // 86.6
		const dy = L * Math.sin(Math.PI / 6); // 50

		const width = 400;
		const height = 350;
		const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2 + 50})`);

		// Draw faces
		// 1. Top face (+y normal) - maps to S2 in our viz
		g.append('polygon')
			.attr('points', `0,0 ${dx},${dy - L} 0,${-L} ${-dx},${dy - L}`)
			.attr('fill', '#f4f4f5')
			.attr('stroke', '#a1a1aa')
			.attr('stroke-width', 1.5)
			.attr('stroke-linejoin', 'round');

		// 2. Right face (+x normal) - maps to S1
		g.append('polygon')
			.attr('points', `0,0 ${dx},${dy} ${dx},${dy - L} 0,${-L}`)
			.attr('fill', '#e4e4e7')
			.attr('stroke', '#a1a1aa')
			.attr('stroke-width', 1.5)
			.attr('stroke-linejoin', 'round');

		// 3. Left face (+z normal) - maps to S3
		g.append('polygon')
			.attr('points', `0,0 ${-dx},${dy} ${-dx},${dy - L} 0,${-L}`)
			.attr('fill', '#d4d4d8')
			.attr('stroke', '#a1a1aa')
			.attr('stroke-width', 1.5)
			.attr('stroke-linejoin', 'round');

		// Defs for arrows
		const defs = svg.append('defs');
		['S1', 'S2', 'S3'].forEach((name) => {
			const color = colors[name as keyof typeof colors];
			defs
				.append('marker')
				.attr('id', `arrow-${name}`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 8)
				.attr('refY', 0)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', color);
			// Negative arrows (pointing inward to the surface)
			defs
				.append('marker')
				.attr('id', `arrow-${name}-inv`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 2)
				.attr('refY', 0)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M10,-5L0,0L10,5')
				.attr('fill', color);
		});

		// Helper to draw forces
		const drawForce = (
			cx: number,
			cy: number,
			nx: number,
			ny: number,
			mag: number,
			name: string,
			label: string
		) => {
			if (Math.abs(mag) < 1) return;
			const isTensile = mag >= 0;
			const length = 20 + Math.abs(mag) * 0.5; // Scale force length
			const vx = nx * length;
			const vy = ny * length;

			const color = colors[name as keyof typeof colors];

			if (isTensile) {
				g.append('line')
					.attr('x1', cx)
					.attr('y1', cy)
					.attr('x2', cx + vx)
					.attr('y2', cy + vy)
					.attr('stroke', color)
					.attr('stroke-width', 3)
					.attr('marker-end', `url(#arrow-${name})`);
				g.append('text')
					.attr('x', cx + vx + nx * 15)
					.attr('y', cy + vy + ny * 15 + 5)
					.attr('text-anchor', 'middle')
					.attr('fill', color)
					.attr('font-weight', 'bold')
					.attr('font-size', '14px')
					.html(label);
			} else {
				// Compressive
				g.append('line')
					.attr('x1', cx + vx)
					.attr('y1', cy + vy)
					.attr('x2', cx)
					.attr('y2', cy)
					.attr('stroke', color)
					.attr('stroke-width', 3)
					.attr('marker-end', `url(#arrow-${name})`);
				g.append('text')
					.attr('x', cx + vx + nx * 15)
					.attr('y', cy + vy + ny * 15 + 5)
					.attr('text-anchor', 'middle')
					.attr('fill', color)
					.attr('font-weight', 'bold')
					.attr('font-size', '14px')
					.html(label);
			}
		};

		// 1. Right Face (+x normal) -> S1
		drawForce(
			dx / 2,
			L / 4,
			Math.cos(Math.PI / 6),
			Math.sin(Math.PI / 6),
			S1,
			'S1',
			'σ<tspan dy="4" font-size="10px">1</tspan>'
		);

		// 2. Top Face (+y normal) -> S2
		drawForce(0, -L / 2, 0, -1, S2, 'S2', 'σ<tspan dy="4" font-size="10px">2</tspan>');

		// 3. Left Face (+z normal) -> S3
		drawForce(
			-dx / 2,
			L / 4,
			-Math.cos(Math.PI / 6),
			Math.sin(Math.PI / 6),
			S3,
			'S3',
			'σ<tspan dy="4" font-size="10px">3</tspan>'
		);
	}

	function drawChart() {
		if (!chartSvgElement) return;
		const svg = d3.select(chartSvgElement);
		svg.selectAll('*').remove();

		const margin = { top: 40, right: 40, bottom: 50, left: 60 };
		const w = 500 - margin.left - margin.right;
		const h = 400 - margin.top - margin.bottom;

		const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

		// X Scale (Normal stress) depends on Max/Min principals
		const max_abs_stress = Math.max(Math.abs(S1), Math.abs(S2), Math.abs(S3), 20);
		// Maintain 1:1 aspect ratio!
		const xDomain = [Math.min(-120, S3 - 20), Math.max(120, S1 + 20)];
		const span_x = xDomain[1] - xDomain[0];

		// For 1:1 aspect ratio, span_y / h = span_x / w
		const span_y = span_x * (h / w);
		const yDomain = [-span_y / 2, span_y / 2];

		const xScale = d3.scaleLinear().domain(xDomain).range([0, w]);
		const yScale = d3.scaleLinear().domain(yDomain).range([h, 0]);

		// Transform a radius in units to SVG distance
		const rScale = (r: number) => xScale(r) - xScale(0);

		// Axes
		const xAxis = d3.axisBottom(xScale).ticks(8);
		const yAxis = d3.axisLeft(yScale).ticks(6);

		g.append('g')
			.attr('transform', `translate(0, ${yScale(0)})`) // Center line
			.call(xAxis)
			.attr('font-size', '12px');
		g.append('g')
			.attr('transform', `translate(${xScale(0)}, 0)`) // Zero vertical
			.call(yAxis)
			.attr('font-size', '12px');

		g.append('text')
			.attr('x', w / 2)
			.attr('y', h + 40)
			.attr('text-anchor', 'middle')
			.text('Normal Stress σ (MPa)')
			.attr('fill', '#52525b')
			.attr('font-weight', '500');
		g.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -h / 2)
			.attr('y', -40)
			.attr('text-anchor', 'middle')
			.text('Shear Stress τ (MPa)')
			.attr('fill', '#52525b')
			.attr('font-weight', '500');

		// Centers and Radii
		const C1 = (S2 + S3) / 2;
		const R1 = Math.abs(S2 - S3) / 2;

		const C2 = (S1 + S3) / 2;
		const R2 = Math.abs(S1 - S3) / 2;

		const C3 = (S1 + S2) / 2;
		const R3 = Math.abs(S1 - S2) / 2;

		// Generating SVG path for the shaded region (EvenOdd fill rule trick)
		// Draw Outer circle (R2), then inner circles (R1, R3).
		const makeArcData = (c: number, r: number) => {
			if (r === 0) return '';
			// Draw full circle path
			return `M ${xScale(c - r)} ${yScale(0)} 
					a ${rScale(r)} ${rScale(r)} 0 1 0 ${rScale(r) * 2} 0 
					a ${rScale(r)} ${rScale(r)} 0 1 0 -${rScale(r) * 2} 0 `;
		};

		const combinedPath = makeArcData(C2, R2) + makeArcData(C1, R1) + makeArcData(C3, R3);

		g.append('path')
			.attr('d', combinedPath)
			.attr('fill', '#e4e4e7')
			.attr('fill-rule', 'evenodd')
			.attr('opacity', 0.8)
			.attr('stroke', 'none');

		// Outer Borders
		const addCircle = (c: number, r: number, color: string) => {
			if (r < 0.1) return;
			g.append('circle')
				.attr('cx', xScale(c))
				.attr('cy', yScale(0))
				.attr('r', rScale(r))
				.attr('fill', 'none')
				.attr('stroke', color)
				.attr('stroke-width', 2);
		};

		addCircle(C2, R2, '#18181b'); // C2 (Largest)
		addCircle(C1, R1, '#10b981'); // C1 (Between S2 and S3)
		addCircle(C3, R3, '#3b82f6'); // C3 (Between S1 and S2)

		// Principal Stresses Points
		[
			{ val: S1, label: 'σ<tspan dy="4" font-size="10px">1</tspan>', c: colors.S1 },
			{ val: S2, label: 'σ<tspan dy="4" font-size="10px">2</tspan>', c: colors.S2 },
			{ val: S3, label: 'σ<tspan dy="4" font-size="10px">3</tspan>', c: colors.S3 }
		].forEach((p) => {
			g.append('circle')
				.attr('cx', xScale(p.val))
				.attr('cy', yScale(0))
				.attr('r', 5)
				.attr('fill', p.c);
			g.append('text')
				.attr('x', xScale(p.val))
				.attr('y', yScale(0) - 10)
				.attr('text-anchor', 'middle')
				.html(p.label)
				.attr('fill', p.c)
				.attr('font-size', '14px')
				.attr('font-weight', 'bold');
		});

		// Absolute Max Shear Marker
		g.append('circle')
			.attr('cx', xScale(C2))
			.attr('cy', yScale(R2))
			.attr('r', 5)
			.attr('fill', colors.purple);

		g.append('line')
			.attr('x1', xScale(C2))
			.attr('x2', xScale(C2))
			.attr('y1', yScale(0))
			.attr('y2', yScale(R2))
			.attr('stroke', colors.purple)
			.attr('stroke-dasharray', '4,4');

		g.append('text')
			.attr('x', xScale(C2))
			.attr('y', yScale(R2) - 10)
			.attr('text-anchor', 'middle')
			.html('τ<tspan dy="4" font-size="10px">max</tspan>')
			.attr('fill', colors.purple)
			.attr('font-size', '14px')
			.attr('font-weight', 'bold');
	}

	function getSliderStyle(val: number, min: number, max: number, color: string) {
		const span = max - min;
		const zeroPct = ((0 - min) / span) * 100;
		const valPct = ((val - min) / span) * 100;
		const start = Math.min(zeroPct, valPct);
		const end = Math.max(zeroPct, valPct);
		return `--track-bg: linear-gradient(to right, #e4e4e7 0%, #e4e4e7 ${start}%, ${color} ${start}%, ${color} ${end}%, #e4e4e7 ${end}%, #e4e4e7 100%); --thumb-color: ${color};`;
	}

	$effect(() => {
		if (cubeSvgElement && S1 !== undefined) {
			drawCube();
		}
		if (chartSvgElement && S1 !== undefined) {
			drawChart();
		}
	});
</script>

<svelte:head>
	<title>3D Mohr's Circle - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">3D Mohr's Circle</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Visualize principal stresses in three dimensions and discover the safe zone for all possible
			cross-sectional stress combinations.
		</p>
	</div>

	<div
		class="mb-12 grid grid-cols-1 gap-8 rounded-2xl border border-blue-200 bg-blue-50 p-8 shadow-sm lg:grid-cols-2"
	>
		<div class="flex flex-col justify-center">
			<h2 class="mb-4 flex items-center gap-2 text-2xl font-bold text-blue-900">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-blue-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
				Understanding 3D Intersecting Circles
			</h2>
			<div class="prose prose-sm text-blue-900/80">
				<p>
					In a complete three-dimensional state of stress, there are three mutually orthogonal
					planes free of shear stress. The normal stresses acting on these planes are the <strong
						>Principal Stresses</strong
					>
					{@html k('(\\sigma_1, \\sigma_2, \\sigma_3)')}, where conventionally {@html k(
						'\\sigma_1 \\ge \\sigma_2 \\ge \\sigma_3'
					)}.
				</p>
				<p>
					Any arbitrary plane cutting through this 3D element will experience a combination of
					normal ({@html k('\\sigma')}) and shear ({@html k('\\tau')}) stresses. Interestingly, if
					we plot these stress coordinates, they will
					<strong>never escape the shaded boundary</strong> perfectly enclosed by three interconnected
					Mohr's circles!
				</p>
				<ul class="rounded-lg border border-blue-200 bg-white/50 p-4 font-mono shadow-inner">
					<li>{@html k('\\tau_{max, abs} = \\frac{\\sigma_1 - \\sigma_3}{2}')}</li>
				</ul>
				<p class="mt-4">
					Using the sliders below, adjust three arbitrary stress inputs. They are <strong
						>automatically sorted</strong
					>
					into {@html k('\\sigma_1, \\sigma_2, \\sigma_3')} to satisfy the physical convention.
				</p>
			</div>
		</div>
		<div
			class="flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-4 shadow-inner"
		>
			<!-- 3D Cube -->
			<svg bind:this={cubeSvgElement} width="400" height="350" class="overflow-visible select-none"
			></svg>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
		<!-- Controls -->
		<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">Principal Stresses</h2>
			<p class="mb-6 text-sm text-zinc-500">
				Values are automatically sorted into {@html k('\\sigma_1, \\sigma_2, \\sigma_3')}.
			</p>

			<div>
				<label for="v1" class="block text-sm font-medium text-zinc-700">Input A = {v1} MPa</label>
				<input
					id="v1"
					type="range"
					min="-100"
					max="100"
					bind:value={v1}
					class="bidirectional mt-2 w-full"
					style={getSliderStyle(v1, -100, 100, '#a1a1aa')}
				/>
			</div>
			<div>
				<label for="v2" class="block text-sm font-medium text-zinc-700">Input B = {v2} MPa</label>
				<input
					id="v2"
					type="range"
					min="-100"
					max="100"
					bind:value={v2}
					class="bidirectional mt-2 w-full"
					style={getSliderStyle(v2, -100, 100, '#a1a1aa')}
				/>
			</div>
			<div>
				<label for="v3" class="block text-sm font-medium text-zinc-700">Input C = {v3} MPa</label>
				<input
					id="v3"
					type="range"
					min="-100"
					max="100"
					bind:value={v3}
					class="bidirectional mt-2 w-full"
					style={getSliderStyle(v3, -100, 100, '#a1a1aa')}
				/>
			</div>

			<div class="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
				<h3 class="mb-3 text-sm font-bold text-zinc-900">Sorted Principal Stresses</h3>
				<ul class="space-y-2 font-mono text-sm">
					<li class="flex items-center justify-between">
						<span class="font-bold text-red-500">{@html k('\\sigma_1')}</span> <span>{S1} MPa</span>
					</li>
					<li class="flex items-center justify-between">
						<span class="font-bold text-emerald-500">{@html k('\\sigma_2')}</span>
						<span>{S2} MPa</span>
					</li>
					<li class="flex items-center justify-between">
						<span class="font-bold text-blue-500">{@html k('\\sigma_3')}</span>
						<span>{S3} MPa</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- D3 Chart -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
		>
			<h2 class="mb-4 w-full text-left text-2xl font-bold text-zinc-900">
				3D Intersecting Circles Map
			</h2>
			<div class="relative flex w-full flex-grow items-center justify-center">
				<svg
					bind:this={chartSvgElement}
					width="500"
					height="400"
					class="overflow-visible select-none"
				></svg>
			</div>
		</div>
	</div>
</div>

<style>
	input[type='range'].bidirectional {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
	}
	input[type='range'].bidirectional::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--thumb-color, #a1a1aa);
		cursor: pointer;
		margin-top: -6px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	input[type='range'].bidirectional::-webkit-slider-runnable-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		border-radius: 2px;
		background: var(--track-bg, #e4e4e7);
	}
	input[type='range'].bidirectional::-moz-range-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--thumb-color, #a1a1aa);
		cursor: pointer;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	input[type='range'].bidirectional::-moz-range-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		border-radius: 2px;
		background: var(--track-bg, #e4e4e7);
	}
</style>
