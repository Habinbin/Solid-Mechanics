<script lang="ts">
	import type { Transform3DState } from '../state.svelte.js';
	import katex from 'katex';

	let { state }: { state: Transform3DState } = $props();

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	const width = 450;
	const height = 450;
	const originX = 150;
	const originY = 300;
	const scale = 120; // 3D axis drawing scale

	// Pseudo-isometric transformation manually mapping 3D to 2D
	const proj = (x: number, y: number, z: number) => {
		// x goes bottom-left (-0.7, 0.4)
		// y goes bottom-right (0.8, 0.3)
		// z goes up (0, -1)
		return {
			x: originX - 0.7 * x * scale + 0.9 * y * scale,
			y: originY + 0.4 * x * scale + 0.2 * y * scale - z * scale
		};
	};

	let originScreen = $derived(proj(0, 0, 0));
	let xScreen = $derived(proj(1.5, 0, 0));
	let yScreen = $derived(proj(0, 1.5, 0));
	let zScreen = $derived(proj(0, 0, 1.5));

	// The arbitrary transformed axis point
	let nx = $derived(state.l);
	let ny = $derived(state.m);
	let nz = $derived(state.n);
	let vectorScreen = $derived(proj(nx, ny, nz));

	// Projection lines onto coordinate planes to give depth feeling
	let projXY = $derived(proj(nx, ny, 0));
</script>

