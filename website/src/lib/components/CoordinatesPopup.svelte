<script lang="ts">
	import { map } from '$lib/stores';
	import { trackpointPopup } from '$lib/components/gpx-layer/GPXLayerPopup';
	import { TrackPoint } from 'gpx';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { Map } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	import { GpsPopup } from './GPSCoordinatesMapsPopup';

	let contextMenuPosition: { lat: number; lng: number } | null = null;

	function showCoordinatesMaps() {
		if ($map && contextMenuPosition) {
			const popup = new GpsPopup($map);
			popup.showCoordinatesAt(contextMenuPosition);
			contextMenuPosition = null;
		}
	}

	$: if ($map) {
		$map.on('contextmenu', (e) => {
			contextMenuPosition = {
				lat: e.lngLat.lat,
				lng: e.lngLat.lng
			};
		});
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger />
	<ContextMenu.Content>
		<ContextMenu.Item on:click={showCoordinatesMaps}>
			<Map size="16" class="mr-1" />
			{$_('menu.show_coordinates_maps')}
		</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
