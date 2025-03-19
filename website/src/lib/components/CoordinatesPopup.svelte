<script lang="ts">
	import { map } from '$lib/stores';
	import { trackpointPopup } from '$lib/components/gpx-layer/GPXLayerPopup';
	import { TrackPoint } from 'gpx';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { Map, ClipboardCopy, Compass, Droplet, CloudRain } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	import { GpsPopup } from './GPSCoordinatesMapsPopup';
	import { onDestroy } from 'svelte';
	import { CatchmentPopup } from './CatchmentPopup';
	import WeatherPopup from './WeatherPopup.svelte';
	import mapboxgl from 'mapbox-gl';

	let contextMenuPosition: { lat: number; lng: number } | null = null;
	let contextMenuOpen = false;

	function showCoordinatesMaps() {
		if ($map && contextMenuPosition) {
			const popup = new GpsPopup($map);
			popup.showCoordinatesAt(contextMenuPosition);
			contextMenuPosition = null;
			contextMenuOpen = false;
		}
	}

	function calculateCatchment() {
		if ($map && contextMenuPosition) {
			const popup = new CatchmentPopup($map);
			popup.calculateCatchment(contextMenuPosition);
			contextMenuPosition = null;
			contextMenuOpen = false;
		}
	}

	function showWeatherForecast() {
		if ($map && contextMenuPosition) {
			const container = document.createElement('div');
			
			// Create Mapbox popup
			new mapboxgl.Popup({
				maxWidth: '400px',
				className: 'weather-popup'
			})
				.setLngLat([contextMenuPosition.lng, contextMenuPosition.lat])
				.setDOMContent(container)
				.addTo($map);
			
			// Initialize WeatherPopup component
			new WeatherPopup({
				target: container,
				props: {
					coordinates: { lat: contextMenuPosition.lat, lng: contextMenuPosition.lng }
				}
			});
			
			contextMenuPosition = null;
			contextMenuOpen = false;
		}
	}

	function copyCoordinates() {
		if (contextMenuPosition) {
			navigator.clipboard.writeText(
				`${contextMenuPosition.lat.toFixed(6)}, ${contextMenuPosition.lng.toFixed(6)}`
			);
			contextMenuOpen = false;
		}
	}

	function handleContextMenu(e: any) {
		e.preventDefault();
		contextMenuPosition = {
			lat: e.lngLat.lat,
			lng: e.lngLat.lng
		};
		contextMenuOpen = true;
	}

	function handleMapClick() {
		if (contextMenuOpen) {
			contextMenuOpen = false;
		}
	}

	$: if ($map) {
		// Add event listeners
		$map.on('contextmenu', handleContextMenu);
		$map.on('click', handleMapClick);
	}

	onDestroy(() => {
		// Remove event listeners when component is destroyed
		if ($map) {
			$map.off('contextmenu', handleContextMenu);
			$map.off('click', handleMapClick);
		}
	});
</script>

{#if contextMenuOpen && contextMenuPosition && $map}
	<div 
		class="absolute z-50 bg-popover rounded-md border shadow-md p-1 text-popover-foreground min-w-[8rem]"
		style="left: {$map.project(contextMenuPosition).x}px; top: {($map.project(contextMenuPosition).y + 10)}px;"
	>
		<div class="px-2 py-1.5 text-sm font-mono border-b mb-1 flex items-center">
			<Compass size="14" class="mr-1.5 shrink-0" />
			<span>{contextMenuPosition.lat.toFixed(6)}°, {contextMenuPosition.lng.toFixed(6)}°</span>
		</div>
		<button 
			class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground"
			on:click={copyCoordinates}
		>
			<ClipboardCopy size="16" class="mr-1" />
			{$_('menu.copy_coordinates')}
		</button>
		<button 
			class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground"
			on:click={showCoordinatesMaps}
		>
			<Map size="16" class="mr-1" />
			{$_('menu.show_coordinates_maps')}
		</button>
		<button 
			class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground"
			on:click={calculateCatchment}
		>
			<Droplet size="16" class="mr-1" />
			{$_('menu.calculate_catchment')}
		</button>
		<button 
			class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground"
			on:click={showWeatherForecast}
		>
			<CloudRain size="16" class="mr-1" />
			{$_('menu.weather_forecast')}
		</button>
	</div>
{/if}

<style>
	:global(.mapboxgl-canvas-container) {
		pointer-events: auto;
	}
</style>
