<script lang="ts">
	// Dashboard minimalist page for Solid Mechanics
</script>

<div class="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-200">
	<div class="mx-auto max-w-5xl px-6 py-20 lg:px-8">
		<header class="mt-12 mb-24">
			<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
				Solid Mechanics
			</h1>
			<p class="max-w-3xl text-xl leading-relaxed font-light text-zinc-500">
				An interactive, physics-based educational platform exploring the mechanics of materials.
				Adjust physical variables in real-time to build deep physical insights into internal stress
				states and their transformations.
			</p>
		</header>

		<div class="space-y-4">
			<h2 class="mb-8 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
				Interactive Visualizations
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Stress Element Card -->
				<a
					href="/examples/stress-element"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">2D Stress Element</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						Analyze the internal stress state of a material under general planar loading.
						Dynamically adjust normal and shear stresses on an infinitesimally small square element
						to visualize force equilibrium.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>Stress Tensor</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>Vector Visualization</span
						>
					</div>
				</a>

				<!-- Mohr's Circle Card -->
				<a
					href="/examples/mohrs-circle"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">
							Mohr's Circle & Transformation
						</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						Understand stress transformation on inclined planes. Rotate the cut plane angle and
						trace the coordinate path to intuitively determine principal stresses.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>Coordinate Transform</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>Principal Stress</span
						>
					</div>
				</a>

				<!-- Axial Force & Strain Card -->
				<a
					href="/examples/axial-force"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">Axial Force & Strain</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						Explore the foundational relationships between applied forces, internal stress, strain,
						and resultant physical deformation.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>Hooke's Law</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>Deformation Analysis</span
						>
					</div>
				</a>

				<!-- Inclined Plane Stress Card -->
				<a
					href="/examples/inclined-plane"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">
							Stress on an Inclined Plane
						</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						Analyze how a uniaxial load induces both normal and shear stress on an arbitrary
						internal cut plane. See how cut plane area enlarges visually.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>Stress Comp.</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>Plane Area</span
						>
					</div>
				</a>

				<!-- 2D Wedge Element Card -->
				<a
					href="/examples/wedge-element"
					class="group block rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:border-zinc-900"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-2xl font-bold text-zinc-900 transition-colors">
							Cauchy Stress (Wedge Element)
						</h3>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-zinc-300 transition-colors group-hover:text-zinc-900"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"
							></polyline></svg
						>
					</div>
					<p class="text-sm leading-relaxed text-zinc-500">
						Visualize 2D stress transformation from a generalized planar state using a geometric
						wedge. Direct projection using Cauchy's stress theorem.
					</p>
					<div class="mt-8 flex gap-2">
						<span
							class="inline-flex items-center rounded-md bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
							>Cauchy Theorem</span
						>
						<span
							class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600"
							>Wedge Method</span
						>
					</div>
				</a>
			</div>
		</div>
	</div>
</div>
