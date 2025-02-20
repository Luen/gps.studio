<script lang="ts">
	import type { TrackPoint } from 'gpx';
	import type { PopupItem } from '$lib/components/MapPopup';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import WithUnits from '$lib/components/WithUnits.svelte';
	import { Compass, Mountain, Timer, ClipboardCopy, Map } from 'lucide-svelte';
	import { df } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import { map as mapStore } from '$lib/stores';
	import { GpsPopup } from '$lib/components/GPSCoordinatesMapsPopup';

	export let trackpoint: PopupItem<TrackPoint>;

	function showCoordinatesMaps() {
		if ($mapStore) {
			const popup = new GpsPopup($mapStore);
			popup.showCoordinatesAt({
				lat: trackpoint.item.getLatitude(),
				lng: trackpoint.item.getLongitude()
			});
			trackpoint.hide?.();
		}
	}
</script>

<Card.Root class="border-none shadow-md text-base p-2">
	<Card.Header class="p-0">
		<Card.Title class="text-md"></Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col p-0 text-xs gap-1">
		<div class="flex flex-row items-center gap-1">
			<Compass size="14" />
			{trackpoint.item.getLatitude().toFixed(6)}&deg; {trackpoint.item.getLongitude().toFixed(6)}&deg;
		</div>
		{#if trackpoint.item.ele !== undefined}
			<div class="flex flex-row items-center gap-1">
				<Mountain size="14" />
				<WithUnits value={trackpoint.item.ele} type="elevation" />
			</div>
		{/if}
		{#if trackpoint.item.time}
			<div class="flex flex-row items-center gap-1">
				<Timer size="14" />
				{df.format(trackpoint.item.time)}
			</div>
		{/if}
		<Button
			class="w-full px-2 py-1 h-6 justify-start mt-0.5"
			variant="secondary"
			on:click={() => {
				navigator.clipboard.writeText(
					`${trackpoint.item.getLatitude().toFixed(6)}, ${trackpoint.item.getLongitude().toFixed(6)}`
				);
				trackpoint.hide?.();
			}}
		>
			<ClipboardCopy size="16" class="mr-1" />
			{$_('menu.copy_coordinates')}
		</Button>
		<Button
			class="w-full px-2 py-1 h-6 justify-start"
			variant="secondary"
			on:click={showCoordinatesMaps}
		>
			<Map size="16" class="mr-1" />
			{$_('menu.show_coordinates_maps')}
		</Button>
	</Card.Content>
</Card.Root>
