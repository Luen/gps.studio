<script lang="ts">
	import { qldMapBounds } from '$lib/data/qldMapBounds';
	import { nswMapBounds } from '$lib/data/nswMapBounds';
	export let coordinates: { lng: number; lat: number };

	$: formattedLat =
		Math.abs(coordinates.lat).toFixed(6) + '° ' + (coordinates.lat >= 0 ? 'N' : 'S');
	$: formattedLng =
		Math.abs(coordinates.lng).toFixed(6) + '° ' + (coordinates.lng >= 0 ? 'E' : 'W');

	function geo2utm(gps: { lng: number; lat: number }) {
		const lw = gps.lng;
		const bw = gps.lat;

		// Geographic longitude lw and latitude bw in WGS84 Datum
		if (lw <= -180 || lw > 180 || bw <= -80 || bw >= 84) {
			return null;
		}

		// WGS84 Datum
		// Semi-major axis a and flattening f
		const a = 6378137.0;
		const f = 3.35281068e-3;
		const pi = Math.PI;
		const b_sel = 'CDEFGHJKLMNPQRSTUVWXX';

		// Radius of curvature of the prime vertical
		const c = a / (1 - f);

		// Square of the second numerical eccentricity
		const ex2 = (2 * f - f * f) / ((1 - f) * (1 - f));
		const ex4 = ex2 * ex2;
		const ex6 = ex4 * ex2;
		const ex8 = ex4 * ex4;

		// Coefficients for calculating meridian arc length
		const e0 =
			c *
			(pi / 180) *
			(1 - (3 * ex2) / 4 + (45 * ex4) / 64 - (175 * ex6) / 256 + (11025 * ex8) / 16384);
		const e2 = c * ((-3 * ex2) / 8 + (15 * ex4) / 32 - (525 * ex6) / 1024 + (2205 * ex8) / 4096);
		const e4 = c * ((15 * ex4) / 256 - (105 * ex6) / 1024 + (2205 * ex8) / 16384);
		const e6 = c * ((-35 * ex6) / 3072 + (315 * ex8) / 12288);

		// Longitude zone lz and latitude band bz
		const lzn = parseInt(String((lw + 180) / 6)) + 1;
		let lz = String(lzn);
		if (lzn < 10) {
			lz = '0' + lzn;
		}
		const bd = parseInt(String(1 + (bw + 80) / 8));
		const bz = b_sel.charAt(bd - 1);

		// Geographic latitude in radians br
		const br = (bw * pi) / 180;

		const tan1 = Math.tan(br);
		const tan2 = tan1 * tan1;
		const tan4 = tan2 * tan2;

		const cos1 = Math.cos(br);
		const cos2 = cos1 * cos1;
		const cos4 = cos2 * cos2;
		const cos3 = cos2 * cos1;
		const cos5 = cos4 * cos1;

		const etasq = ex2 * cos2;

		// Radius of curvature of the meridian
		const nd = c / Math.sqrt(1 + etasq);

		// Meridian arc length g from given latitude bw
		const g = e0 * bw + e2 * Math.sin(2 * br) + e4 * Math.sin(4 * br) + e6 * Math.sin(6 * br);

		// Longitude difference dl to reference meridian lh
		const lh = (lzn - 30) * 6 - 3;
		const dl = ((lw - lh) * pi) / 180;
		const dl2 = dl * dl;
		const dl4 = dl2 * dl2;
		const dl3 = dl2 * dl;
		const dl5 = dl4 * dl;

		// Scale factor on the central meridian for UTM coordinates m = 0.9996
		// Northing nw and easting ew as functions of latitude and longitude
		let nw;
		if (bw < 0) {
			nw =
				10e6 +
				0.9996 *
					(g +
						(nd * cos2 * tan1 * dl2) / 2 +
						(nd * cos4 * tan1 * (5 - tan2 + 9 * etasq) * dl4) / 24);
		} else {
			nw =
				0.9996 *
				(g + (nd * cos2 * tan1 * dl2) / 2 + (nd * cos4 * tan1 * (5 - tan2 + 9 * etasq) * dl4) / 24);
		}

		let ew =
			0.9996 *
				(nd * cos1 * dl +
					(nd * cos3 * (1 - tan2 + etasq) * dl3) / 6 +
					(nd * cos5 * (5 - 18 * tan2 + tan4) * dl5) / 120) +
			500000;

		// Format northing and easting values
		let nk = nw - parseInt(String(nw));
		if (nk < 0.5) {
			nw = '' + parseInt(String(nw));
		} else {
			nw = '' + (parseInt(String(nw)) + 1);
		}

		while (nw.length < 7) {
			nw = '0' + nw;
		}
		nk = ew - parseInt(String(ew));
		let ewStr = String(nk < 0.5 ? parseInt(String(ew)) : parseInt(String(ew)) + 1);
		while (ewStr.length < 7) {
			ewStr = '0' + ewStr;
		}

		return { zone: lz + bz, x: ewStr, y: nw };
	}

	function get6FigureRef(utm: { x: string; y: string } | null) {
		if (!utm) return 'N/A';
		return `${utm.x.substr(2, 3)}${utm.y.substr(2, 3)}`;
	}

	function getMapSheets(lat: number, lng: number) {
		const x = Math.floor(lng * 2) - 211;
		const y = Math.floor(lat * 2) + 98;
		const mapSheet100k = `${x < 10 ? '0' : ''}${x}${y < 10 ? '0' : ''}${y}`;

		// Calculate quadrant for 50k, 25k, and 10k maps
		let quadrant50k = '1';
		if (lat % 0.5 < -0.25) {
			quadrant50k = lng % 0.5 >= 0.25 ? '2' : '3';
		} else {
			quadrant50k = lng % 0.5 >= 0.25 ? '1' : '4';
		}

		const mapSheet50k = `${mapSheet100k}-${quadrant50k}`;

		// Calculate 25k quadrant
		let quadrant25k = '1';
		if (lat % 0.25 < -0.125) {
			quadrant25k = lng % 0.25 >= 0.125 ? '2' : '3';
		} else {
			quadrant25k = lng % 0.25 >= 0.125 ? '1' : '4';
		}

		const mapSheet25k = `${mapSheet50k}${quadrant25k}`;

		// Calculate 10k quadrant
		let quadrant10k = '1';
		if (lat % 0.125 < -0.0625) {
			quadrant10k = lng % 0.125 >= 0.0625 ? '2' : '3';
		} else {
			quadrant10k = lng % 0.125 >= 0.0625 ? '1' : '4';
		}

		const mapSheet10k = `${mapSheet25k}${quadrant10k}`;

		return {
			'100k': mapSheet100k,
			'50k': mapSheet50k,
			'25k': mapSheet25k,
			'10k': mapSheet10k
		};
	}

	function getMapSheetsNSW(mapSheet10k: string): { [key: string]: string } {
		// Extract the base map number (first 4 digits)
		const baseMap = mapSheet10k.slice(0, 4);

		// Get the quadrant number (after the dash)
		const thirdLastDigit = mapSheet10k.slice(-3, -2);
		const secondLastDigit = mapSheet10k.slice(-2, -1);
		const lastDigit = mapSheet10k.slice(-1);

		// Convert quadrant number to N/S direction
		const directionMap: { [key: string]: string } = {
			'1': 'N',
			'2': 'S',
			'3': 'S',
			'4': 'N'
		};

		return {
			'100k': baseMap,
			'50k': `${baseMap}-${directionMap[String(thirdLastDigit)]}`,
			'25k': `${baseMap}-${String(thirdLastDigit)}${directionMap[String(secondLastDigit)]}`,
			'10k': `${baseMap}-${String(thirdLastDigit)}${String(secondLastDigit)}${directionMap[String(lastDigit)]}`
		};
	}

	function getMapLinksQld(mapSheets: { [key: string]: string }) {
		return {
			'100k': {
				sheet: mapSheets['100k'],
				topo: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/QTopo/100k/${mapSheets['100k']}/pdf`,
				image: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/ImageTopo/100k/${mapSheets['100k']}/pdf`
			},
			'50k': {
				sheet: mapSheets['50k'],
				topo: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/QTopo/50k/${mapSheets['50k']}/pdf`,
				image: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/ImageTopo/50k/${mapSheets['50k']}/pdf`
			},
			'25k': {
				sheet: mapSheets['25k'],
				topo: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/QTopo/25k/${mapSheets['25k']}/pdf`,
				image: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/ImageTopo/25k/${mapSheets['25k']}/pdf`
			},
			'10k': {
				sheet: mapSheets['10k'],
				topo: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/QTopo/10k/${mapSheets['10k']}/pdf`,
				image: `https://apps.information.qld.gov.au/data/v2/QTopo/StaticMap/ImageTopo/10k/${mapSheets['10k']}/pdf`
			}
		};
	}

	function getMapTitle(sheet: string | undefined): string {
		if (!sheet) return '';
		try {
			if (!qldMapBounds) return '';
			const qldSheet = sheet.slice(0, 4);
			const qldTitle = qldMapBounds[qldSheet as keyof typeof qldMapBounds];
			if (qldTitle) return String(qldTitle);

			if (!nswMapBounds) return '';
			const nswSheetArray = getMapSheetsNSW(sheet);
			let nswTitle;
			nswTitle = nswMapBounds[nswSheetArray['10k'] as keyof typeof nswMapBounds];
			if (nswTitle) return String(nswTitle);
			nswTitle = nswMapBounds[nswSheetArray['25k'] as keyof typeof nswMapBounds];
			if (nswTitle) return String(nswTitle);
			nswTitle = nswMapBounds[nswSheetArray['50k'] as keyof typeof nswMapBounds];
			if (nswTitle) return String(nswTitle);
			nswTitle = nswMapBounds[nswSheetArray['100k'] as keyof typeof nswMapBounds];
			return nswTitle ? String(nswTitle) : '';
		} catch (error) {
			console.error('Error in getMapTitle:', error);
			return '';
		}
	}

	interface HistoricMap {
		title: string;
		publication_date: number;
		map_scale: number;
		download_link: string;
		map_preview: string;
		mapping_series?: string;
		description?: string;
	}

	async function getHistoricMaps(lat: number, lng: number) {
		try {
			const url = `https://qldglobe.wanderstories.space/historical-maps?lat=${lat}&lon=${lng}`;
			const response = await fetch(url);
			const data: HistoricMap[] = await response.json();
			return data.sort((a, b) => a.map_scale - b.map_scale);
		} catch (error) {
			console.error('Error fetching historic maps:', error);
			return [];
		}
	}

	async function getGeoscienceMaps(lat: number, lng: number) {
		try {
			const url = `https://natmap.wanderstories.space/maps?lat=${lat}&lon=${lng}`;
			const response = await fetch(url);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching Geoscience maps:', error);
			return [];
		}
	}

	function isQueensland(lat: number, lng: number) {
		// Need to improve this
		return lat >= -20 && lat <= -10 && lng >= 140 && lng <= 153;
	}

	$: utm = geo2utm(coordinates);
	$: sixFigure = get6FigureRef(utm);
	$: mapSheets = getMapSheets(coordinates.lat, coordinates.lng);
	$: mapTitle = getMapTitle(mapSheets['10k']);
	$: mapLinks = isQueensland(coordinates.lat, coordinates.lng) ? getMapLinksQld(mapSheets) : null;
	$: historicMaps = isQueensland(coordinates.lat, coordinates.lng)
		? getHistoricMaps(coordinates.lat, coordinates.lng)
		: null;
	$: geoscienceMaps = isQueensland(coordinates.lat, coordinates.lng)
		? getGeoscienceMaps(coordinates.lat, coordinates.lng)
		: null;

	function formatScale(scale: number): string {
		return `1:${scale.toLocaleString()}`;
	}
