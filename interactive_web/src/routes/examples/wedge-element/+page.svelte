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

	function getSliderStyle(val: number, min: number, max: number, color: string) {
		const span = max - min;
		const zeroPct = ((0 - min) / span) * 100;
		const valPct = ((val - min) / span) * 100;
		const start = Math.min(zeroPct, valPct);
		const end = Math.max(zeroPct, valPct);
		return `--track-bg: linear-gradient(to right, #e4e4e7 0%, #e4e4e7 ${start}%, ${color} ${start}%, ${color} ${end}%, #e4e4e7 ${end}%, #e4e4e7 100%); --thumb-color: ${color};`;
	}

	let svgElement = $state<SVGSVGElement>();
	let projSvgElement = $state<SVGSVGElement>();
	let chartSvgElement = $state<SVGSVGElement>();

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
		if (Math.abs(theta_deg) > 2) {
			const arcX = arcRadius * Math.cos(theta_rad);
			const arcY = -arcRadius * Math.sin(theta_rad);
			const sweepFlag = theta_deg < 0 ? 1 : 0;

			g.append('path')
				.attr('d', `M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${arcX} ${arcY}`)
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

			g.append('text')
				.attr('x', (arcRadius + 15) * Math.cos(theta_rad / 2))
				.attr('y', -(arcRadius + 15) * Math.sin(theta_rad / 2) + 5)
				.attr('fill', '#9333ea')
				.attr('font-size', '14px')
				.attr('font-weight', 'bold')
				.text('θ');
		}

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

	function drawChart() {
		if (!chartSvgElement) return;
		const svg = d3.select(chartSvgElement);
		svg.selectAll('*').remove();

		const margin = { top: 40, right: 40, bottom: 50, left: 60 };
		const w = 800 - margin.left - margin.right;
		const h = 400 - margin.top - margin.bottom;

		const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

		// Calculations
		const C = (sigma_x + sigma_y) / 2;
		const R = Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + Math.pow(tau_xy, 2));

		const sig_max = C + R;
		const sig_min = C - R;
		const tau_max = R;
		const tau_min = -R;

		// Principal angles (rad), kept between -Pi/2 and Pi/2
		let theta_p1 = Math.atan2(2 * tau_xy, sigma_x - sigma_y) / 2;
		let theta_p2 = theta_p1 > 0 ? theta_p1 - Math.PI / 2 : theta_p1 + Math.PI / 2;

		let theta_s1 = theta_p1 - Math.PI / 4;
		if (theta_s1 < -Math.PI / 2) theta_s1 += Math.PI;
		let theta_s2 = theta_s1 > 0 ? theta_s1 - Math.PI / 2 : theta_s1 + Math.PI / 2;

		// Data generation (-90 to 90)
		const data = [];
		for (let i = -90; i <= 90; i++) {
			const th = (i * Math.PI) / 180;
			const sig = C + ((sigma_x - sigma_y) / 2) * Math.cos(2 * th) + tau_xy * Math.sin(2 * th);
			const tau = -((sigma_x - sigma_y) / 2) * Math.sin(2 * th) + tau_xy * Math.cos(2 * th);
			data.push({ theta: i, sig, tau, thRad: th });
		}

		// Scales
		const max_y = Math.max(Math.abs(sig_max), Math.abs(sig_min), Math.abs(tau_max), 1);
		const yDomain = [-max_y * 1.2, max_y * 1.2];

		const xScale = d3.scaleLinear().domain([-90, 90]).range([0, w]);
		const yScale = d3.scaleLinear().domain(yDomain).range([h, 0]);

		// Axes
		const xAxis = d3
			.axisBottom(xScale)
			.tickValues([-90, -45, 0, 45, 90])
			.tickFormat((d) => d + '°');
		const yAxis = d3.axisLeft(yScale).ticks(7);

		g.append('g')
			.attr('transform', `translate(0, ${h / 2})`)
			.call(
				d3
					.axisBottom(xScale)
					.tickFormat(null as any)
					.ticks(0)
			)
			.attr('color', '#e4e4e7');
		g.append('g').attr('transform', `translate(0, ${h})`).call(xAxis).attr('font-size', '14px');
		g.append('g').call(yAxis).attr('font-size', '14px');

		g.append('text')
			.attr('x', w / 2)
			.attr('y', h + 40)
			.attr('text-anchor', 'middle')
			.text('Rotation Angle θ (degrees)')
			.attr('fill', '#52525b')
			.attr('font-weight', '500');
		g.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -h / 2)
			.attr('y', -45)
			.attr('text-anchor', 'middle')
			.text('Stress (MPa)')
			.attr('fill', '#52525b')
			.attr('font-weight', '500');

		// Lines
		const lineSig = d3
			.line<any>()
			.x((d) => xScale(d.theta))
			.y((d) => yScale(d.sig))
			.curve(d3.curveMonotoneX);
		const lineTau = d3
			.line<any>()
			.x((d) => xScale(d.theta))
			.y((d) => yScale(d.tau))
			.curve(d3.curveMonotoneX);

		g.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', '#ef4444')
			.attr('stroke-width', 3)
			.attr('stroke-opacity', 0.8)
			.attr('d', lineSig);
		g.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', '#3b82f6')
			.attr('stroke-width', 3)
			.attr('stroke-opacity', 0.8)
			.attr('d', lineTau);

		// Current Theta Tracking (SYNCED TO SLIDER)
		const currentThDeg = (theta_rad * 180) / Math.PI;
		g.append('line')
			.attr('x1', xScale(currentThDeg))
			.attr('x2', xScale(currentThDeg))
			.attr('y1', 0)
			.attr('y2', h)
			.attr('stroke', '#9333ea')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5')
			.style('pointer-events', 'none');
		g.append('circle')
			.attr('cx', xScale(currentThDeg))
			.attr('cy', yScale(sigma_xp))
			.attr('r', 6)
			.attr('fill', '#ef4444')
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.style('pointer-events', 'none');
		g.append('circle')
			.attr('cx', xScale(currentThDeg))
			.attr('cy', yScale(tau_xpyp))
			.attr('r', 6)
			.attr('fill', '#3b82f6')
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.style('pointer-events', 'none');

		// Extrema Highlighting
		const points = [
			{
				th: theta_p1,
				val:
					C + ((sigma_x - sigma_y) / 2) * Math.cos(2 * theta_p1) + tau_xy * Math.sin(2 * theta_p1),
				label: 'σ<tspan dy="4" font-size="10px">1</tspan>',
				c: '#ef4444'
			},
			{
				th: theta_p2,
				val:
					C + ((sigma_x - sigma_y) / 2) * Math.cos(2 * theta_p2) + tau_xy * Math.sin(2 * theta_p2),
				label: 'σ<tspan dy="4" font-size="10px">2</tspan>',
				c: '#ef4444'
			},
			{
				th: theta_s1,
				val: -((sigma_x - sigma_y) / 2) * Math.sin(2 * theta_s1) + tau_xy * Math.cos(2 * theta_s1),
				label: '',
				c: '#3b82f6'
			},
			{
				th: theta_s2,
				val: -((sigma_x - sigma_y) / 2) * Math.sin(2 * theta_s2) + tau_xy * Math.cos(2 * theta_s2),
				label: '',
				c: '#3b82f6'
			}
		];

		points[2].label =
			points[2].val > 0
				? 'τ<tspan dy="4" font-size="10px">max</tspan>'
				: 'τ<tspan dy="4" font-size="10px">min</tspan>';
		points[3].label =
			points[3].val > 0
				? 'τ<tspan dy="4" font-size="10px">max</tspan>'
				: 'τ<tspan dy="4" font-size="10px">min</tspan>';

		points.forEach((p) => {
			const thDeg = (p.th * 180) / Math.PI;
			g.append('circle')
				.attr('cx', xScale(thDeg))
				.attr('cy', yScale(p.val))
				.attr('r', 5)
				.attr('fill', p.c);
			g.append('text')
				.attr('x', xScale(thDeg))
				.attr('y', yScale(p.val) - 10)
				.attr('text-anchor', 'middle')
				.html(p.label)
				.attr('fill', p.c)
				.attr('font-size', '14px')
				.attr('font-weight', 'bold');
			g.append('line')
				.attr('x1', xScale(thDeg))
				.attr('x2', xScale(thDeg))
				.attr('y1', Math.min(yScale(p.val), yScale(0)))
				.attr('y2', Math.max(yScale(p.val), yScale(0)))
				.attr('stroke', p.c)
				.attr('stroke-dasharray', '3,3')
				.attr('opacity', 0.5);
		});

		// Hover interaction tracker
		const focus = g.append('g').style('display', 'none');
		focus
			.append('line')
			.attr('y1', 0)
			.attr('y2', h)
			.attr('stroke', '#71717a')
			.attr('stroke-dasharray', '4,4');

		const focusSig = focus.append('circle').attr('r', 5).attr('fill', '#ef4444');
		const focusTau = focus.append('circle').attr('r', 5).attr('fill', '#3b82f6');

		const tooltip = g.append('g').style('display', 'none');
		const tooltipRect = tooltip
			.append('rect')
			.attr('fill', 'rgba(255, 255, 255, 0.95)')
			.attr('stroke', '#d4d4d8')
			.attr('width', 130)
			.attr('height', 60)
			.attr('rx', 4);
		const tooltipTh = tooltip
			.append('text')
			.attr('x', 10)
			.attr('y', 20)
			.attr('font-size', '14px')
			.attr('font-weight', 'bold');
		const tooltipSig = tooltip
			.append('text')
			.attr('x', 10)
			.attr('y', 36)
			.attr('font-size', '14px')
			.attr('fill', '#ef4444')
			.attr('font-weight', 'bold');
		const tooltipTau = tooltip
			.append('text')
			.attr('x', 10)
			.attr('y', 52)
			.attr('font-size', '14px')
			.attr('fill', '#3b82f6')
			.attr('font-weight', 'bold');

		g.append('rect')
			.attr('width', w)
			.attr('height', h)
			.attr('fill', 'transparent')
			.style('cursor', 'crosshair')
			.on('mouseover', () => {
				focus.style('display', null);
				tooltip.style('display', null);
			})
			.on('mouseout', () => {
				focus.style('display', 'none');
				tooltip.style('display', 'none');
			})
			.on('mousemove', (event) => {
				const [xm] = d3.pointer(event);
				let thDeg = Math.round(xScale.invert(xm));
				thDeg = Math.max(0, Math.min(180, thDeg));

				const th = (thDeg * Math.PI) / 180;
				const sig = C + ((sigma_x - sigma_y) / 2) * Math.cos(2 * th) + tau_xy * Math.sin(2 * th);
				const tau = -((sigma_x - sigma_y) / 2) * Math.sin(2 * th) + tau_xy * Math.cos(2 * th);

				focus.attr('transform', `translate(${xScale(thDeg)}, 0)`);
				focusSig.attr('cy', yScale(sig));
				focusTau.attr('cy', yScale(tau));

				let tooltipX = xScale(thDeg) + 15;
				if (tooltipX + 130 > w) tooltipX = xScale(thDeg) - 145;

				tooltip.attr(
					'transform',
					`translate(${tooltipX}, ${Math.min(yScale(sig), yScale(tau), h - 60) - 10})`
				);
				tooltipTh.text(`θ = ${thDeg}°`);
				tooltipSig.text(`σ = ${sig.toFixed(1)} MPa`);
				tooltipTau.text(`τ = ${tau.toFixed(1)} MPa`);
			});

		// Legend
		const legend = g.append('g').attr('transform', `translate(${w - 150}, 10)`);
		legend
			.append('rect')
			.attr('width', 140)
			.attr('height', 50)
			.attr('fill', 'rgba(255,255,255,0.8)')
			.attr('stroke', '#e4e4e7')
			.attr('rx', 4);
		legend
			.append('line')
			.attr('x1', 10)
			.attr('x2', 40)
			.attr('y1', 15)
			.attr('y2', 15)
			.attr('stroke', '#ef4444')
			.attr('stroke-width', 3);
		legend
			.append('text')
			.attr('x', 50)
			.attr('y', 19)
			.attr('font-size', '14px')
			.attr('fill', '#52525b')
			.text('Normal Stress (σ)');
		legend
			.append('line')
			.attr('x1', 10)
			.attr('x2', 40)
			.attr('y1', 35)
			.attr('y2', 35)
			.attr('stroke', '#3b82f6')
			.attr('stroke-width', 3);
		legend
			.append('text')
			.attr('x', 50)
			.attr('y', 39)
			.attr('font-size', '14px')
			.attr('fill', '#52525b')
			.text('Shear Stress (τ)');
	}

	$effect(() => {
		if (svgElement && sigma_x !== undefined) {
			drawElement();
		}
		if (projSvgElement && sigma_x !== undefined) {
			drawProjection();
		}
		if (chartSvgElement && sigma_x !== undefined) {
			drawChart();
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
		<div class="space-y-6">
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
						class="bidirectional mt-2 w-full"
						style={getSliderStyle(sigma_x, -100, 100, '#ef4444')}
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
						class="bidirectional mt-2 w-full"
						style={getSliderStyle(sigma_y, -100, 100, '#ef4444')}
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
						class="bidirectional mt-2 w-full"
						style={getSliderStyle(tau_xy, -100, 100, '#3b82f6')}
					/>
				</div>
			</div>

			<div class="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h2 class="text-xl font-bold text-zinc-900">Transformation Angle</h2>
				<div>
					<label for="theta" class="block text-sm font-bold font-medium text-purple-600"
						>Cut Angle {@html k('\\theta')} = {theta_deg}°</label
					>
					<input
						id="theta"
						type="range"
						min="-90"
						max="90"
						bind:value={theta_deg}
						class="bidirectional mt-2 w-full"
						style={getSliderStyle(theta_deg, -90, 90, '#9333ea')}
					/>
				</div>

				<div class="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
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
		</div>

		<!-- Right: Visualizer -->
		<div
			class="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-inner"
		>
			<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
			<div
				class="absolute bottom-4 left-4 space-y-2 rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm backdrop-blur-sm"
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

	<!-- Transformation Line Chart -->
	<div class="mt-12 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
		<h2 class="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-blue-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				/>
			</svg>
			Stress Transformation Plot
		</h2>
		<p class="mb-8 text-lg text-zinc-600">
			This chart continuously plots normal ({@html k("\\sigma_{x'}")}) and shear ({@html k(
				"\\tau_{x'y'}"
			)}) stresses as the element is rotated up to {@html k('180^\\circ')} ({@html k('\\pi')}). The
			peaks and valleys explicitly mark the <strong>Principal Stresses</strong> and
			<strong>Maximum In-Plane Shear Stress</strong>.
			<em
				>Hover anywhere over the graph to read exact mathematical values. The <span
					class="font-bold text-purple-600">purple dashed line</span
				> autonomously tracks your Cut Angle (θ) slider.</em
			>
		</p>
		<div class="flex items-center justify-center overflow-x-auto">
			<svg bind:this={chartSvgElement} width="800" height="400" class="overflow-visible select-none"
			></svg>
		</div>
	</div>
</div>

<style>
	input[type='range'].bidirectional {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
	}
	input[type='range'].bidirectional::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--thumb-color, #3b82f6);
		cursor: pointer;
		margin-top: -6px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	input[type='range'].bidirectional::-webkit-slider-runnable-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		border-radius: 2px;
		background: var(--track-bg, #e4e4e7);
	}
	input[type='range'].bidirectional::-moz-range-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--thumb-color, #3b82f6);
		cursor: pointer;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	input[type='range'].bidirectional::-moz-range-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		border-radius: 2px;
		background: var(--track-bg, #e4e4e7);
	}
</style>
