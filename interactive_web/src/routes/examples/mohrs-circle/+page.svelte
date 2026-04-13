<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

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

	// Derived Calculations for Physical Wedge Traction Vectors
	let p_x = $derived(sigma_x * Math.cos(theta_rad) + tau_xy * Math.sin(theta_rad));
	let p_y = $derived(tau_xy * Math.cos(theta_rad) + sigma_y * Math.sin(theta_rad));

	// Mohr's circle parameters
	let center_c = $derived((sigma_x + sigma_y) / 2);
	let radius_r = $derived(Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + Math.pow(tau_xy, 2)));
	let sigma_1 = $derived(center_c + radius_r);
	let sigma_2 = $derived(center_c - radius_r);

	let svgElement = $state<SVGSVGElement>();
	let wedgeSvgElement = $state<SVGSVGElement>();

	const width = 450;
	const height = 400;
	const margin = { top: 30, right: 30, bottom: 50, left: 50 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	function drawCircle() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove(); // clear canvas

		const maxVal = Math.max(Math.abs(sigma_1), Math.abs(sigma_2), Math.abs(radius_r)) + 20;
		const xDomain = [-maxVal + center_c, maxVal + center_c];
		const yDomain = [-maxVal, maxVal]; // sheer is centered around 0

		const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
		const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// Draw Axis
		g.append('line') // x-axis
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', yScale(0))
			.attr('y2', yScale(0))
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '4');
		g.append('line') // y-axis
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
			.text('Normal (σ) [MPa]');
		g.append('text')
			.attr('x', xScale(0) + 10)
			.attr('y', 0)
			.attr('fill', '#71717a')
			.text('Shear (τ) [MPa]');

		// Draw Mohr's Circle
		g.append('circle')
			.attr('cx', xScale(center_c))
			.attr('cy', yScale(0))
			.attr('r', xScale(center_c + radius_r) - xScale(center_c))
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
			.attr('font-size', '14px')
			.attr('font-weight', 'bold')
			.text(`(${px.toFixed(1)}, ${py.toFixed(1)})`);
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

	function drawWedge() {
		if (!wedgeSvgElement) return;
		const svg = d3.select(wedgeSvgElement);
		svg.selectAll('*').remove();

		const w_width = 250;
		const w_height = 250;
		const L = 120; // Hypotenuse physical length
		const cx = w_width / 2;
		const cy = w_height / 2;

		const defs = svg.append('defs');
		createMarker(defs, 'arrow-red', '#ef4444');
		createMarker(defs, 'arrow-blue', '#3b82f6');
		createMarker(defs, 'arrow-purple', '#8b5cf6');
		createMarker(defs, 'arrow-dark', '#18181b');

		const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

		const A_math = [-(L / 2) * Math.sin(theta_rad), (L / 2) * Math.cos(theta_rad)];
		const B_math = [(L / 2) * Math.sin(theta_rad), -(L / 2) * Math.cos(theta_rad)];
		const Q_math = [-(L / 2) * Math.sin(theta_rad), -(L / 2) * Math.cos(theta_rad)];

		g.append('polygon')
			.attr(
				'points',
				`${A_math[0]},${-A_math[1]} ${B_math[0]},${-B_math[1]} ${Q_math[0]},${-Q_math[1]}`
			)
			.attr('fill', '#f4f4f5')
			.attr('stroke', '#52525b')
			.attr('stroke-width', 2);

		const drawVector = (
			ox: number,
			oy: number,
			vx: number,
			vy: number,
			colorId: string,
			label: string,
			offset: [number, number]
		) => {
			const mag = Math.sqrt(vx * vx + vy * vy);
			if (mag < 1) return;
			const scale = 0.5;

			const c_hex =
				colorId === 'arrow-red'
					? '#ef4444'
					: colorId === 'arrow-blue'
						? '#3b82f6'
						: colorId === 'arrow-purple'
							? '#8b5cf6'
							: '#18181b';

			g.append('line')
				.attr('x1', ox)
				.attr('y1', -oy)
				.attr('x2', ox + vx * scale)
				.attr('y2', -(oy + vy * scale))
				.attr('stroke', c_hex)
				.attr('stroke-width', 2)
				.attr('marker-end', `url(#${colorId})`);

			g.append('text')
				.attr('x', ox + vx * scale + offset[0])
				.attr('y', -(oy + vy * scale) - offset[1])
				.attr('fill', c_hex)
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.text(label);
		};

		const midAQ = [Q_math[0], (A_math[1] + Q_math[1]) / 2];
		drawVector(midAQ[0], midAQ[1], -sigma_x, 0, 'arrow-red', 'σx', [-20, -5]);
		drawVector(midAQ[0], midAQ[1], 0, -tau_xy, 'arrow-blue', 'τxy', [-20, 10]);

		const midQB = [(Q_math[0] + B_math[0]) / 2, Q_math[1]];
		drawVector(midQB[0], midQB[1], 0, -sigma_y, 'arrow-red', 'σy', [10, -15]);
		drawVector(midQB[0], midQB[1], -tau_xy, 0, 'arrow-blue', 'τxy', [20, -5]);

		const xp_dir = [Math.cos(theta_rad), Math.sin(theta_rad)];
		const yp_dir = [-Math.sin(theta_rad), Math.cos(theta_rad)];

		// Draw total traction p
		drawVector(0, 0, p_x, p_y, 'arrow-dark', 'p', [15, 15]);

		const v_sig_x = sigma_x_prime * xp_dir[0];
		const v_sig_y = sigma_x_prime * xp_dir[1];
		const v_tau_x = tau_xy_prime * yp_dir[0];
		const v_tau_y = tau_xy_prime * yp_dir[1];

		drawVector(0, 0, v_sig_x, v_sig_y, 'arrow-purple', "σx'", [10 * xp_dir[0], 10 * xp_dir[1]]);
		drawVector(0, 0, v_tau_x, v_tau_y, 'arrow-blue', "τx'y'", [10 * yp_dir[0], 10 * yp_dir[1]]);

		g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 80 * xp_dir[0])
			.attr('y2', -80 * xp_dir[1])
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '4');

		if (theta_deg > 2) {
			const arcRadius = 30;
			const arcX = arcRadius * Math.cos(theta_rad);
			const arcY = -arcRadius * Math.sin(theta_rad);
			g.append('path')
				.attr('d', `M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 0 ${arcX} ${arcY}`)
				.attr('fill', 'none')
				.attr('stroke', '#9333ea')
				.attr('stroke-width', 2);
			g.append('text')
				.attr('x', (arcRadius + 12) * Math.cos(theta_rad / 2))
				.attr('y', -(arcRadius + 12) * Math.sin(theta_rad / 2) + 5)
				.attr('fill', '#9333ea')
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.text('θ');
		}
	}

	$effect(() => {
		if (svgElement && center_c !== undefined && radius_r !== undefined && theta_rad !== undefined) {
			drawCircle();
		}
		if (wedgeSvgElement && sigma_x !== undefined) {
			drawWedge();
		}
	});