</script>

<div class="p-2 text-sm bg-background rounded-md shadow-md border border-border">
	<table class="w-full">
		<tr>
			<td>GPS</td>
			<td class="text-right">{formattedLat}, {formattedLng}</td>
		</tr>
		<tr>
			<td>UTM</td>
			<td class="text-right">{utm ? `${utm.zone} ${utm.x} ${utm.y}` : 'N/A'}</td>
		</tr>
		<tr>
			<td>6FIGURE</td>
			<td class="text-right">{sixFigure}</td>
		</tr>
		<tr>
			<td colspan="3" class="border-t border-border">
				<div class="text-xs mt-1">
					<div class="font-bold mb-1">{mapTitle ? `${mapTitle}` : 'Maps'}</div>
					{#if mapLinks}
						<div class="font-semibold mb-1">Government Maps</div>
						<div class="grid grid-cols-[2fr_0.5fr_0.5fr_0.5fr] gap-x-2">
							<div>Title</div>
							<div>Sheet</div>
							<div>Scale</div>
							<div>Links</div>

							{#each ['100k', '50k', '25k', '10k'] as scale}
								<div>Queensland {scale}</div>
								<div class="font-mono whitespace-nowrap">{mapLinks[scale].sheet}</div>
								<div>{formatScale(parseInt(scale.replace('k', '000')))}</div>
								<div class="text-right whitespace-nowrap">
									<a
										href={mapLinks[scale].topo}
										target="_blank"
										title="Topographic map"
										class="text-primary hover:underline px-1">🗺️</a
									>
									<a
										href={mapLinks[scale].image}
										target="_blank"
										title="Satellite imagery"
										class="text-primary hover:underline px-1">📡</a
									>
								</div>
							{/each}
						</div>
					{:else}
						<div class="grid grid-cols-[2fr_1fr_1fr] gap-x-2">
							<div>Sheet</div>
							<div>Scale</div>
							<div>&nbsp;</div>
							{#each ['100k', '50k', '25k', '10k'] as scale}
								<div>{mapSheets[scale]}</div>
								<div>{scale}</div>
								<div>{formatScale(parseInt(scale.replace('k', '000')))}</div>
							{/each}
						</div>
					{/if}
				</div>
			</td>
		</tr>
		{#if geoscienceMaps}
			<tr>
				<td colspan="3" class="border-t border-border">
					<div class="text-xs mt-1">
						<div class="font-semibold mb-1">Geoscience Australia Maps</div>
						<div class="grid grid-cols-[2fr_0.5fr_0.5fr_0.5fr] gap-x-2">
							{#await geoscienceMaps}
								<div class="col-span-4">Loading...</div>
							{:then maps}
								<div>Title</div>
								<div>Sheet</div>
								<div>Scale</div>
								<div>Links</div>

								{#each maps as map}
									<div title={map.attributes.NAME}>{map.attributes.TITLE}</div>
									<div class="font-mono">{map.attributes.MAP_CODE}</div>
									<div>1:{map.attributes.SCALE_1.toLocaleString()}</div>
									<div class="text-right whitespace-nowrap">
										<a
											href={map.attributes.mapUrl}
											target="_blank"
											title="Download map"
											class="text-primary hover:underline px-1">↓</a
										>
										<a
											href={map.attributes.PID_URL}
											target="_blank"
											title="View metadata"
											class="text-primary hover:underline px-1">ℹ️</a
										>
									</div>
								{/each}
							{/await}
						</div>
					</div>
				</td>
			</tr>
		{/if}
		{#if historicMaps}
			<tr>
				<td colspan="3" class="border-t border-border">
					<div class="text-xs mt-1">
						<div class="font-semibold mb-1">Historic Maps</div>
						<div class="grid grid-cols-[2fr_0.5fr_0.5fr_0.5fr] gap-x-2">
							{#await historicMaps}
								<div class="col-span-4">Loading...</div>
							{:then maps}
								<div>Title</div>
								<div>Date</div>
								<div>Scale</div>
								<div>Links</div>

								{#each maps as map}
									<div title={map.mapping_series || map.description}>{map.title}</div>
									<div>{map.publication_date}</div>
									<div>1:{map.map_scale.toLocaleString()}</div>
									<div class="text-right whitespace-nowrap">
										<a
											href={map.download_link}
											target="_blank"
											title="Download map"
											class="text-primary hover:underline px-1">↓</a
										>
										<a
											href={map.map_preview}
											target="_blank"
											title="Preview map"
											class="text-primary hover:underline px-1">👁️</a
										>
									</div>
								{/each}
							{/await}
						</div>
					</div>
				</td>
			</tr>
		{/if}
	</table>
</div>

<style>
	div {
		color: var(--foreground);
	}
</style>
