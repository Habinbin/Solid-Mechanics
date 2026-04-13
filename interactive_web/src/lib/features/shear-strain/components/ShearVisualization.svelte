<script lang="ts">
	import type { ShearState } from '../state.svelte.js';
	import katex from 'katex';

	let { state }: { state: ShearState } = $props();

	const width = 500;
	const height = 500;

	// Bottom-Left origin for intuitive math mapping
	const originX = 150;
	const originY = 350;

	// Deformed Points
	let p0 = $derived({ x: originX, y: originY });
	let p1 = $derived({ x: originX + state.dx, y: originY - state.v }); // Bottom-Right deformed
	let p2 = $derived({ x: originX + state.u, y: originY - state.dy }); // Top-Left deformed
	let p3 = $derived({ x: originX + state.dx + state.u, y: originY - state.dy - state.v }); // Top-Right deformed

	// Calculate arc paths for alpha and beta visually
	const arcRadius = 40;

	let alphaPath = $derived(
		`M ${originX} ${originY - arcRadius} A ${arcRadius} ${arcRadius} 0 0 ${state.alpha > 0 ? 1 : 0} ${originX + Math.sin(state.alpha) * arcRadius} ${originY - Math.cos(state.alpha) * arcRadius}`
	);
	let betaPath = $derived(
		`M ${originX + arcRadius} ${originY} A ${arcRadius} ${arcRadius} 0 0 ${state.beta > 0 ? 0 : 1} ${originX + Math.cos(state.beta) * arcRadius} ${originY - Math.sin(state.beta) * arcRadius}`
	);

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });
</script>

<div class="flex flex-col items-center justify-center">
	<svg {width} {height} class="overflow-visible select-none">
		<defs>
			<marker
				id="arrow-blue"
				viewBox="0 -5 10 10"
				refX="8"
				refY="0"
				markerWidth="6"
				markerHeight="6"
				orient="auto"
			>
				<path d="M0,-5L10,0L0,5" fill="#3b82f6" />
			</marker>
			<marker
				id="arrow-red"
				viewBox="0 -5 10 10"
				refX="8"
				refY="0"
				markerWidth="6"
				markerHeight="6"
				orient="auto"
			>
				<path d="M0,-5L10,0L0,5" fill="#ef4444" />
			</marker>
			<marker
				id="arrow-gray"
				viewBox="0 -5 10 10"
				refX="8"
				refY="0"
				markerWidth="6"
				markerHeight="6"
				orient="auto"
			>
				<path d="M0,-5L10,0L0,5" fill="#9ca3af" />
			</marker>
		</defs>

		<!-- Axes -->
		<line
			x1={originX - 50}
			y1={originY}
			x2={originX + 300}
			y2={originY}
			stroke="#9ca3af"
			stroke-width="2"
			marker-end="url(#arrow-gray)"
		/>
		<line
			x1={originX}
			y1={originY + 50}
			x2={originX}
			y2={originY - 300}
			stroke="#9ca3af"
			stroke-width="2"
			marker-end="url(#arrow-gray)"
		/>

		<!-- Original Box (Dashed) -->
		<rect
			x={originX}
			y={originY - state.dy}
			width={state.dx}
			height={state.dy}
			fill="none"
			stroke="#d1d5db"
			stroke-width="2"
			stroke-dasharray="6,6"
		/>

		<!-- Deformed Box (Solid) -->
		<polygon
			points="{p0.x},{p0.y} {p1.x},{p1.y} {p3.x},{p3.y} {p2.x},{p2.y}"
			fill="#e0e7ff"
			stroke="#6366f1"
			stroke-width="2"
			fill-opacity="0.5"
		/>

		<!-- Alpha Arc (blue) -->
		{#if Math.abs(state.alpha) > 0.02}
			<path d={alphaPath} stroke="#3b82f6" stroke-width="2" fill="none" />
			<foreignObject
				x={originX + Math.sin(state.alpha) * arcRadius - 15}
				y={originY - arcRadius - 25}
				width="30"
				height="30"
				class="overflow-visible"
			>
				<div class="text-center text-sm font-semibold text-blue-600">{@html k('\\alpha')}</div>
			</foreignObject>
		{/if}

		<!-- Beta Arc (red) -->
		{#if Math.abs(state.beta) > 0.02}
			<path d={betaPath} stroke="#ef4444" stroke-width="2" fill="none" />
			<foreignObject
				x={originX + arcRadius + 5}
				y={originY - Math.sin(state.beta) * arcRadius - 15}
				width="30"
				height="30"
				class="overflow-visible"
			>
				<div class="text-center text-sm font-semibold text-red-600">{@html k('\\beta')}</div>
			</foreignObject>
		{/if}

		<!-- u translation vector -->
		{#if Math.abs(state.u) > 0}
			<line
				x1={originX}
				y1={originY - state.dy}
				x2={p2.x}
				y2={p2.y}
				stroke="#3b82f6"
				stroke-width="2"
				marker-end="url(#arrow-blue)"
			/>
		{/if}

		<!-- v translation vector -->
		{#if Math.abs(state.v) > 0}
			<line
				x1={originX + state.dx}
				y1={originY}
				x2={p1.x}
				y2={p1.y}
				stroke="#ef4444"
				stroke-width="2"
				marker-end="url(#arrow-red)"
			/>
		{/if}

		<!-- Axis labels -->
		<foreignObject x={originX + 310} y={originY - 15} width="30" height="30">
			<div class="font-serif text-sm text-zinc-500 italic">x</div>
		</foreignObject>
		<foreignObject x={originX - 15} y={originY - 320} width="30" height="30">
			<div class="font-serif text-sm text-zinc-500 italic">y</div>
		</foreignObject>
	</svg>
</div>
