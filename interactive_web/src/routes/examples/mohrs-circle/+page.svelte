<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	// Input State
	let sigma_x = $state(50);
	let sigma_y = $state(-10);
	let tau_xy = $state(40);
	let theta_deg = $state(0); // Cut plane angle in degrees

	// Derived states
	let theta_rad = $derived((theta_deg * Math.PI) / 180);

	// Stress Transformation Eq (theta is normal to x')
	let sigma_x_prime = $derived(
		(sigma_x + sigma_y) / 2 +
			((sigma_x - sigma_y) / 2) * Math.cos(2 * theta_rad) +
			tau_xy * Math.sin(2 * theta_rad)
	);
	let sigma_y_prime = $derived(
		(sigma_x + sigma_y) / 2 -
			((sigma_x - sigma_y) / 2) * Math.cos(2 * theta_rad) -
			tau_xy * Math.sin(2 * theta_rad)
	);
	let tau_xy_prime = $derived(
		-((sigma_x - sigma_y) / 2) * Math.sin(2 * theta_rad) + tau_xy * Math.cos(2 * theta_rad)
	);

	// Mohr's circle parameters
	let center_c = $derived((sigma_x + sigma_y) / 2);
	let radius_r = $derived(Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + Math.pow(tau_xy, 2)));
	let sigma_1 = $derived(center_c + radius_r);
	let sigma_2 = $derived(center_c - radius_r);

	let svgElement = $state<SVGSVGElement>();
	const width = 500;
	const height = 400;
	const margin = { top: 30, right: 30, bottom: 50, left: 50 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	function drawCircle() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove(); // clear canvas

		// Set scales to maintain equal aspect ratio for a true circle
		// Let max extent be based on principal stresses + padding
		const maxVal = Math.max(Math.abs(sigma_1), Math.abs(sigma_2), Math.abs(radius_r)) + 20;
		const xDomain = [-maxVal + center_c, maxVal + center_c];
		const yDomain = [-maxVal, maxVal]; // sheer is centered around 0

		const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
		const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// Draw Axis
		g.append('line') // x-axis (sigma)
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', yScale(0))
			.attr('y2', yScale(0))
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '4');
		g.append('line') // y-axis (tau)
			.attr('x1', xScale(0))
			.attr('x2', xScale(0))
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '4');

		// X and Y labels
		g.append('text')
			.attr('x', innerWidth)
			.attr('y', yScale(0) - 10)
			.attr('text-anchor', 'end')
			.attr('fill', '#71717a')
			.text('수직 응력 σ (Normal)');
		g.append('text')
			.attr('x', xScale(0) + 10)
			.attr('y', 0)
			.attr('fill', '#71717a')
			.text('전단 응력 τ (Shear)');

		// Draw Mohr's Circle
		g.append('circle')
			.attr('cx', xScale(center_c))
			.attr('cy', yScale(0))
			.attr('r', xScale(center_c + radius_r) - xScale(center_c)) // radius in pixel space
			.attr('fill', 'none')
			.attr('stroke', '#3f3f46')
			.attr('stroke-width', 2);

		// Draw Center Point C
		g.append('circle')
			.attr('cx', xScale(center_c))
			.attr('cy', yScale(0))
			.attr('r', 4)
			.attr('fill', '#3f3f46');
		g.append('text')
			.attr('x', xScale(center_c))
			.attr('y', yScale(0) + 20)
			.attr('text-anchor', 'middle')
			.attr('fill', '#3f3f46')
			.text(`C(${center_c.toFixed(1)}, 0)`);

		// Point X' based on theta
		const px = sigma_x_prime;
		// Note standard convention plots +shear downward for Mohr, but standard math plots it upward.
		// For consistency with basic visual math, we plot tau directly.
		const py = tau_xy_prime;

		// Point line
		g.append('line')
			.attr('x1', xScale(center_c))
			.attr('y1', yScale(0))
			.attr('x2', xScale(px))
			.attr('y2', yScale(py))
			.attr('stroke', '#ef4444')
			.attr('stroke-width', 2);

		// The point itself
		g.append('circle')
			.attr('cx', xScale(px))
			.attr('cy', yScale(py))
			.attr('r', 6)
			.attr('fill', '#ef4444');

		// Coordinates label for Point
		g.append('text')
			.attr('x', xScale(px) + 10)
			.attr('y', yScale(py) - 10)
			.attr('fill', '#ef4444')
			.attr('font-size', '12px')
			.attr('font-weight', 'bold')
			.text(`(${px.toFixed(1)}, ${py.toFixed(1)})`);
	}

	$effect(() => {
		if (svgElement && center_c !== undefined && radius_r !== undefined && theta_rad !== undefined) {
			drawCircle();
		}
	});
