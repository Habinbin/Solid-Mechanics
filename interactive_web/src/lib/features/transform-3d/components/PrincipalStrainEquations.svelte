<script lang="ts">
	import type { Transform3DState } from '../state.svelte.js';
	import katex from 'katex';

	let { state }: { state: Transform3DState } = $props();

	const k = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: false });

	const kd = (expr: string) =>
		katex.renderToString(expr, { throwOnError: false, displayMode: true });

	// A helper to format numbers for equations
	const fmt = (num: number) => num.toFixed(1);
</script>

<div class="space-y-12">
	<!-- Tensor Setup Inputs -->
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<!-- Normal Strains -->
		<div class="space-y-6">
			<h4 class="border-b border-zinc-200 pb-2 font-semibold text-zinc-900">Normal Strains</h4>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="epsX" class="font-medium text-zinc-700">{@html k('\\varepsilon_x')}</label>
					<span class="font-mono text-zinc-500">{state.epsX.toFixed(1)}</span>
				</div>
				<input
					id="epsX"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.epsX}
					class="w-full"
				/>
			</div>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="epsY" class="font-medium text-zinc-700">{@html k('\\varepsilon_y')}</label>
					<span class="font-mono text-zinc-500">{state.epsY.toFixed(1)}</span>
				</div>
				<input
					id="epsY"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.epsY}
					class="w-full"
				/>
			</div>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="epsZ" class="font-medium text-zinc-700">{@html k('\\varepsilon_z')}</label>
					<span class="font-mono text-zinc-500">{state.epsZ.toFixed(1)}</span>
				</div>
				<input
					id="epsZ"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.epsZ}
					class="w-full"
				/>
			</div>
		</div>

		<!-- Shear Strains -->
		<div class="space-y-6">
			<h4 class="border-b border-zinc-200 pb-2 font-semibold text-zinc-900">
				Engineering Shear Strains
			</h4>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="gammaXY" class="font-medium text-zinc-700">{@html k('\\gamma_{xy}')}</label>
					<span class="font-mono text-zinc-500">{state.gammaXY.toFixed(1)}</span>
				</div>
				<input
					id="gammaXY"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.gammaXY}
					class="w-full accent-blue-500"
				/>
			</div>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="gammaYZ" class="font-medium text-zinc-700">{@html k('\\gamma_{yz}')}</label>
					<span class="font-mono text-zinc-500">{state.gammaYZ.toFixed(1)}</span>
				</div>
				<input
					id="gammaYZ"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.gammaYZ}
					class="w-full accent-blue-500"
				/>
			</div>
			<div>
				<div class="mb-2 flex justify-between text-sm">
					<label for="gammaZX" class="font-medium text-zinc-700">{@html k('\\gamma_{zx}')}</label>
					<span class="font-mono text-zinc-500">{state.gammaZX.toFixed(1)}</span>
				</div>
				<input
					id="gammaZX"
					type="range"
					min="-200"
					max="200"
					step="1"
					bind:value={state.gammaZX}
					class="w-full accent-blue-500"
				/>
			</div>
		</div>
	</div>

	<!-- Invariants Calculation Matrix -->
	<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-emerald-800">
			Strain Tensor & Cubic Equation Invariants
		</h3>

		<div class="prose prose-sm max-w-none text-zinc-700">
			<p>In 3D, principal strains are the roots of the cubic equation:</p>
			<div
				class="relative overflow-x-auto rounded border border-zinc-200 bg-white p-4 text-center font-bold"
			>
				{@html kd('\\varepsilon_p^3 - J_1\\varepsilon_p^2 + J_2\\varepsilon_p - J_3 = 0')}
			</div>

			<p class="mt-4">
				Just like stress invariants ($I_1, I_2, I_3$), strain invariants can be formed identically
				by replacing the normal stress $\sigma$ with normal strain $\varepsilon$ and shear stress
				$\tau$ with <strong>half the engineering shear strain $\gamma / 2$</strong> (Tensor shear strain).
			</p>

			<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="rounded-lg border border-zinc-200 bg-white p-4 text-center">
					<div class="mb-2 border-b pb-2 font-semibold text-zinc-800">First Invariant</div>
					{@html kd(`J_1 = \\varepsilon_x + \\varepsilon_y + \\varepsilon_z`)}
					<div class="mt-2 text-lg font-bold text-indigo-600">J₁ = {fmt(state.J1)}</div>
				</div>

				<div class="rounded-lg border border-zinc-200 bg-white p-4 text-center">
					<div class="mb-2 border-b pb-2 font-semibold text-zinc-800">Second Invariant</div>
					{@html kd(
						`J_2 = \\varepsilon_x\\varepsilon_y + \\varepsilon_y\\varepsilon_z + \\varepsilon_z\\varepsilon_x - \\left(\\frac{\\gamma_{xy}}{2}\\right)^2 - \\left(\\frac{\\gamma_{yz}}{2}\\right)^2 - \\left(\\frac{\\gamma_{zx}}{2}\\right)^2`
					)}
					<div class="mt-2 text-lg font-bold text-indigo-600">J₂ = {fmt(state.J2)}</div>
				</div>

				<div class="rounded-lg border border-zinc-200 bg-white p-4 text-center">
					<div class="mb-2 border-b pb-2 font-semibold text-zinc-800">Third Invariant</div>
					<div class="overflow-x-auto text-xs">
						{@html kd(
							`J_3 = \\begin{vmatrix} \\varepsilon_x & \\gamma_{xy}/2 & \\gamma_{xz}/2 \\\\ \\gamma_{xy}/2 & \\varepsilon_y & \\gamma_{yz}/2 \\\\ \\gamma_{xz}/2 & \\gamma_{yz}/2 & \\varepsilon_z \\end{vmatrix}`
						)}
					</div>
					<div class="mt-2 text-lg font-bold text-indigo-600">J₃ = {fmt(state.J3)}</div>
				</div>
			</div>
		</div>
	</div>
</div>
