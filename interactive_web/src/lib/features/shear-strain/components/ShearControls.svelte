<script lang="ts">
	import katex from 'katex';
	import type { ShearState } from '../state.svelte.js';

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	let { state }: { state: ShearState } = $props();
</script>

<div class="space-y-8">
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label for="u-disp" class="block font-medium text-zinc-700"
				>{@html k('u')} (Top Translation)</label
			>
			<span class="text-sm font-semibold text-blue-500">{state.u.toFixed(1)} px</span>
		</div>
		<input
			id="u-disp"
			type="range"
			min="-100"
			max="100"
			step="1"
			bind:value={state.u}
			class="w-full accent-blue-500"
		/>
	</div>

	<div>
		<div class="mb-2 flex items-center justify-between">
			<label for="v-disp" class="block font-medium text-zinc-700"
				>{@html k('v')} (Right Translation)</label
			>
			<span class="text-sm font-semibold text-red-500">{state.v.toFixed(1)} px</span>
		</div>
		<input
			id="v-disp"
			type="range"
			min="-100"
			max="100"
			step="1"
			bind:value={state.v}
			class="w-full accent-red-500"
		/>
	</div>

	<div class="mt-12 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
		<h3 class="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
			Shear Strain Components
		</h3>
		<div class="flex flex-col gap-3 font-mono text-lg text-zinc-800">
			<div class="flex items-center justify-between">
				<span class="text-sm">{@html k('\\alpha \\approx u / \\Delta y')}</span>
				<span class="text-blue-600">{state.alpha.toFixed(3)} rad</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm">{@html k('\\beta \\approx v / \\Delta x')}</span>
				<span class="text-red-600">{state.beta.toFixed(3)} rad</span>
			</div>
			<div class="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 font-bold">
				<span class="text-sm">{@html k('\\gamma_{xy} = \\alpha + \\beta')}</span>
				<span class="text-indigo-600">{state.gamma.toFixed(3)} rad</span>
			</div>
		</div>
	</div>
</div>