</script>

<svelte:head>
	<title>모어의 원 (Mohr's Circle) - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← 돌아가기</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			모어의 원과 응력 변환 (Mohr's Circle)
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			각도를 회전하며 평면 상의 응력 변환 상태를 살피고, 주응력(Principal Stresses)과 최대 전단
			응력을 도출하는 모어의 원을 분석합니다.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
		<!-- Left: Controls -->
		<div class="col-span-4 space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">초기 응력 상태</h2>

			<div>
				<label for="sx" class="block text-sm font-medium text-zinc-700"
					>$\sigma_x$ = {sigma_x} MPa</label
				>
				<input
					id="sx"
					type="range"
					min="-100"
					max="100"
					bind:value={sigma_x}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>
			<div>
				<label for="sy" class="block text-sm font-medium text-zinc-700"
					>$\sigma_y$ = {sigma_y} MPa</label
				>
				<input
					id="sy"
					type="range"
					min="-100"
					max="100"
					bind:value={sigma_y}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>
			<div>
				<label for="txy" class="block text-sm font-medium text-zinc-700"
					>$\tau_{'{'}xy{'}'}$ = {tau_xy} MPa</label
				>
				<input
					id="txy"
					type="range"
					min="-100"
					max="100"
					bind:value={tau_xy}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<hr class="border-zinc-100" />

			<h2 class="text-xl font-bold text-zinc-900">절단면 회전각</h2>
			<div>
				<div class="flex items-center justify-between">
					<label for="theta" class="block text-sm font-medium text-red-600"
						>$\theta$ = {theta_deg}°</label
					>
				</div>
				<input
					id="theta"
					type="range"
					min="0"
					max="180"
					bind:value={theta_deg}
					class="mt-2 w-full accent-red-600"
				/>
			</div>

			<div class="mt-8 rounded-xl border border-red-100 bg-red-50 p-4">
				<h4 class="mb-2 text-xs font-bold tracking-wider text-red-800 uppercase">
					변환된 응력 (Transformed)
				</h4>
				<ul class="space-y-1 font-mono text-sm text-red-900">
					<li>$\sigma_{'{'}x'{'}'}$ = {sigma_x_prime.toFixed(2)} MPa</li>
					<li>$\sigma_{'{'}y'{'}'}$ = {sigma_y_prime.toFixed(2)} MPa</li>
					<li>$\tau_{'{'}x'y'{'}'}$ = {tau_xy_prime.toFixed(2)} MPa</li>
				</ul>
			</div>

			<div class="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
				<h4 class="mb-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">
					주응력 (Principal)
				</h4>
				<ul class="space-y-1 font-mono text-sm text-zinc-800">
					<li>$\sigma_1$ (최대) = {sigma_1.toFixed(2)} MPa</li>
					<li>$\sigma_2$ (최소) = {sigma_2.toFixed(2)} MPa</li>
					<li>$\tau_{'{'}max{'}'}$ = {radius_r.toFixed(2)} MPa</li>
				</ul>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="col-span-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<p class="mt-4 text-sm text-zinc-400">
				원의 궤적은 모든 $\theta$ 회전에 대한 응력 상태를 나타냅니다.
			</p>
		</div>
	</div>
</div>
