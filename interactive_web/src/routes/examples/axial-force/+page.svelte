<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	// Input State
	let P_kN = $state(50); // Axial force in kN (+ is tension)
	let A_cm2 = $state(10); // Cross-sectional area in cm^2
	let E_GPa = $state(200); // Young's Modulus in GPa (e.g., steel)
	let L_0 = $state(500); // Initial length in mm

	// Scientific conversions for exact computation
	let P_N = $derived(P_kN * 1000);
	let A_m2 = $derived(A_cm2 * 1e-4);
	let E_Pa = $derived(E_GPa * 1e9);
	let L_m = $derived(L_0 / 1000);

	// Derived Mechanics States
	let sigma_MPa = $derived(P_N / A_m2 / 1e6); // Normal Stress
	let strain = $derived(P_N / A_m2 / E_Pa); // Strain (unitless)
	let delta = $derived(strain * L_m * 1000); // Deformation

	// 2D Plane Strain Displacement Gradients
	let du_dx = $state(0.2); // Normal Strain X
	let dv_dy = $state(0.1); // Normal Strain Y
	let dv_dx = $state(0.15); // Shear Rotation X (alpha_x)
	let du_dy = $state(0.0); // Shear Rotation Y (alpha_y)

	let svgElement = $state<SVGSVGElement>();
	let svgPlaneElement = $state<SVGSVGElement>();
	const width = 600;
	const height = 200;
	const margin = { top: 20, right: 60, bottom: 20, left: 60 };

	function drawBar() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		const startX = margin.left;
		const basePixelLen = 300; // Base visual length for L_mm = 500

		// Scale visual length dynamically
		const pixelLen = (L_0 / 500) * basePixelLen;

		// Scale visual deformation highly exaggerated for visibility
		const pixelDelta = delta * 50;
		const currentX = startX + pixelLen + pixelDelta;

		// Draw Fixed Wall
		svg
			.append('rect')
			.attr('x', startX - 20)
			.attr('y', height / 2 - 40)
			.attr('width', 20)
			.attr('height', 80)
			.attr('fill', '#a1a1aa'); // Zinc-400

		// Wall hatch marks
		for (let i = 0; i < 8; i++) {
			svg
				.append('line')
				.attr('x1', startX - 20)
				.attr('y1', height / 2 - 40 + i * 10)
				.attr('x2', startX)
				.attr('y2', height / 2 - 30 + i * 10)
				.attr('stroke', '#71717a');
		}

		// Draw Initial Ghost Bar (Dashed)
		svg
			.append('rect')
			.attr('x', startX)
			.attr('y', height / 2 - A_cm2) // Visual height represents area
			.attr('width', pixelLen)
			.attr('height', A_cm2 * 2)
			.attr('fill', 'none')
			.attr('stroke', '#d4d4d8')
			.attr('stroke-dasharray', '5,5')
			.attr('stroke-width', 2);

		// Draw Deformed Bar
		svg
			.append('rect')
			.attr('x', startX)
			.attr('y', height / 2 - A_cm2)
			.attr('width', pixelLen + pixelDelta)
			.attr('height', A_cm2 * 2)
			.attr('fill', P_kN >= 0 ? '#fee2e2' : '#dbeafe') // Red for tension, Blue for compression
			.attr('stroke', P_kN >= 0 ? '#ef4444' : '#3b82f6')
			.attr('stroke-width', 2)
			.attr('opacity', 0.8);

		// Draw Force Arrow
		if (Math.abs(P_kN) > 0) {
			const isTension = P_kN > 0;
			const arrowLen = Math.abs(P_kN) * 0.5;
			const arrowStartX = currentX + (isTension ? 0 : 50);
			const arrowEndX = currentX + (isTension ? 50 + arrowLen : 0);

			// Define Marker
			svg
				.append('defs')
				.append('marker')
				.attr('id', 'force-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 8)
				.attr('refY', 0)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', isTension ? '#ef4444' : '#3b82f6');

			svg
				.append('line')
				.attr('x1', isTension ? arrowStartX : arrowStartX + arrowLen)
				.attr('y1', height / 2)
				.attr('x2', isTension ? arrowEndX : arrowEndX - arrowLen)
				.attr('y2', height / 2)
				.attr('stroke', isTension ? '#ef4444' : '#3b82f6')
				.attr('stroke-width', 3)
				.attr('marker-end', 'url(#force-arrow)');

			// Force Label
			svg
				.append('text')
				.attr('x', isTension ? arrowEndX + 10 : arrowStartX + arrowLen + 10)
				.attr('y', height / 2 + 5)
				.attr('fill', isTension ? '#ef4444' : '#3b82f6')
				.attr('font-weight', 'bold')
				.text(`${Math.abs(P_kN)} kN`);
		}

		// Delta indicator (only if tension/compression is significant)
		if (Math.abs(pixelDelta) > 2) {
			svg
				.append('line')
				.attr('x1', startX + pixelLen)
				.attr('y1', height / 2 + A_cm2 + 10)
				.attr('x2', startX + pixelLen)
				.attr('y2', height / 2 + A_cm2 + 30)
				.attr('stroke', '#a1a1aa')
				.attr('stroke-dasharray', '4');

			svg
				.append('line')
				.attr('x1', currentX)
				.attr('y1', height / 2 + A_cm2 + 10)
				.attr('x2', currentX)
				.attr('y2', height / 2 + A_cm2 + 30)
				.attr('stroke', '#ef4444');

			svg
				.append('path')
				.attr(
					'd',
					`M ${startX + pixelLen} ${height / 2 + A_cm2 + 20} Q ${(startX + pixelLen + currentX) / 2} ${height / 2 + A_cm2 + 35} ${currentX} ${height / 2 + A_cm2 + 20}`
				)
				.attr('fill', 'none')
				.attr('stroke', '#ef4444');

			svg
				.append('text')
				.attr('x', (startX + pixelLen + currentX) / 2)
				.attr('y', height / 2 + A_cm2 + 45)
				.attr('text-anchor', 'middle')
				.attr('font-size', '14px')
				.attr('fill', '#ef4444')
				.text(`δ = ${delta.toFixed(3)} mm`);
		}
	}

	function drawPlaneStrain() {
		if (!svgPlaneElement) return;
		const svg = d3.select(svgPlaneElement);
		svg.selectAll('*').remove();

		// Add marker defs for axes
		const defs = svg.append('defs');
		defs
			.append('marker')
			.attr('id', 'axis-arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 8)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', '#a1a1aa');

		const w = 600,
			h = 350;
		const g = svg.append('g').attr('transform', `translate(120, 250)`);

		const dx = 200;
		const dy = 140;

		// Axes
		g.append('line')
			.attr('x1', -40)
			.attr('x2', 400)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke', '#a1a1aa')
			.attr('marker-end', 'url(#axis-arrow)');
		g.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 40)
			.attr('y2', -240)
			.attr('stroke', '#a1a1aa')
			.attr('marker-end', 'url(#axis-arrow)');
		g.append('text')
			.attr('x', 410)
			.attr('y', 5)
			.text('x')
			.attr('font-size', '14px')
			.attr('fill', '#71717a');
		g.append('text')
			.attr('x', -15)
			.attr('y', -245)
			.text('y')
			.attr('font-size', '14px')
			.attr('fill', '#71717a');

		// Original Box
		g.append('rect')
			.attr('x', 0)
			.attr('y', -dy)
			.attr('width', dx)
			.attr('height', dy)
			.attr('fill', 'none')
			.attr('stroke', '#18181b')
			.attr('stroke-width', 2);

		// Annotations for original box
		g.append('text')
			.attr('x', dx / 2)
			.attr('y', 20)
			.text('dx')
			.attr('text-anchor', 'middle')
			.attr('font-size', '16px')
			.attr('font-style', 'italic');
		g.append('text')
			.attr('x', -25)
			.attr('y', -dy / 2)
			.text('dy')
			.attr('text-anchor', 'middle')
			.attr('font-size', '16px')
			.attr('font-style', 'italic');
		g.append('text')
			.attr('x', -15)
			.attr('y', 20)
			.text('A')
			.attr('font-weight', 'bold')
			.attr('font-size', '16px');
		g.append('text')
			.attr('x', dx + 10)
			.attr('y', 20)
			.text('B')
			.attr('font-weight', 'bold')
			.attr('font-size', '16px');
		g.append('text')
			.attr('x', dx + 10)
			.attr('y', -dy - 10)
			.text('C')
			.attr('font-weight', 'bold')
			.attr('font-size', '16px');
		g.append('text')
			.attr('x', -15)
			.attr('y', -dy - 10)
			.text('D')
			.attr('font-weight', 'bold')
			.attr('font-size', '16px');

		// Kinematics calculations
		const Bp_x = dx + du_dx * dx;
		const Bp_y = -(dv_dx * dx);

		const Dp_x = du_dy * dy;
		const Dp_y = -dy - dv_dy * dy;

		const Cp_x = dx + du_dx * dx + du_dy * dy;
		const Cp_y = -dy - dv_dy * dy - dv_dx * dx;

		// Deformed Polygon A' B' C' D'
		g.append('polygon')
			.attr('points', `0,0 ${Bp_x},${Bp_y} ${Cp_x},${Cp_y} ${Dp_x},${Dp_y}`)
			.attr('fill', 'rgba(59, 130, 246, 0.1)')
			.attr('stroke', '#3b82f6')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5');

		// Point Annotations for deformed
		g.append('text')
			.attr('x', -15)
			.attr('y', -5)
			.text("A'")
			.attr('fill', '#3b82f6')
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', Bp_x + 10)
			.attr('y', Bp_y - 5)
			.text("B'")
			.attr('fill', '#3b82f6')
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', Cp_x + 10)
			.attr('y', Cp_y - 10)
			.text("C'")
			.attr('fill', '#3b82f6')
			.attr('font-weight', 'bold');
		g.append('text')
			.attr('x', Dp_x - 15)
			.attr('y', Dp_y - 10)
			.text("D'")
			.attr('fill', '#3b82f6')
			.attr('font-weight', 'bold');

		// Draw alpha_x arc
		if (Math.abs(dv_dx) > 0.001) {
			const arcRadius = 50;
			const angle = Math.atan2(-Bp_y, Bp_x);
			g.append('path')
				.attr(
					'd',
					`M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 0 ${arcRadius * Math.cos(angle)} ${-arcRadius * Math.sin(angle)}`
				)
				.attr('fill', 'none')
				.attr('stroke', '#ef4444')
				.attr('stroke-width', 2);
			g.append('text')
				.attr('x', arcRadius + 15)
				.attr('y', -10)
				.text('α_x')
				.attr('fill', '#ef4444')
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.attr('font-style', 'italic');
		}

		// Draw alpha_y arc
		if (Math.abs(du_dy) > 0.001) {
			const arcRadius = 50;
			const angle = Math.atan2(Dp_x, -dy - Dp_y);
			g.append('path')
				.attr(
					'd',
					`M 0 ${-arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${arcRadius * Math.sin(angle)} ${-arcRadius * Math.cos(angle)}`
				)
				.attr('fill', 'none')
				.attr('stroke', '#ef4444')
				.attr('stroke-width', 2);
			g.append('text')
				.attr('x', 20)
				.attr('y', -arcRadius - 15)
				.text('α_y')
				.attr('fill', '#ef4444')
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.attr('font-style', 'italic');
		}
	}

	$effect(() => {
		if (
			svgElement &&
			P_kN !== undefined &&
			A_cm2 !== undefined &&
			E_GPa !== undefined &&
			L_0 !== undefined
		) {
			drawBar();
		}
		if (svgPlaneElement) {
			drawPlaneStrain();
		}
	});
