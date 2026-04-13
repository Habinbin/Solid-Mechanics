<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });
	const kd = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: true });

	// Colors
	const colors = {
		epsX: '#ef4444', // Red (used for both Strain e_x and Stress sig_x)
		epsY: '#3b82f6', // Blue (used for e_y and sig_y)
		gammaXY: '#22c55e', // Green (used for g_xy and tau_xy)
		theta: '#f97316', // Orange
		epsXPrime: '#a855f7', // Purple (for x' component)
		epsYPrime: '#ec4899', // Pink (for y' component)
		gammaPrime: '#14b8a6' // Teal (for shear x'y' component)
	};

	let epsilon_x = $state(0.2);
	let epsilon_y = $state(0.1);
	let gamma_xy = $state(0.3);
	let theta_deg = $state(30);

	let sigma_x = $state(50);
	let sigma_y = $state(20);
	let tau_xy = $state(30);

	let theta_rad = $derived((theta_deg * Math.PI) / 180);
	let double_theta = $derived(theta_rad * 2);

	// Strain formulas
	let eps_avg = $derived((epsilon_x + epsilon_y) / 2);
	let eps_diff = $derived((epsilon_x - epsilon_y) / 2);
	let gamma_half = $derived(gamma_xy / 2);

	let eps_x_prime = $derived(
		eps_avg + eps_diff * Math.cos(double_theta) + gamma_half * Math.sin(double_theta)
	);
	let eps_y_prime = $derived(
		eps_avg - eps_diff * Math.cos(double_theta) - gamma_half * Math.sin(double_theta)
	);
	let gamma_x_y_prime = $derived(
		2 * (-eps_diff * Math.sin(double_theta) + gamma_half * Math.cos(double_theta))
	);

	// Stress formulas
	let sig_avg = $derived((sigma_x + sigma_y) / 2);
	let sig_diff = $derived((sigma_x - sigma_y) / 2);

	let sig_x_prime = $derived(
		sig_avg + sig_diff * Math.cos(double_theta) + tau_xy * Math.sin(double_theta)
	);
	let sig_y_prime = $derived(
		sig_avg - sig_diff * Math.cos(double_theta) - tau_xy * Math.sin(double_theta)
	);
	let tau_x_y_prime = $derived(
		-sig_diff * Math.sin(double_theta) + tau_xy * Math.cos(double_theta)
	);

	let svgElement = $state<SVGSVGElement>();

	const width = 500;
	const height = 400;
	const center = { x: width / 2, y: height / 2 };
	const L = 150; // Original Length of AB and AC segments

	function drawElement() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		// x' axis direction (segment AB)
		const xB_cart = L * Math.cos(theta_rad);
		const yB_cart = L * Math.sin(theta_rad);

		// y' axis direction (segment AC, +90 deg from x')
		const xC_cart = L * Math.cos(theta_rad + Math.PI / 2);
		const yC_cart = L * Math.sin(theta_rad + Math.PI / 2);

		// Coordinate transformation back to origin (A is at 0,0)
		const xA_cart = 0;
		const yA_cart = 0;

		// Displacements
		const getDisplacement = (x: number, y: number) => ({
			u: epsilon_x * x + 0.5 * gamma_xy * y,
			v: epsilon_y * y + 0.5 * gamma_xy * x
		});

		const d_B = getDisplacement(xB_cart, yB_cart);
		const d_C = getDisplacement(xC_cart, yC_cart);

		// Helper to fit inside SVG coords
		const toSVG = (x: number, y: number) => ({
			x: center.x + x,
			y: center.y - y
		});

		const A_svg = toSVG(0, 0);
		const B_svg = toSVG(xB_cart, yB_cart);
		const C_svg = toSVG(xC_cart, yC_cart);

		const B_prime_svg = toSVG(xB_cart + d_B.u, yB_cart + d_B.v);
		const C_prime_svg = toSVG(xC_cart + d_C.u, yC_cart + d_C.v);

		// Markers
		const defs = svg.append('defs');
		defs
			.append('marker')
			.attr('id', 'arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 8)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', '#9ca3af');

		const g = svg.append('g');

		// Base X and Y axes
		g.append('line')
			.attr('x1', center.x)
			.attr('y1', 50)
			.attr('x2', center.x)
			.attr('y2', height - 50)
			.attr('stroke', '#e5e7eb')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5');
		g.append('line')
			.attr('x1', 50)
			.attr('y1', center.y)
			.attr('x2', width - 50)
			.attr('y2', center.y)
			.attr('stroke', '#e5e7eb')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5');

		// Extrapolate grid axes for x' and y'
		const drawAxis = (
			angle: number,
			color: string,
			label: string,
			offset: { x: number; y: number }
		) => {
			const span = 200;
			const p1 = toSVG(-span * Math.cos(angle), -span * Math.sin(angle));
			const p2 = toSVG(span * Math.cos(angle), span * Math.sin(angle));
			g.append('line')
				.attr('x1', p1.x)
				.attr('y1', p1.y)
				.attr('x2', p2.x)
				.attr('y2', p2.y)
				.attr('stroke', color)
				.attr('stroke-width', 1.5)
				.attr('stroke-dasharray', '4,4');
			g.append('text')
				.attr('x', p2.x + offset.x)
				.attr('y', p2.y + offset.y)
				.text(label)
				.attr('fill', color)
				.attr('font-style', 'italic')
				.attr('font-weight', 'bold');
		};

		drawAxis(theta_rad, colors.epsXPrime, "x'", { x: 10, y: -10 });
		drawAxis(theta_rad + Math.PI / 2, colors.epsYPrime, "y'", { x: -10, y: -10 });

		// Original L-Shape (Orthogonal)
		const drawLine = (
			p1: { x: number; y: number },
			p2: { x: number; y: number },
			color: string
		) => {
			g.append('line')
				.attr('x1', p1.x)
				.attr('y1', p1.y)
				.attr('x2', p2.x)
				.attr('y2', p2.y)
				.attr('stroke', color)
				.attr('stroke-width', 4)
				.attr('stroke-linecap', 'round');
			g.append('circle').attr('cx', p2.x).attr('cy', p2.y).attr('r', 5).attr('fill', color);
		};

		drawLine(A_svg, B_svg, '#64748b'); // x' original
		drawLine(A_svg, C_svg, '#64748b'); // y' original
		g.append('circle').attr('cx', A_svg.x).attr('cy', A_svg.y).attr('r', 5).attr('fill', '#64748b');

		g.append('text')
			.attr('x', A_svg.x - 15)
			.attr('y', A_svg.y + 15)
			.text('A')
			.attr('fill', '#64748b')
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', B_svg.x + 10)
			.attr('y', B_svg.y - 10)
			.text('B')
			.attr('fill', '#64748b')
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', C_svg.x - 20)
			.attr('y', C_svg.y - 10)
			.text('C')
			.attr('fill', '#64748b')
			.attr('font-weight', 'bold');

		// Deformed Shape
		drawLine(A_svg, B_prime_svg, colors.epsXPrime); // x' deformed
		drawLine(A_svg, C_prime_svg, colors.epsYPrime); // y' deformed

		// Connect endpoints to show square element deformation
		const D_cart = { x: xB_cart + xC_cart, y: yB_cart + yC_cart }; // Original element 4th point
		const d_D = getDisplacement(D_cart.x, D_cart.y);
		const D_svg = toSVG(D_cart.x, D_cart.y);
		const D_prime_svg = toSVG(D_cart.x + d_D.u, D_cart.y + d_D.v);

		g.append('path')
			.attr(
				'd',
				`M${A_svg.x},${A_svg.y} L${B_prime_svg.x},${B_prime_svg.y} L${D_prime_svg.x},${D_prime_svg.y} L${C_prime_svg.x},${C_prime_svg.y} Z`
			)
			.attr('fill', colors.gammaPrime)
			.attr('fill-opacity', 0.1)
			.attr('stroke', colors.gammaPrime)
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5');

		g.append('text')
			.attr('x', B_prime_svg.x + 10)
			.attr('y', B_prime_svg.y + 15)
			.text("B'")
			.attr('fill', colors.epsXPrime)
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', C_prime_svg.x - 25)
			.attr('y', C_prime_svg.y + 20)
			.text("C'")
			.attr('fill', colors.epsYPrime)
			.attr('font-weight', 'bold');

		// Displacement vectors
		const drawDisp = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
			g.append('line')
				.attr('x1', p1.x)
				.attr('y1', p1.y)
				.attr('x2', p2.x)
				.attr('y2', p2.y)
				.attr('stroke', '#9ca3af')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', '3,3')
				.attr('marker-end', 'url(#arrow)');
		};
		drawDisp(B_svg, B_prime_svg);
		drawDisp(C_svg, C_prime_svg);
	}

	$effect(() => {
		if (svgElement && epsilon_x !== undefined) {
			drawElement();
		}
	});

	// Expression Generators for double angle format
	const eStr = `\\epsilon_{x'} = \\frac{\\epsilon_x + \\epsilon_y}{2} + \\frac{\\epsilon_x - \\epsilon_y}{2} \\cos 2\\theta + \\frac{\\gamma_{xy}}{2} \\sin 2\\theta`;
	const eYtr = `\\epsilon_{y'} = \\frac{\\epsilon_x + \\epsilon_y}{2} - \\frac{\\epsilon_x - \\epsilon_y}{2} \\cos 2\\theta - \\frac{\\gamma_{xy}}{2} \\sin 2\\theta`;
	const gammaTr = `\\frac{\\gamma_{x'y'}}{2} = -\\frac{\\epsilon_x - \\epsilon_y}{2} \\sin 2\\theta + \\frac{\\gamma_{xy}}{2} \\cos 2\\theta`;

	const sStr = `\\sigma_{x'} = \\frac{\\sigma_x + \\sigma_y}{2} + \\frac{\\sigma_x - \\sigma_y}{2} \\cos 2\\theta + \\tau_{xy} \\sin 2\\theta`;
	const sYtr = `\\sigma_{y'} = \\frac{\\sigma_x + \\sigma_y}{2} - \\frac{\\sigma_x - \\sigma_y}{2} \\cos 2\\theta - \\tau_{xy} \\sin 2\\theta`;
	const tauTr = `\\tau_{x'y'} = -\\frac{\\sigma_x - \\sigma_y}{2} \\sin 2\\theta + \\tau_{xy} \\cos 2\\theta`;
