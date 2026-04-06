<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import katex from 'katex';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	const kd = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: true });

	// State Variables
	let sigma_x = $state(50);
	let sigma_y = $state(20);
	let tau_xy = $state(30);
	let theta_deg = $state(30);

	let theta_rad = $derived((theta_deg * Math.PI) / 180);

	// Derived Calculations
	let p_x = $derived(sigma_x * Math.cos(theta_rad) + tau_xy * Math.sin(theta_rad));
	let p_y = $derived(tau_xy * Math.cos(theta_rad) + sigma_y * Math.sin(theta_rad));

	let sigma_xp = $derived(p_x * Math.cos(theta_rad) + p_y * Math.sin(theta_rad));
	let tau_xpyp = $derived(p_y * Math.cos(theta_rad) - p_x * Math.sin(theta_rad));

	let svgElement = $state<SVGSVGElement>();
	let projSvgElement = $state<SVGSVGElement>();

	const width = 600;
	const height = 500;
	const L = 250; // Hypotenuse physical length
	const cx = width / 2;
	const cy = height / 2;

	function drawElement() {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		// Definitions for arrowhead markers
		const defs = svg.append('defs');
		createMarker(defs, 'arrow-red', '#ef4444');
		createMarker(defs, 'arrow-blue', '#3b82f6');
		createMarker(defs, 'arrow-purple', '#8b5cf6');
		createMarker(defs, 'arrow-dark', '#18181b');

		const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

		// Math Coordinate Vertices
		const A_math = [-(L / 2) * Math.sin(theta_rad), (L / 2) * Math.cos(theta_rad)];
		const B_math = [(L / 2) * Math.sin(theta_rad), -(L / 2) * Math.cos(theta_rad)];
		const Q_math = [-(L / 2) * Math.sin(theta_rad), -(L / 2) * Math.cos(theta_rad)];

		// Draw the Wedge Triangle
		g.append('polygon')
			.attr(
				'points',
				`
				${A_math[0]},${-A_math[1]} 
				${B_math[0]},${-B_math[1]} 
				${Q_math[0]},${-Q_math[1]}
			`
			)
			.attr('fill', '#f4f4f5')
			.attr('stroke', '#52525b')
			.attr('stroke-width', 2);

		// Stress Vectors Helper
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
			// Scale factor for visuals
			const scale = 0.8;

			g.append('line')
				.attr('x1', ox)
				.attr('y1', -oy)
				.attr('x2', ox + vx * scale)
				.attr('y2', -(oy + vy * scale))
				.attr('stroke', colorId.replace('arrow-', ''))
				// map name back to hex simply:
				.attr(
					'stroke',
					colorId === 'arrow-red'
						? '#ef4444'
						: colorId === 'arrow-blue'
							? '#3b82f6'
							: colorId === 'arrow-purple'
								? '#8b5cf6'
								: '#18181b'
				)
				.attr('stroke-width', 2)
				.attr('marker-end', `url(#${colorId})`);

			g.append('text')
				.attr('x', ox + vx * scale + offset[0])
				.attr('y', -(oy + vy * scale) - offset[1])
				.attr(
					'fill',
					colorId === 'arrow-red'
						? '#ef4444'
						: colorId === 'arrow-blue'
							? '#3b82f6'
							: colorId === 'arrow-purple'
								? '#8b5cf6'
								: '#18181b'
				)
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.text(label);
		};

		// 1. Stresses on the left vertical face (A-Q) -> Normal is -x
		const midAQ = [Q_math[0], (A_math[1] + Q_math[1]) / 2];
		drawVector(midAQ[0], midAQ[1], -sigma_x, 0, 'arrow-red', 'σx', [-25, -5]);
		drawVector(midAQ[0], midAQ[1], 0, -tau_xy, 'arrow-blue', 'τxy', [-25, 10]);

		// 2. Stresses on the bottom horizontal face (Q-B) -> Normal is -y
		const midQB = [(Q_math[0] + B_math[0]) / 2, Q_math[1]];
		drawVector(midQB[0], midQB[1], 0, -sigma_y, 'arrow-red', 'σy', [10, -15]);
		drawVector(midQB[0], midQB[1], -tau_xy, 0, 'arrow-blue', 'τxy', [20, -5]);

		// coordinate system on the inclined plane
		const xp_dir = [Math.cos(theta_rad), Math.sin(theta_rad)];
		const yp_dir = [-Math.sin(theta_rad), Math.cos(theta_rad)];

		// 3. Stresses on the inclined face (A-B) -> Normal is x'
		// Total traction vector p = (p_x, p_y)
		drawVector(0, 0, p_x, p_y, 'arrow-dark', 'p', [15, 15]);

		// Normal and shear components
		const v_sig_x = sigma_xp * xp_dir[0];
		const v_sig_y = sigma_xp * xp_dir[1];

		const v_tau_x = tau_xpyp * yp_dir[0];
		const v_tau_y = tau_xpyp * yp_dir[1];

		drawVector(0, 0, v_sig_x, v_sig_y, 'arrow-purple', "σx'", [10 * xp_dir[0], 10 * xp_dir[1]]);
		drawVector(0, 0, v_tau_x, v_tau_y, 'arrow-blue', "τx'y'", [10 * yp_dir[0], 10 * yp_dir[1]]);

		// Draw normal x' dotted line
		g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 120 * xp_dir[0])
			.attr('y2', -120 * xp_dir[1])
			.attr('stroke', '#a1a1aa')
			.attr('stroke-dasharray', '5,5');

		// Horizontal reference line for theta
		g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 60)
			.attr('y2', 0)
			.attr('stroke', '#d4d4d8')
			.attr('stroke-dasharray', '3,3');

		// Theta Angle Arc
		const arcRadius = 40;
		if (theta_deg > 2) {
			const arcX = arcRadius * Math.cos(theta_rad);
			const arcY = -arcRadius * Math.sin(theta_rad);

			g.append('path')
				.attr('d', `M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 0 ${arcX} ${arcY}`)
				.attr('fill', 'none')
				.attr('stroke', '#9333ea')
				.attr('stroke-width', 2);

			// Theta text label
			g.append('text')
				.attr('x', (arcRadius + 15) * Math.cos(theta_rad / 2))
				.attr('y', -(arcRadius + 15) * Math.sin(theta_rad / 2) + 5)
				.attr('fill', '#9333ea')
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.text('θ');
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

	function drawProjection() {
		if (!projSvgElement) return;
		const svg = d3.select(projSvgElement);
		svg.selectAll('*').remove();

		const pcx = 250;
		const pcy = 200;

		const defs = svg.append('defs');
		createMarker(defs, 'arrow-dark', '#18181b');
		createMarker(defs, 'arrow-orange', '#f97316');
		createMarker(defs, 'arrow-emerald', '#10b981');

		const g = svg.append('g').attr('transform', `translate(${pcx}, ${pcy})`);

		g.append('line')
			.attr('x1', -150)
			.attr('y1', 0)
			.attr('x2', 150)
			.attr('y2', 0)
			.attr('stroke', '#e4e4e7')
			.attr('stroke-dasharray', '4,4');
		g.append('line')
			.attr('x1', 0)
			.attr('y1', -150)
			.attr('x2', 0)
			.attr('y2', 150)
			.attr('stroke', '#e4e4e7')
			.attr('stroke-dasharray', '4,4');

		const xp_dir = [Math.cos(theta_rad), Math.sin(theta_rad)];
		g.append('line')
			.attr('x1', -180 * xp_dir[0])
			.attr('y1', 180 * xp_dir[1])
			.attr('x2', 180 * xp_dir[0])
			.attr('y2', -180 * xp_dir[1])
			.attr('stroke', '#a1a1aa')
			.attr('stroke-width', 2);
		g.append('text')
			.attr('x', 190 * xp_dir[0])
			.attr('y', -190 * xp_dir[1])
			.attr('fill', '#a1a1aa')
			.attr('font-weight', 'bold')
			.text("x'");

		const scale = 1.5;
		const vx = p_x * scale;
		const vy = p_y * scale;

		if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
			// p_x component
			g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', vx)
				.attr('y2', 0)
				.attr('stroke', '#f97316')
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrow-orange)');
			// p_y component
			g.append('line')
				.attr('x1', vx)
				.attr('y1', 0)
				.attr('x2', vx)
				.attr('y2', -vy)
				.attr('stroke', '#10b981')
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrow-emerald)');
			// p vector
			g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', vx)
				.attr('y2', -vy)
				.attr('stroke', '#18181b')
				.attr('stroke-width', 3)
				.attr('marker-end', 'url(#arrow-dark)');

			const proj_px = vx * Math.cos(theta_rad);
			const proj_py = vy * Math.sin(theta_rad);

			// Drop perpendiculars
			g.append('line')
				.attr('x1', vx)
				.attr('y1', 0)
				.attr('x2', proj_px * xp_dir[0])
				.attr('y2', -proj_px * xp_dir[1])
				.attr('stroke', '#f97316')
				.attr('stroke-dasharray', '3,3');
			g.append('line')
				.attr('x1', vx)
				.attr('y1', -vy)
				.attr('x2', (proj_px + proj_py) * xp_dir[0])
				.attr('y2', -(proj_px + proj_py) * xp_dir[1])
				.attr('stroke', '#18181b')
				.attr('stroke-dasharray', '3,3');

			// Projected segments
			g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', proj_px * xp_dir[0])
				.attr('y2', -proj_px * xp_dir[1])
				.attr('stroke', '#f97316')
				.attr('stroke-width', 6);
			g.append('line')
				.attr('x1', proj_px * xp_dir[0])
				.attr('y1', -proj_px * xp_dir[1])
				.attr('x2', (proj_px + proj_py) * xp_dir[0])
				.attr('y2', -(proj_px + proj_py) * xp_dir[1])
				.attr('stroke', '#10b981')
				.attr('stroke-width', 6);
		}
	}

	$effect(() => {
		if (svgElement && sigma_x !== undefined) {
			drawElement();
		}
		if (projSvgElement && sigma_x !== undefined) {
			drawProjection();
		}
	});