</script>

<svelte:head>
	<title>Deformation, 1D & 2D Strain - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-12 border-b border-zinc-200 pb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Deformation, 1D & 2D Strain
		</h1>
		<p class="mt-4 text-lg text-zinc-600">
			Explore the fundamental definitions of <strong>Normal Strain</strong> (unit change in length)
			and <strong>Shear Strain</strong> (relative rotation). Starting from 1D axial loads mapping to
			1D displacement, we extend the visualization to complex 2D Plane Strain states mapping partial
			displacement gradients ({@html k(
				'\\frac{\\partial u}{\\partial x}, \\frac{\\partial v}{\\partial y}'
			)}).
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls -->
		<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">Variables</h2>

			<div>
				<label for="P" class="block text-sm font-medium text-zinc-700"
					>Applied Force (P) = {P_kN} kN</label
				>
				<input
					id="P"
					type="range"
					min="-100"
					max="100"
					bind:value={P_kN}
					class="mt-2 w-full accent-zinc-800"
				/>
				<div class="flex justify-between text-sm text-zinc-500">
					<span>Compression</span>
					<span>Tension</span>
				</div>
			</div>

			<div>
				<label for="A" class="block text-sm font-medium text-zinc-700"
					>Section Area (A) = {A_cm2} cm²</label
				>
				<input
					id="A"
					type="range"
					min="1"
					max="50"
					bind:value={A_cm2}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<div>
				<label for="E" class="block text-sm font-medium text-zinc-700"
					>Young's Modulus (E) = {E_GPa} GPa</label
				>
				<input
					id="E"
					type="range"
					min="10"
					max="250"
					step="10"
					bind:value={E_GPa}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<div>
				<label for="L" class="block text-sm font-medium text-zinc-700"
					>Initial Length ({@html k('L_0')}) = {L_0} mm</label
				>
				<input
					id="L"
					type="range"
					min="100"
					max="1000"
					step="50"
					bind:value={L_0}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<hr class="border-zinc-100" />

			<div class="rounded-xl border border-blue-100 bg-blue-50 p-6">
				<h4 class="mb-4 text-sm font-bold tracking-wider text-blue-800 uppercase">
					1D Strain Definitions
				</h4>
				<ul class="space-y-4 text-sm text-blue-900">
					<li>
						<strong>Local Normal Strain at a point:</strong>
						<div class="mt-2 font-mono">
							{@html k(
								'\\epsilon = \\lim_{\\Delta x \\to 0} \\frac{\\Delta x + \\Delta u - \\Delta x}{\\Delta x} = \\frac{du}{dx}'
							)}
						</div>
					</li>
					<li class="pt-2">
						<strong>Global Normal Strain (Uniform):</strong>
						<div class="mt-2 font-mono">
							{@html k('\\epsilon = \\frac{L_f - L_0}{L_0} = \\frac{\\delta}{L_0}')}
						</div>
					</li>
					<li class="border-t border-blue-200 pt-2">
						Calculated <span class="font-mono font-bold"
							>{@html k('\\delta')} = {delta.toFixed(4)} mm</span
						>
					</li>
				</ul>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<h3 class="mb-4 w-full text-left text-xl font-bold text-zinc-800">1D Axial Deformation</h3>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<p class="mt-4 max-w-sm text-center text-sm text-zinc-400">
				Visual deformation $\delta$ is highly exaggerated. Gray outline represents original
				undeformed element ($L_0$).
			</p>
		</div>
	</div>

	<!-- ================= 2D Plane Strain Section ================= -->
	<div class="mt-16 border-t border-zinc-200 pt-12">
		<h2 class="mb-6 text-3xl font-bold tracking-tight text-zinc-900">2D Plane Strain Geometry</h2>
		<p class="mb-8 max-w-4xl text-lg text-zinc-600">
			We now investigate the case of two-dimensional or plane strain. Consider an element with
			dimensions {@html k('dx, dy')} and of unit thickness. The total deformation consists of a
			<strong>change in length</strong>
			experienced by the sides (Normal Strain) and a <strong>relative rotation</strong> without accompanying
			changes of length (Shear Strain).
		</p>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<!-- 2D Controls -->
			<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h3 class="border-b border-zinc-100 pb-2 text-xl font-bold text-zinc-900">
					Displacement Gradients
				</h3>

				<div class="space-y-4">
					<div>
						<div class="mb-1 flex items-center justify-between">
							<label class="text-sm font-medium text-zinc-700"
								>X-Axis stretch {@html k('(\\partial u / \\partial x)')}</label
							>
							<span class="rounded bg-zinc-100 px-2 font-mono text-sm">{du_dx.toFixed(2)}</span>
						</div>
						<input
							type="range"
							min="0"
							max="0.5"
							step="0.01"
							bind:value={du_dx}
							class="w-full accent-blue-600"
						/>
						<p class="text-sm text-zinc-400">
							Controls normal strain {@html k('\\epsilon_x')} (elongation of A-B)
						</p>
					</div>

					<div>
						<div class="mb-1 flex items-center justify-between">
							<label class="text-sm font-medium text-zinc-700"
								>Y-Axis stretch {@html k('(\\partial v / \\partial y)')}</label
							>
							<span class="rounded bg-zinc-100 px-2 font-mono text-sm">{dv_dy.toFixed(2)}</span>
						</div>
						<input
							type="range"
							min="0"
							max="0.5"
							step="0.01"
							bind:value={dv_dy}
							class="w-full accent-blue-600"
						/>
						<p class="text-sm text-zinc-400">
							Controls normal strain {@html k('\\epsilon_y')} (elongation of A-D)
						</p>
					</div>

					<hr class="my-4 border-zinc-100" />

					<div>
						<div class="mb-1 flex items-center justify-between">
							<label class="text-sm font-medium text-zinc-700"
								>Horizontal rotation {@html k('\\alpha_x = (\\partial v / \\partial x)')}</label
							>
							<span class="rounded bg-zinc-100 px-2 font-mono text-sm"
								>{((dv_dx * 180) / Math.PI).toFixed(1)}°</span
							>
						</div>
						<input
							type="range"
							min="0"
							max="0.5"
							step="0.01"
							bind:value={dv_dx}
							class="w-full accent-red-500"
						/>
					</div>

					<div>
						<div class="mb-1 flex items-center justify-between">
							<label class="text-sm font-medium text-zinc-700"
								>Vertical rotation {@html k('\\alpha_y = (\\partial u / \\partial y)')}</label
							>
							<span class="rounded bg-zinc-100 px-2 font-mono text-sm"
								>{((du_dy * 180) / Math.PI).toFixed(1)}°</span
							>
						</div>
						<input
							type="range"
							min="0"
							max="0.5"
							step="0.01"
							bind:value={du_dy}
							class="w-full accent-red-500"
						/>
					</div>
					<p class="pt-1 text-sm text-zinc-400">
						Total Engineering Shear Strain: {@html k('\\gamma_{xy} = \\alpha_x + \\alpha_y')}
					</p>
				</div>
			</div>

			<!-- 2D Interactive SVG -->
			<div
				class="flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
			>
				<svg
					bind:this={svgPlaneElement}
					width="600"
					height="350"
					class="overflow-visible select-none"
				></svg>
				<p class="mt-4 max-w-md text-center text-sm text-zinc-400">
					Original un-deformed element (A, B, C, D) vs Deformed mapped element (A', B', C', D').
					Rotations ({@html k('\\alpha_x, \\alpha_y')}) drive shear, extensions drive normal strain.
				</p>
			</div>
		</div>
	</div>

	<!-- Bottom Row: Physical Insights -->
	<div class="mt-12 rounded-2xl border-l-[6px] border-indigo-500 bg-indigo-50/50 p-8 shadow-sm">
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
			Physical Insights: From Normal to Plane Strain
		</h2>

		<div class="prose prose-sm max-w-none text-indigo-900/80 prose-indigo">
			<h4>1D Simplification</h4>
			<p>
				In the 1D axial bar, the element deforms strictly along the x-axis. As the slice {@html k(
					'\\Delta x'
				)} shrinks to a point ({@html k('\\Delta x \\to 0')}), the strain converges to the local
				derivative {@html k('\\frac{du}{dx}')}. For uniform loading bars, we approximate the global
				strain as the overall elongation divided by the original length ({@html k(
					'\\frac{\\delta}{L_0}'
				)}).
			</p>
			<h4>2D Complexity: Mapping Displacements to Shapes</h4>
			<p>
				In two dimensions, a simple point displacement {@html k('(u, v)')} isn't enough to define stress;
				rigid body translation does not induce stress. Instead, we must track the
				<strong>relative change</strong> across an element.
			</p>
			<ul>
				<li>
					<strong>Normal Strain ({@html k('\\epsilon_x, \\epsilon_y')}):</strong> Found entirely
					from longitudinal spatial derivatives ({@html k('\\frac{\\partial u}{\\partial x}')} and {@html k(
						'\\frac{\\partial v}{\\partial y}'
					)}). They stretch the box into a larger rectangle without changing the {@html k(
						'90^\\circ'
					)} corner angles.
				</li>
				<li>
					<strong>Shear Strain ({@html k('\\gamma_{xy}')}):</strong> Found entirely from
					cross-spatial derivatives ({@html k('\\frac{\\partial v}{\\partial x}')} and {@html k(
						'\\frac{\\partial u}{\\partial y}'
					)}). They skew the box into a rhombus. The sum of these two angular defects forms the
					Engineering Shear Strain.
				</li>
			</ul>
			<p>
				This fundamental distinction between lengthening parts (Normal) and skewing parts (Shear)
				sets the basis for Cauchy's general 3D Strain Tensor.
			</p>
		</div>
	</div>
</div>