<div class="flex flex-col items-center gap-8">
	<div
		class="flex w-full flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:flex-row"
	>
		<!-- SVG Canvas -->
		<svg {width} {height} class="overflow-visible rounded-lg bg-zinc-50 shadow-inner select-none">
			<defs>
				<marker
					id="arrow-axis"
					viewBox="0 -5 10 10"
					refX="8"
					refY="0"
					markerWidth="5"
					markerHeight="5"
					orient="auto"
				>
					<path d="M0,-5L10,0L0,5" fill="#9ca3af" />
				</marker>
				<marker
					id="arrow-vector"
					viewBox="0 -5 10 10"
					refX="8"
					refY="0"
					markerWidth="6"
					markerHeight="6"
					orient="auto"
				>
					<path d="M0,-5L10,0L0,5" fill="#6366f1" />
				</marker>
			</defs>

			<!-- Coordinate Axes -->
			<line
				x1={originScreen.x}
				y1={originScreen.y}
				x2={xScreen.x}
				y2={xScreen.y}
				stroke="#9ca3af"
				stroke-width="2"
				marker-end="url(#arrow-axis)"
			/>
			<line
				x1={originScreen.x}
				y1={originScreen.y}
				x2={yScreen.x}
				y2={yScreen.y}
				stroke="#9ca3af"
				stroke-width="2"
				marker-end="url(#arrow-axis)"
			/>
			<line
				x1={originScreen.x}
				y1={originScreen.y}
				x2={zScreen.x}
				y2={zScreen.y}
				stroke="#9ca3af"
				stroke-width="2"
				marker-end="url(#arrow-axis)"
			/>

			<!-- Labels for Axes -->
			<text
				x={xScreen.x - 15}
				y={xScreen.y + 20}
				font-family="serif"
				font-style="italic"
				fill="#6b7280"
				font-size="14">x</text
			>
			<text
				x={yScreen.x + 10}
				y={yScreen.y + 10}
				font-family="serif"
				font-style="italic"
				fill="#6b7280"
				font-size="14">y</text
			>
			<text
				x={zScreen.x}
				y={zScreen.y - 10}
				font-family="serif"
				font-style="italic"
				fill="#6b7280"
				font-size="14">z</text
			>

			<!-- Helper lines for 3D depth of vector -->
			<!-- Line connecting vector to xy plane -->
			<line
				x1={vectorScreen.x}
				y1={vectorScreen.y}
				x2={projXY.x}
				y2={projXY.y}
				stroke="#cbd5e1"
				stroke-width="1.5"
				stroke-dasharray="4,4"
			/>
			<!-- Line connecting projXY to x and y axes -->
			<line
				x1={projXY.x}
				y1={projXY.y}
				x2={proj(nx, 0, 0).x}
				y2={proj(nx, 0, 0).y}
				stroke="#cbd5e1"
				stroke-width="1.5"
				stroke-dasharray="4,4"
			/>
			<line
				x1={projXY.x}
				y1={projXY.y}
				x2={proj(0, ny, 0).x}
				y2={proj(0, ny, 0).y}
				stroke="#cbd5e1"
				stroke-width="1.5"
				stroke-dasharray="4,4"
			/>

			<!-- The Target Normal Vector -->
			<line
				x1={originScreen.x}
				y1={originScreen.y}
				x2={vectorScreen.x}
				y2={vectorScreen.y}
				stroke="#6366f1"
				stroke-width="3"
				marker-end="url(#arrow-vector)"
			/>

			<!-- Vector Label x' -->
			<text
				x={vectorScreen.x + 10}
				y={vectorScreen.y - 10}
				font-family="serif"
				font-weight="bold"
				fill="#4f46e5"
				font-size="16">x' (Normal)</text
			>

			<!-- Instead of arcs which are tricky in quasi-3D, draw dashed angle spans from origin -->
			<!-- Angle to x-axis -->
			<line
				x1={originScreen.x + (xScreen.x - originScreen.x) * 0.3}
				y1={originScreen.y + (xScreen.y - originScreen.y) * 0.3}
				x2={originScreen.x + (vectorScreen.x - originScreen.x) * 0.3}
				y2={originScreen.y + (vectorScreen.y - originScreen.y) * 0.3}
				stroke="#ef4444"
				stroke-width="2"
			/>
			<!-- Angle to z-axis -->
			<line
				x1={originScreen.x + (zScreen.x - originScreen.x) * 0.3}
				y1={originScreen.y + (zScreen.y - originScreen.y) * 0.3}
				x2={originScreen.x + (vectorScreen.x - originScreen.x) * 0.3}
				y2={originScreen.y + (vectorScreen.y - originScreen.y) * 0.3}
				stroke="#10b981"
				stroke-width="2"
			/>
		</svg>

		<!-- Angle Controls -->
		<div class="flex flex-1 flex-col justify-center space-y-8">
			<h3 class="border-b pb-2 text-lg font-bold text-zinc-900">
				Define Direction Normal Vector (x')
			</h3>

			<p class="mb-4 border-b border-zinc-100 pb-2 text-sm text-zinc-600">
				A new transformed coordinate axis <strong>x'</strong> is defined by its sweeping angle from
				the original <strong>x, y, z</strong> axes.
			</p>

			<div>
				<label for="vx" class="block flex justify-between text-sm font-medium text-zinc-700">
					<span>X Component ($V_x$)</span>
					<strong class="text-indigo-600"
						>l = {@html k('\\cos(\\theta_x)')} = {state.l.toFixed(3)}</strong
					>
				</label>
				<input
					id="vx"
					type="range"
					min="-2"
					max="2"
					step="0.01"
					bind:value={state.vx}
					class="mt-2 w-full"
				/>
				<div class="text-right text-xs text-red-500">
					{@html k(`\\theta_x`)} = {state.thetaX.toFixed(1)}°
				</div>
			</div>

			<div>
				<label for="vy" class="block flex justify-between text-sm font-medium text-zinc-700">
					<span>Y Component ($V_y$)</span>
					<strong class="text-indigo-600"
						>m = {@html k('\\cos(\\theta_y)')} = {state.m.toFixed(3)}</strong
					>
				</label>
				<input
					id="vy"
					type="range"
					min="-2"
					max="2"
					step="0.01"
					bind:value={state.vy}
					class="mt-2 w-full accent-amber-500"
				/>
				<div class="text-right text-xs text-amber-500">
					{@html k(`\\theta_y`)} = {state.thetaY.toFixed(1)}°
				</div>
			</div>

			<div>
				<label for="vz" class="block flex justify-between text-sm font-medium text-zinc-700">
					<span>Z Component ($V_z$)</span>
					<strong class="text-indigo-600"
						>n = {@html k('\\cos(\\theta_z)')} = {state.n.toFixed(3)}</strong
					>
				</label>
				<input
					id="vz"
					type="range"
					min="-2"
					max="2"
					step="0.01"
					bind:value={state.vz}
					class="mt-2 w-full accent-emerald-500"
				/>
				<div class="text-right text-xs text-emerald-500">
					{@html k(`\\theta_z`)} = {state.thetaZ.toFixed(1)}°
				</div>
			</div>

			<div
				class="space-y-2 rounded border border-zinc-200 bg-zinc-50 p-3 text-center font-mono text-sm shadow-sm"
			>
				<div>Identity rule validation:</div>
				<div class="font-bold text-zinc-800">
					{@html k('l^2 + m^2 + n^2')} = {(
						Math.pow(state.l, 2) +
						Math.pow(state.m, 2) +
						Math.pow(state.n, 2)
					).toFixed(3)}
				</div>
			</div>
		</div>
	</div>
</div>
