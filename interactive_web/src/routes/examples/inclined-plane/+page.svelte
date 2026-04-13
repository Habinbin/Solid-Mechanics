<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	// Inputs
	let P_kN = $state(100);
	let A_cm2 = $state(10);
	let theta_deg = $state(30);

	let theta_rad = $derived((theta_deg * Math.PI) / 180);

	// Stress Calculations
	let sigma_0 = $derived((P_kN / A_cm2) * 10); // MPa equivalent (kN/cm2 * 10 = MPa)

	// Math: A_theta = A / cos(theta) (absolute area)
	let A_theta = $derived(A_cm2 / Math.abs(Math.cos(theta_rad)));

	let sigma_theta = $derived(sigma_0 * Math.pow(Math.cos(theta_rad), 2));
	let tau_theta = $derived(-sigma_0 * Math.sin(theta_rad) * Math.cos(theta_rad));

	let svgElement = $state<SVGSVGElement>();
	const width = 500;
	const height = 300;

	function drawPlane() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		const cx = width / 2;
		const cy = height / 2;

		const L = 160; // visual length
		const H = A_cm2 * 4; // visual height proportional to A

		// Prevent infinite cut visual error at exactly 90 degrees
		const safe_theta = Math.abs(theta_deg) === 90 ? 89.9 * Math.sign(theta_deg) : theta_deg;
		const rad = (safe_theta * Math.PI) / 180;
		const dx = Math.tan(rad) * (H / 2);

		const leftBound = cx - L;
		const rightBound = cx + dx;

		if (rightBound > leftBound) {
			// Draw left block
			svg
				.append('polygon')
				.attr(
					'points',
					`
					${cx - L},${cy - H / 2}
					${cx + dx},${cy - H / 2}
					${cx - dx},${cy + H / 2}
					${cx - L},${cy + H / 2}
				`
				)
				.attr('fill', '#f4f4f5')
				.attr('stroke', '#71717a')
				.attr('stroke-width', 2);

			// Draw right block (ghostly to show cut)
			svg
				.append('polygon')
				.attr(
					'points',
					`
					${cx + dx},${cy - H / 2}
					${cx + L},${cy - H / 2}
					${cx + L},${cy + H / 2}
					${cx - dx},${cy + H / 2}
				`
				)
				.attr('fill', 'none')
				.attr('stroke', '#d4d4d8')
				.attr('stroke-dasharray', '4')
				.attr('stroke-width', 2);
		}

		// Cut Plane Line Extended
		const planeLen = 120;
		const px1 = cx + Math.sin(rad) * planeLen;
		const py1 = cy - Math.cos(rad) * planeLen;
		const px2 = cx - Math.sin(rad) * planeLen;
		const py2 = cy + Math.cos(rad) * planeLen;

		svg
			.append('line')
			.attr('x1', px1)
			.attr('y1', py1)
			.attr('x2', px2)
			.attr('y2', py2)
			.attr('stroke', '#ef4444')
			.attr('stroke-dasharray', '5,5')
			.attr('stroke-width', 1.5);

		// Base Axis X
		svg
			.append('line')
			.attr('x1', cx - 100)
			.attr('y1', cy)
			.attr('x2', cx + 100)
			.attr('y2', cy)
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '4,4');

		// Def marker
		svg
			.append('defs')
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
			.attr('fill', 'context-stroke');

		// Force P vector (axial)
		const arrowScale = 0.5;
		if (P_kN > 0) {
			svg
				.append('line')
				.attr('x1', cx - L + 20)
				.attr('y1', cy)
				.attr('x2', cx - L - 50)
				.attr('y2', cy)
				.attr('stroke', '#18181b')
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrow)');
			svg
				.append('text')
				.attr('x', cx - L - 65)
				.attr('y', cy + 4)
				.attr('text-anchor', 'end')
				.attr('font-weight', 'bold')
				.text('P');
		}

		// Normal Vector (sigma_theta)
		// Angle is theta_rad
		const sigma_len = Math.abs(sigma_theta * arrowScale);
		if (sigma_len > 1) {
			const sx = cx + Math.cos(rad) * sigma_len;
			const sy = cy + Math.sin(rad) * sigma_len;
			svg
				.append('line')
				.attr('x1', cx)
				.attr('y1', cy)
				.attr('x2', sx)
				.attr('y2', sy)
				.attr('stroke', '#2563eb')
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrow)');
			svg
				.append('text')
				.attr('x', sx + 10 * Math.cos(rad))
				.attr('y', sy + 10 * Math.sin(rad))
				.attr('fill', '#2563eb')
				.text('σ_θ');
		}

		// Shear Vector (tau_theta)
		const tau_len = Math.abs(tau_theta * arrowScale);
		if (tau_len > 1) {
			const isNegativeShear = tau_theta < 0;
			// Tangent line angle = rad - pi/2 if tau > 0, rad + pi/2 if tau < 0
			// tau_theta formula dictates direction. We'll simply draw it along the cut plane.
			const t_dir = isNegativeShear ? 1 : -1;
			const tx = cx + Math.sin(rad) * tau_len * t_dir;
			const ty = cy - Math.cos(rad) * tau_len * t_dir;

			svg
				.append('line')
				.attr('x1', cx)
				.attr('y1', cy)
				.attr('x2', tx)
				.attr('y2', ty)
				.attr('stroke', '#16a34a') // green
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrow)');
			svg
				.append('text')
				.attr('x', tx + 10 * Math.sin(rad) * t_dir)
				.attr('y', ty - 10 * Math.cos(rad) * t_dir)
				.attr('fill', '#16a34a')
				.text('τ_θ');
		}

		// Theta Arc
		const arcGenerator = d3
			.arc()
			.innerRadius(40)
			.outerRadius(40)
			.startAngle(Math.PI / 2)
			.endAngle(Math.PI / 2 - rad);

		svg
			.append('path')
			.attr('transform', `translate(${cx}, ${cy})`)
			.attr('d', arcGenerator(null as any) as string)
			.attr('fill', 'none')
			.attr('stroke', '#ef4444')
			.attr('stroke-width', 1.5);

		svg
			.append('text')
			.attr('x', cx + 55 * Math.cos(rad / 2))
			.attr('y', cy + 55 * Math.sin(rad / 2) + 5)
			.attr('fill', '#ef4444')
			.attr('font-size', '14px')
			.text('θ');
	}

	$effect(() => {
		if (svgElement && P_kN !== undefined && A_cm2 !== undefined && theta_deg !== undefined) {
			drawPlane();
		}
	});