</script>

<svelte:head>
	<title>2D Wedge Element - Cauchy Stress</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
			>← Back to Dashboard</a
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900">
			Cauchy Stress on an Inclined Plane
		</h1>
		<p class="mt-2 text-lg text-zinc-600">
			Understand how stress vectors transform geometrically using the 2D Wedge Element.
		</p>
	</div>

	<!-- Direction Cosines Primer -->
	<div
		class="mb-12 grid grid-cols-1 gap-8 rounded-2xl border border-purple-200 bg-purple-50 p-8 shadow-sm lg:grid-cols-2"
	>
		<div>
			<h2 class="mb-4 flex items-center gap-2 text-2xl font-bold text-purple-900">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-purple-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
				Direction Cosines & Vector Projection
			</h2>
			<div class="prose prose-sm text-purple-900/80">
				<p>
					Before analyzing the wedge equilibrium, it's vital to understand the geometrical dot
					product known as <strong>Direction Cosines</strong> ({@html k('l, m, n')}).
				</p>
				<p>
					When we have a Traction Vector {@html k('\\mathbf{p} = (p_x, p_y)')} acting on the inclined
					plane, its component parallel to the normal axis {@html k("x'")} defines the Normal Stress {@html k(
						"\\sigma_{x'}"
					)}. To find this, we simply project {@html k('p_x')} and {@html k('p_y')} onto the {@html k(
						"x'"
					)} axis using direction cosines:
				</p>
				<ul class="rounded-lg border border-purple-200 bg-white/50 p-4 font-mono shadow-inner">
					<li>{@html k('l_1 = \\cos\\theta')}</li>
					<li>{@html k('m_1 = \\cos(90^\\circ-\\theta) = \\sin\\theta')}</li>
					<li class="mt-2 border-t border-purple-200 pt-2 font-bold">
						{@html k("\\sigma_{x'} = p_x l_1 + p_y m_1")}
					</li>
				</ul>
				<p class="mt-4">
					The visualization on the right interactively draws this projection. Note how the <span
						class="font-semibold text-orange-500">orange ($p_x$)</span
					>
					and <span class="font-semibold text-emerald-500">green ($p_y$)</span> lines perpendicularly
					project onto the $x'$ axis, exactly summing to form the total Normal Stress! Make changes to
					the sliders below to see it dynamically adjust.
				</p>
			</div>
		</div>
		<div
			class="flex items-center justify-center rounded-xl border border-purple-100 bg-white shadow-inner"
		>
			<svg bind:this={projSvgElement} width="500" height="400" class="overflow-visible"></svg>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left: Controls & Math -->
		<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			<h2 class="text-xl font-bold text-zinc-900">Stress State Parameters</h2>

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
					class="mt-2 w-full accent-red-500"
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
					class="mt-2 w-full accent-red-500"
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
					class="mt-2 w-full accent-blue-500"
				/>
			</div>
			<div class="border-t border-zinc-100 pt-4">
				<label for="theta" class="block text-sm font-bold font-medium text-purple-600"
					>Cut Angle {@html k('\\theta')} = {theta_deg}°</label
				>
				<input
					id="theta"
					type="range"
					min="0"
					max="90"
					bind:value={theta_deg}
					class="mt-2 w-full accent-purple-600"
				/>
			</div>

			<div class="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
				<h3 class="mb-4 text-sm font-bold tracking-wider text-zinc-500 uppercase">
					Cauchy's Project Equations
				</h3>
				<ul class="space-y-4 font-mono text-sm text-zinc-800">
					<li class="flex flex-col">
						<span>{@html k('p_x = \\sigma_x \\cos\\theta + \\tau_{xy} \\sin\\theta')}</span>
						<span class="text-right font-bold text-zinc-500">= {p_x.toFixed(2)} MPa</span>
					</li>
					<li class="flex flex-col">
						<span>{@html k('p_y = \\tau_{xy} \\cos\\theta + \\sigma_y \\sin\\theta')}</span>
						<span class="text-right font-bold text-zinc-500">= {p_y.toFixed(2)} MPa</span>
					</li>
					<li class="flex flex-col border-t border-zinc-200 pt-2">
						<span>{@html k("\\sigma_{x'} = p_x \\cos\\theta + p_y \\sin\\theta")}</span>
						<span class="text-right font-bold text-purple-600">= {sigma_xp.toFixed(2)} MPa</span>
					</li>
					<li class="flex flex-col">
						<span>{@html k("\\tau_{x'y'} = p_y \\cos\\theta - p_x \\sin\\theta")}</span>
						<span class="text-right font-bold text-blue-600">= {tau_xpyp.toFixed(2)} MPa</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- Right: Visualizer -->
		<div
			class="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<div
				class="absolute bottom-4 left-4 space-y-2 rounded-lg border border-zinc-200 bg-white/80 p-3 text-xs backdrop-blur-sm"
			>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-sm bg-red-500"></span> Normal Stresses on standard face
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-sm bg-zinc-800"></span> Total Traction Vector {@html k(
						'\\mathbf{p}'
					)}
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-sm bg-purple-500"></span> Projected Normal Stress {@html k(
						"\\sigma_{x'}"
					)}
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-sm bg-blue-500"></span> Projected Shear Stress {@html k(
						"\\tau_{x'y'}"
					)}
				</div>
			</div>
		</div>
	</div>

	<!-- Insights -->
	<div class="mt-8 rounded-2xl border-l-[6px] border-indigo-500 bg-indigo-50/50 p-8 shadow-sm">
		<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-indigo-900">
			Physical Insights
		</h2>
		<div class="prose prose-sm max-w-none text-indigo-900/80 prose-indigo">
			<p>
				Cauchy's Stress Theorem illustrates that the state of stress at a point in a completely
				continuum body is defined by a tensor. By summing the equilibrium forces on a <strong
					>wedge element</strong
				> (a 2D geometric reduction of the Cauchy Tetrahedron), we can project the internal stresses acting
				on the orthogonal faces onto any arbitrarily rotated cross-section.
			</p>
			<ul>
				<li>
					<strong>Traction Vector {@html k('\\mathbf{p}')}</strong>: Represents the absolute
					resultant force per unit area acting on the inclined plane.
				</li>
				<li>
					Resolving this traction vector along the normal and tangential axes of the inclined plane
					naturally yields the widely used 2D stress transformation equations required to plot <strong
						>Mohr's Circle</strong
					>.
				</li>
			</ul>
		</div>
	</div>
</div>