</script>

<svelte:head>
	<title>Coordinate Transformation - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Stress & Strain Transform (2D Tensor)
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Visualize the transformation of a 2D infinitesimal element onto a rotated coordinate system ({@html k(
				`x', y'`
			)}) positioned at an angle {@html k(`\\color{${colors.theta}}{\\theta}`)}. Notice how both
			Stress and Strain share identical tensor transformation rules.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Transformation Equalities -->
		<div class="flex flex-col gap-6">
			<!-- Formula Panel -->
			<div class="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h2 class="mb-4 text-xl font-bold text-zinc-900">Mathematical Duality</h2>
				<p class="mb-6 text-sm text-zinc-600">
					Solid Mechanics showcases a beautiful mathematical symmetry: both internal forces (Stress)
					and geometric deformations (Strain) transform as second-order tensors. The only structural
					difference is the factor of {@html k(`1/2`)} attached to Engineering Shear Strain ({@html k(
						`\\gamma_ {xy}`
					)}).
				</p>

				<div class="flex w-full flex-col gap-6">
					<div
						class="overflow-x-auto rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-[15px] sm:text-base"
					>
						<h3 class="mb-4 border-b border-zinc-200 pb-2 text-center font-bold text-zinc-800">
							Strain Transformation
						</h3>
						<div class="my-4 text-center">{@html kd(eStr)}</div>
						<div class="my-4 text-center">{@html kd(eYtr)}</div>
						<div class="my-4 text-center">{@html kd(gammaTr)}</div>
					</div>
					<div
						class="overflow-x-auto rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-[15px] sm:text-base"
					>
						<h3 class="mb-4 border-b border-zinc-200 pb-2 text-center font-bold text-zinc-800">
							Stress Transformation
						</h3>
						<div class="my-4 text-center">{@html kd(sStr)}</div>
						<div class="my-4 text-center">{@html kd(sYtr)}</div>
						<div class="my-4 text-center">{@html kd(tauTr)}</div>
					</div>
				</div>
			</div>

			<!-- Control Panel for SVG -->
			<div class="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h2 class="mb-6 text-xl font-bold text-zinc-900">Strain Properties Control</h2>

				<div class="space-y-6">
					<div>
						<div class="mb-2 flex items-center justify-between">
							<label for="epsx" class="block font-medium text-zinc-700"
								>{@html k(`\\color{${colors.epsX}}{\\epsilon_x}`)} (Normal Strain X)</label
							>
							<span class="text-sm font-semibold" style="color: {colors.epsX}"
								>{epsilon_x.toFixed(2)}</span
							>
						</div>
						<input
							id="epsx"
							type="range"
							min="-1.0"
							max="1.0"
							step="0.05"
							bind:value={epsilon_x}
							class="w-full"
							style="accent-color: {colors.epsX}"
						/>
					</div>

					<div>
						<div class="mb-2 flex items-center justify-between">
							<label for="epsy" class="block font-medium text-zinc-700"
								>{@html k(`\\color{${colors.epsY}}{\\epsilon_y}`)} (Normal Strain Y)</label
							>
							<span class="text-sm font-semibold" style="color: {colors.epsY}"
								>{epsilon_y.toFixed(2)}</span
							>
						</div>
						<input
							id="epsy"
							type="range"
							min="-1.0"
							max="1.0"
							step="0.05"
							bind:value={epsilon_y}
							class="w-full"
							style="accent-color: {colors.epsY}"
						/>
					</div>

					<div>
						<div class="mb-2 flex items-center justify-between">
							<label for="gammaxy" class="block font-medium text-zinc-700"
								>{@html k(`\\color{${colors.gammaXY}}{\\gamma_{xy}}`)} (Shear Strain XY)</label
							>
							<span class="text-sm font-semibold" style="color: {colors.gammaXY}"
								>{gamma_xy.toFixed(2)}</span
							>
						</div>
						<input
							id="gammaxy"
							type="range"
							min="-1.0"
							max="1.0"
							step="0.05"
							bind:value={gamma_xy}
							class="w-full"
							style="accent-color: {colors.gammaXY}"
						/>
					</div>

					<div class="border-t border-zinc-100 pt-4">
						<div class="mb-2 flex items-center justify-between">
							<label for="theta" class="block font-medium text-zinc-700"
								>{@html k(`\\color{${colors.theta}}{\\theta}`)} (Orientation Angle)</label
							>
							<span class="text-sm font-semibold" style="color: {colors.theta}">{theta_deg}°</span>
						</div>
						<input
							id="theta"
							type="range"
							min="-90"
							max="90"
							step="1"
							bind:value={theta_deg}
							class="w-full"
							style="accent-color: {colors.theta}"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-inner"
		>
			<h3 class="mb-4 text-lg font-bold text-zinc-700">Deformation Visualizer (Strain)</h3>
			<p class="mb-6 text-center text-sm text-zinc-500">
				The square element defined by orthogonal axes x' and y' distorts into a rhombus under load.
				Values are exaggerated visually.
			</p>

			<svg
				bind:this={svgElement}
				{width}
				{height}
				class="overflow-visible rounded-lg border border-zinc-200 bg-white shadow-sm"
			></svg>

			<!-- Computed Data Output -->
			<div class="mt-6 w-full rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
				<h4 class="mb-2 text-sm font-bold text-zinc-700">Transformed Properties on Local Axes</h4>
				<div class="flex items-center justify-around">
					<div class="flex flex-col">
						<span class="mb-1 text-xs text-zinc-500">{@html k("\\epsilon_{x'}")}</span>
						<span class="font-mono font-bold" style="color: {colors.epsXPrime}"
							>{eps_x_prime.toFixed(3)}</span
						>
					</div>
					<div class="flex flex-col">
						<span class="mb-1 text-xs text-zinc-500">{@html k("\\epsilon_{y'}")}</span>
						<span class="font-mono font-bold" style="color: {colors.epsYPrime}"
							>{eps_y_prime.toFixed(3)}</span
						>
					</div>
					<div class="flex flex-col">
						<span class="mb-1 text-xs text-zinc-500">{@html k("\\gamma_{x'y'}")}</span>
						<span class="font-mono font-bold" style="color: {colors.gammaPrime}"
							>{gamma_x_y_prime.toFixed(3)}</span
						>
					</div>
				</div>
			</div>

			<div
				class="mt-4 flex flex-wrap justify-center gap-4 rounded-lg bg-zinc-100 px-6 py-4 text-sm"
			>
				<div class="flex items-center">
					<span class="mr-2 h-3 w-3 rounded-full bg-slate-500"></span>Original Orthogonal Corner
					(BAC)
				</div>
				<div class="flex items-center">
					<span class="mr-2 h-3 w-3 rounded-full" style="background-color: {colors.epsXPrime}"
					></span>Deformed x'
				</div>
				<div class="flex items-center">
					<span class="mr-2 h-3 w-3 rounded-full" style="background-color: {colors.epsYPrime}"
					></span>Deformed y'
				</div>
				<div class="flex items-center">
					<span
						class="bg-opacity-20 mr-2 h-4 w-4 border-2 border-dashed border-teal-500 bg-teal-500"
					></span>Shear Distortion Element
				</div>
			</div>
		</div>
	</div>
</div>