</script>

<svelte:head>
	<title>Inclined Plane Stress - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Stress on an Inclined Plane
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Constant axial loads can induce distinct Normal and Shear stresses dependent solely on the
			geometric orientation of the internal crystalline cut plane.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls -->
		<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">Uniaxial State</h2>

			<div>
				<label for="P" class="block text-sm font-medium text-zinc-700"
					>Applied Force (P) = {P_kN} kN</label
				>
				<input
					id="P"
					type="range"
					min="10"
					max="200"
					bind:value={P_kN}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<div>
				<label for="A" class="block text-sm font-medium text-zinc-700"
					>Initial Area (A) = {A_cm2} cm²</label
				>
				<input
					id="A"
					type="range"
					min="2"
					max="25"
					bind:value={A_cm2}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<hr class="border-zinc-100" />

			<h2 class="text-xl font-bold text-zinc-900">Cut Mechanics</h2>

			<div>
				<label for="T" class="block text-sm font-medium text-red-600"
					>Cut Plane Angle ({@html k('\\theta')}) = {theta_deg}°</label
				>
				<input
					id="T"
					type="range"
					min="-85"
					max="85"
					bind:value={theta_deg}
					class="mt-2 w-full accent-red-600"
				/>
			</div>

			<div class="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
				<h4 class="mb-4 text-sm font-bold tracking-wider text-zinc-500 uppercase">
					Plane Transformations
				</h4>
				<ul class="space-y-4 font-mono text-sm text-zinc-800">
					<li class="flex items-center justify-between">
						<span>{@html k('A_\\theta = \\frac{A}{\\cos \\theta}')}</span>
						<span class="font-bold text-red-600">{A_theta.toFixed(2)} cm²</span>
					</li>
					<li class="flex items-center justify-between">
						<span>{@html k('\\sigma_\\theta = \\frac{P}{A} \\cos^2 \\theta')}</span>
						<span class="font-bold text-blue-600">{sigma_theta.toFixed(2)} MPa</span>
					</li>
					<li class="flex items-center justify-between">
						<span>{@html k('\\tau_\\theta = -\\frac{P}{A} \\sin \\theta \\cos \\theta')}</span>
						<span class="font-bold text-green-600">{tau_theta.toFixed(2)} MPa</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<p class="mt-4 max-w-sm text-center text-sm text-zinc-400">
				Graphical representation of a solid cut at an arbitrary angle {@html k('\\theta')}. Note the
				physical enlargement of the cut face.
			</p>
		</div>
	</div>

	<!-- Bottom Row: Physical Insights -->
	<div class="mt-8 rounded-2xl border-l-[6px] border-indigo-500 bg-indigo-50/50 p-8 shadow-sm">
		<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-indigo-900">
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
				A uniaxial load (pulling straight on a bar) naturally creates maximum normal stress on the
				transverse plane ({@html k('\\theta = 0')}). However, materials rarely fail strictly on
				transverse planes. For many ductile materials like mild steel, they yield by shearing along
				angled slip planes.
			</p>

			<h4>The Dual Effects of the Cut Angle ({@html k('\\theta')})</h4>
			<p>
				Rotating the analytical cut plane introduces a non-linear dual phenomenon affecting both the
				geometric area and internal force vectors:
			</p>
			<ul>
				<li>
					<strong>Area Enlargement ({@html k('A_\\theta')}):</strong> As the cut plane slants ({@html k(
						'\\theta \\to 90^\\circ'
					)}), the exposed surface area geometrically stretches into an elongated ellipse, governed
					by {@html k('\\frac{A}{\\cos \\theta}')}. This massive expansion inherently dilutes any
					constant force into very small distributed stresses at extreme angles.
				</li>
				<li>
					<strong>Vector Decomposition:</strong> The horizontal axial force {@html k('P')} breaks down
					into a Normal Component (perpendicular to the cut face) and a Shear Component (parallel to the
					cut slide).
				</li>
			</ul>

			<h4>Key Extremes</h4>
			<ul>
				<li>
					When <strong>{@html k('\\theta = 45^\\circ')}</strong>, the product {@html k(
						'\\sin(45) \\cos(45)'
					)} reaches its peak, resulting in the
					<strong>Maximum Shear Stress ({@html k('\\tau_{max}')})</strong>. This is why ductile
					metal tensile specimens exhibit a distinct 45-degree "Cup and Cone" shear failure.
				</li>
			</ul>
		</div>
	</div>
</div>
