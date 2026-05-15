import tilebelt from '@mapbox/tilebelt';
import type mapboxgl from 'mapbox-gl';
import { get } from 'svelte/store';
import { getLayers } from './utils';
import { settings } from '$lib/db';

const IMPORT_ID = 'allTrailsCommunityTrails';
const SOURCE_ID = 'community_trails_geojson';
const LAYER_ID = 'alltrails-community-trail-lines';
const BASE_URL = 'https://alltrails.wanderstories.space';

/** Tune if your deploy exposes different grid limits (see COMMUNITY_GRID_* on server). */
export const ALLTRAILS_COMMUNITY_GRID_MIN_Z = 10;
export const ALLTRAILS_COMMUNITY_GRID_MAX_Z = 14;

const MAX_TILE_JOBS = 56;
const DEBOUNCE_MS = 350;

type StyleWithScopedSource = {
	getSource?: (id: string, scope: string) => mapboxgl.Source | null | undefined;
};

function isOverlayEnabled(): boolean {
	const tree = get(settings.currentOverlays);
	if (!tree) return false;
	return getLayers(tree)[IMPORT_ID] === true;
}

function getGeoJsonSource(map: mapboxgl.Map): mapboxgl.GeoJSONSource | undefined {
	const style = map.style as unknown as StyleWithScopedSource;
	const scoped = style.getSource?.(SOURCE_ID, IMPORT_ID);
	if (scoped && scoped.type === 'geojson') {
		return scoped as mapboxgl.GeoJSONSource;
	}
	const plain = map.getSource(SOURCE_ID);
	if (plain && plain.type === 'geojson') {
		return plain as mapboxgl.GeoJSONSource;
	}
	return undefined;
}

function tilesForBounds(
	west: number,
	south: number,
	east: number,
	north: number,
	z: number
): Array<{ z: number; x: number; y: number }> {
	const nw = tilebelt.pointToTile(west, north, z);
	const se = tilebelt.pointToTile(east, south, z);
	let x0 = Math.min(nw[0], se[0]);
	let x1 = Math.max(nw[0], se[0]);
	let y0 = Math.min(nw[1], se[1]);
	let y1 = Math.max(nw[1], se[1]);
	const max = 2 ** z - 1;
	x0 = Math.max(0, Math.min(max, x0));
	x1 = Math.max(0, Math.min(max, x1));
	y0 = Math.max(0, Math.min(max, y0));
	y1 = Math.max(0, Math.min(max, y1));
	const tiles: Array<{ z: number; x: number; y: number }> = [];
	for (let x = x0; x <= x1; x++) {
		for (let y = y0; y <= y1; y++) {
			tiles.push({ z, x, y });
		}
	}
	return tiles;
}

function featureDedupeKey(f: GeoJSON.Feature): string {
	const p = f.properties as Record<string, unknown> | null | undefined;
	if (p) {
		const trailId = p.trailId ?? p.trail_id;
		const segmentId = p.segmentId ?? p.segment_id;
		if (trailId != null && segmentId != null) {
			return `t:${String(trailId)}:s:${String(segmentId)}`;
		}
		if (trailId != null) {
			return `t:${String(trailId)}`;
		}
		if (typeof p.id === 'string' || typeof p.id === 'number') {
			return `id:${String(p.id)}`;
		}
	}
	const g = f.geometry;
	if (g && 'coordinates' in g && g.coordinates) {
		return `geom:${JSON.stringify(g.coordinates).slice(0, 400)}`;
	}
	return `feat:${JSON.stringify(f).slice(0, 400)}`;
}

function mergeFeatureCollections(
	collections: GeoJSON.FeatureCollection[]
): GeoJSON.FeatureCollection {
	const byKey = new Map<string, GeoJSON.Feature>();
	for (const fc of collections) {
		if (!fc || fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) continue;
		for (const f of fc.features) {
			if (!f || f.type !== 'Feature') continue;
			byKey.set(featureDedupeKey(f), f);
		}
	}
	return { type: 'FeatureCollection', features: [...byKey.values()] };
}

export class AllTrailsCommunityTrailsLayer {
	map: mapboxgl.Map;
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;
	private fetchAbort: AbortController | null = null;
	private unsubscribes: (() => void)[] = [];