</script>

<svelte:head>
	<title>Mohr's Circle - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Mohr's Circle & Stress Transformation
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Rotate the cut plane angle to observe stress transformation in 2D space. Analyze the plotted
			Mohr's Circle to intuitively calculate Principal Stresses and Maximum Shear.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls -->
		<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">Initial Stress State</h2>

			<div>
				<label for="sx" class="block text-sm font-medium text-zinc-700"
					>{@html k('\\sigma_x')} = {sigma_x} MPa</label
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
					>{@html k('\\sigma_y')} = {sigma_y} MPa</label
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
					>{@html k('\\tau_{xy}')} = {tau_xy} MPa</label
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

			<h2 class="text-xl font-bold text-zinc-900">Cut Plane Angle</h2>
			<div>
				<div class="flex items-center justify-between">
					<label for="theta" class="block text-sm font-medium text-red-600"
						>{@html k('\\theta')} = {theta_deg}°</label
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
				<h4 class="mb-2 text-sm font-bold tracking-wider text-red-800 uppercase">
					Transformed Equivalent
				</h4>
				<ul class="space-y-1 font-mono text-sm text-red-900">
					<li>{@html k("\\sigma_{x'}")} = {sigma_x_prime.toFixed(2)} MPa</li>
					<li>{@html k("\\sigma_{y'}")} = {sigma_y_prime.toFixed(2)} MPa</li>
					<li>{@html k("\\tau_{x'y'}")} = {tau_xy_prime.toFixed(2)} MPa</li>
				</ul>
			</div>

			<div class="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
				<h4 class="mb-2 text-sm font-bold tracking-wider text-zinc-500 uppercase">
					Principal Stresses
				</h4>
				<ul class="space-y-1 font-mono text-sm text-zinc-800">
					<li>{@html k('\\sigma_1')} (Max) = {sigma_1.toFixed(2)} MPa</li>
					<li>{@html k('\\sigma_2')} (Min) = {sigma_2.toFixed(2)} MPa</li>
					<li>{@html k('\\tau_{max}')} = {radius_r.toFixed(2)} MPa</li>
				</ul>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible select-none"></svg>
			<p class="mt-4 text-center text-sm text-zinc-400">
				The circular locus represents all possible stress states for any rotation {@html k(
					'\\theta'
				)}.
			</p>

			<hr class="my-8 w-full border-zinc-100" />

			<!-- Physical Wedge Visualizer -->
			<h3 class="mb-2 w-full text-left font-bold text-zinc-800">Physical Wedge Representation</h3>
			<svg bind:this={wedgeSvgElement} width="250" height="250" class="overflow-visible select-none"
			></svg>
			<p class="mt-2 text-center text-sm text-zinc-400">
				The geometric cut plane physically rotating by {@html k('\\theta')} corresponds logically to the
				point spinning exactly {@html k('2\\theta')} around Mohr's Circle above.
			</p>
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
				Stress is not simply a vector that obeys standard coordinate transformation; rather, it is a <strong
					>Tensor</strong
				>. Because forces act on surfaces with designated normal vectors, when we slice a material
				at an arbitrary angle {@html k('\\theta')}, both the area mapping and the force components
				shift.
			</p>

			<h4>Mohr's Circle Interpretation</h4>
			<p>
				In 1882, Christian Otto Mohr elegantly mapped this non-linear mathematical transformation to
				a geometric circle. The X-axis represents Normal Stresses ({@html k('\\sigma')}), while the
				Y-axis maps Shear Stresses ({@html k('\\tau')}).
			</p>

			<ul>
				<li>
					<strong>Center Point 'C'</strong>: Equivalent to the average of the initial normal
					stresses: {@html k('(\\sigma_x + \\sigma_y)/2')}. Note that rotating the axes does not
					change this average (Trace of the tensor is invariant).
				</li>
				<li>
					<strong>Circle Radius 'R'</strong>: Equal to the maximum possible shear stress {@html k(
						'\\tau_{max}'
					)}.
				</li>
				<li>
					<strong>Principal Stresses</strong> ({@html k('\\sigma_1, \\sigma_2')}): The points where
					the circle intersects the X-axis. By definition,
					<strong>shear stress is zero ({@html k('\\tau = 0')})</strong> on these planes. An element aligned
					perfectly to these planes will only stretch or compress, and absolutely will not shear. Finding
					these principle axes is crucial in predicting material failure patterns.
				</li>
				<li>
					<strong>2{@html k('\\theta')} Rotation</strong>: A physical rotation of {@html k(
						'\\theta'
					)} in real geometry corresponds to moving {@html k('2\\theta')} along the perimeter of the Mohr's
					Circle. This happens mathematically because the transformation equations rely on {@html k(
						'\\cos(2\\theta)'
					)} terms.
				</li>
			</ul>
		</div>
	</div>
</div>
