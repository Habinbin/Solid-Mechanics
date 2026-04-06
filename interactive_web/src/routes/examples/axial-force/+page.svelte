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
	let L_mm = $state(500); // Initial length in mm

	// Scientific conversions for exact computation
	let P_N = $derived(P_kN * 1000);
	let A_m2 = $derived(A_cm2 * 1e-4);
	let E_Pa = $derived(E_GPa * 1e9);
	let L_m = $derived(L_mm / 1000);

	// Derived Mechanics States
	let sigma_MPa = $derived(P_N / A_m2 / 1e6); // Normal Stress
	let strain = $derived(P_N / A_m2 / E_Pa); // Strain (unitless)
	let delta_mm = $derived(strain * L_m * 1000); // Deformation

	let svgElement = $state<SVGSVGElement>();
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
		const pixelLen = (L_mm / 500) * basePixelLen;

		// Scale visual deformation highly exaggerated for visibility
		const pixelDelta = delta_mm * 50;
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
				.attr('font-size', '12px')
				.attr('fill', '#ef4444')
				.text(`δ = ${delta_mm.toFixed(3)} mm`);
		}
	}

	$effect(() => {
		if (
			svgElement &&
			P_kN !== undefined &&
			A_cm2 !== undefined &&
			E_GPa !== undefined &&
			L_mm !== undefined
		) {
			drawBar();
		}
	});
</script>

<svelte:head>
	<title>Axial Force & Strain - Solid Mechanics</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Axial Force, Strain & Stress
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Explore the fundamental relationship between applied internal forces, generating stress
			distributed across an area, which in turn causes proportional physical strain and deformation.
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
				<div class="flex justify-between text-xs text-zinc-500">
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
					>Initial Length (L) = {L_mm} mm</label
				>
				<input
					id="L"
					type="range"
					min="100"
					max="1000"
					step="50"
					bind:value={L_mm}
					class="mt-2 w-full accent-zinc-800"
				/>
			</div>

			<hr class="border-zinc-100" />

			<div class="rounded-xl border border-blue-100 bg-blue-50 p-6">
				<h4 class="mb-4 text-xs font-bold tracking-wider text-blue-800 uppercase">
					Sequence Mathematics
				</h4>
				<ul class="space-y-4 font-mono text-sm text-blue-900">
					<li class="flex items-center gap-2">
						<span class="w-20">1. Stress:</span>
						{@html k('\\sigma = \\frac{P}{A} =')}
						<span class="font-bold">{sigma_MPa.toFixed(2)} MPa</span>
					</li>
					<li class="flex items-center gap-2">
						<span class="w-20">2. Strain:</span>
						{@html k('\\epsilon = \\frac{\\sigma}{E} =')}
						<span class="font-bold">{(strain * 1e6).toFixed(1)} με</span>
					</li>
					<li class="flex items-center gap-2">
						<span class="w-20">3. Deflect:</span>
						{@html k('\\delta = \\epsilon \\cdot L =')}
						<span class="font-bold">{delta_mm.toFixed(4)} mm</span>
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
				Visual deformation is highly exaggerated. Gray outline represents original undeformed
				element ($L$).
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
				The <strong>Axial Loading sequence</strong> ({@html k(
					'P \\to \\sigma \\to \\epsilon \\to \\delta'
				)}) forms the most foundational pathway in mechanics of materials. It demonstrates the
				profound concept that <em>external forces do not stretch bodies directly</em>; rather, they
				induce internal stresses, which the material resists via its stiffness causing microscopic
				strains, synthesizing into measurable macroscopic deformation.
			</p>

			<h4>Constitutive Law</h4>
			<p>
				The relationship between stress and strain is dictated by <strong>Hooke's Law</strong>
				({@html k('\\sigma = E \\epsilon')}). The arbitrary variable {@html k('E')} (Young's Modulus)
				defines the material's innate stiffness. A very stiff material (like Steel at 200 GPa) requires
				massive stresses to induce even tiny strains, thereby preventing significant structural deformation.
			</p>

			<h4>Geometric Influence</h4>
			<ul>
				<li>
					<strong>Cross-section ({@html k('A')}):</strong> Higher area rapidly decreases the
					resultant Stress ({@html k('\\sigma')}), acting naturally as structural reinforcement to
					blunt extreme forces.
				</li>
				<li>
					<strong>Length ({@html k('L')}):</strong> The initial length does not impact internal stress
					at all! However, strain (which is an elongation percentage) accumulates linearly over the length
					to render the final macroscopic deformation, meaning a remarkably long structure can deflect
					inches even under minimal stress constraints.
				</li>
			</ul>
		</div>
	</div>
</div>