	private readonly onMoveEnd = () => this.scheduleRefresh();
	private readonly onZoomEnd = () => this.scheduleRefresh();
	private readonly onStyleImportLoad = () => this.scheduleRefresh();

	constructor(map: mapboxgl.Map) {
		this.map = map;
	}

	add() {
		this.map.on('moveend', this.onMoveEnd);
		this.map.on('zoomend', this.onZoomEnd);
		this.map.on('style.import.load', this.onStyleImportLoad);
		this.unsubscribes.push(
			settings.currentOverlays.subscribe(() => {
				this.scheduleRefresh();
			})
		);
		this.unsubscribes.push(
			settings.opacities.subscribe(() => {
				this.applyLineOpacity();
			})
		);
		this.scheduleRefresh();
	}

	remove() {
		this.map.off('moveend', this.onMoveEnd);
		this.map.off('zoomend', this.onZoomEnd);
		this.map.off('style.import.load', this.onStyleImportLoad);
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
		this.fetchAbort?.abort();
		this.fetchAbort = null;
		this.unsubscribes.forEach((u) => u());
		this.unsubscribes = [];
	}

	private scheduleRefresh() {
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = null;
			void this.refresh();
		}, DEBOUNCE_MS);
	}

	private applyLineOpacity() {
		const opacity = get(settings.opacities)[IMPORT_ID];
		if (opacity === undefined) return;
		const candidates = [
			LAYER_ID,
			`${IMPORT_ID}:${LAYER_ID}`,
			`${IMPORT_ID}-${LAYER_ID}`
		];
		for (const lid of candidates) {
			try {
				if (this.map.getLayer(lid)) {
					this.map.setPaintProperty(lid, 'line-opacity', opacity);
					return;
				}
			} catch {
				// ignore
			}
		}
	}

	private async refresh() {
		if (!isOverlayEnabled()) {
			this.fetchAbort?.abort();
			this.fetchAbort = null;
			const src = getGeoJsonSource(this.map);
			try {
				src?.setData({ type: 'FeatureCollection', features: [] });
			} catch {
				// ignore
			}
			return;
		}

		let z = Math.floor(this.map.getZoom());
		z = Math.max(ALLTRAILS_COMMUNITY_GRID_MIN_Z, Math.min(ALLTRAILS_COMMUNITY_GRID_MAX_Z, z));

		const b = this.map.getBounds();
		if (!b) return;
		const west = b.getWest();
		const south = b.getSouth();
		const east = b.getEast();
		const north = b.getNorth();

		let tiles = tilesForBounds(west, south, east, north, z);
		while (tiles.length > MAX_TILE_JOBS && z > ALLTRAILS_COMMUNITY_GRID_MIN_Z) {
			z -= 1;
			tiles = tilesForBounds(west, south, east, north, z);
		}
		if (tiles.length > MAX_TILE_JOBS) {
			tiles = tiles.slice(0, MAX_TILE_JOBS);
		}

		this.fetchAbort?.abort();
		this.fetchAbort = new AbortController();
		const signal = this.fetchAbort.signal;

		const jobs = tiles.map(({ z: tz, x, y }) =>
			fetch(`${BASE_URL}/api/viewport-trails/geojson/${tz}/${x}/${y}`, { signal }).then(
				async (r) => {
					const j = (await r.json().catch(() => ({}))) as unknown;
					return { ok: r.ok, z: tz, x, y, j };
				}
			)
		);

		const results = await Promise.all(jobs).catch(() => [] as { ok: boolean; j: unknown }[]);

		if (signal.aborted || !isOverlayEnabled()) return;

		const collections: GeoJSON.FeatureCollection[] = [];
		for (const row of results) {
			if (!row || !row.ok) continue;
			const j = row.j as GeoJSON.FeatureCollection | { type?: string; features?: unknown };
			if (j && j.type === 'FeatureCollection' && Array.isArray(j.features)) {
				collections.push(j as GeoJSON.FeatureCollection);
			}
		}

		const merged = mergeFeatureCollections(collections);
		const src = getGeoJsonSource(this.map);
		if (!src) return;
		try {
			src.setData(merged);
		} catch {
			// import may be unloading
		}
		this.applyLineOpacity();
	}
}
