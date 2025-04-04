<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { Button } from '$lib/components/ui/button';
	import Logo from '$lib/components/Logo.svelte';
	import Shortcut from '$lib/components/Shortcut.svelte';
	import {
		Plus,
		Copy,
		Download,
		Undo2,
		Redo2,
		Trash2,
		Heart,
		Map,
		Layers2,
		Box,
		Milestone,
		Coins,
		Ruler,
		Zap,
		Thermometer,
		Sun,
		Moon,
		Layers,
		ListTree,
		Languages,
		Settings,
		Info,
		File,
		View,
		FilePen,
		HeartHandshake,
		PersonStanding,
		Eye,
		EyeOff,
		ClipboardCopy,
		Scissors,
		ClipboardPaste,
		PaintBucket,
		FolderOpen,
		FileStack,
		FileX,
		BookOpenText,
		ChartArea,
		Maximize,
		Cloud,
		CloudRain
	} from 'lucide-svelte';

	import {
		map,
		triggerFileInput,
		createFile,
		loadFiles,
		updateSelectionFromKey,
		allHidden,
		editMetadata,
		editStyle,
		exportState,
		ExportState,
		centerMapOnSelection
	} from '$lib/stores';
	import {
		copied,
		copySelection,
		cutSelection,
		pasteSelection,
		selectAll,
		selection
	} from '$lib/components/file-list/Selection';
	import { derived } from 'svelte/store';
	import { canUndo, canRedo, dbUtils, fileObservers, settings } from '$lib/db';
	import { anySelectedLayer } from '$lib/components/layer-control/utils';
	import { defaultOverlays } from '$lib/assets/layers';
	import LayerControlSettings from '$lib/components/layer-control/LayerControlSettings.svelte';
	import { allowedPastes, ListFileItem, ListTrackItem, type ListItem, ListLevel } from '$lib/components/file-list/FileList';
	import Export from '$lib/components/Export.svelte';
	import { mode, setMode, systemPrefersMode } from 'mode-watcher';
	import { _, locale } from 'svelte-i18n';
	import { languages } from '$lib/languages';
	import { getURLForLanguage } from '$lib/utils';
	import { GpsPopup } from '$lib/components/GPSCoordinatesMapsPopup';
	import CatchmentPopup from '$lib/components/CatchmentPopup.svelte';
	import WeatherPopup from '$lib/components/WeatherPopup.svelte';
	import mapboxgl from 'mapbox-gl';

	const {
		distanceUnits,
		velocityUnits,
		temperatureUnits,
		elevationProfile,
		treeFileView,
		currentBasemap,
		previousBasemap,
		currentOverlays,
		previousOverlays,
		distanceMarkers,
		directionMarkers,
		streetViewSource,
		routing
	} = settings;

	let undoDisabled = derived(canUndo, ($canUndo) => !$canUndo);
	let redoDisabled = derived(canRedo, ($canRedo) => !$canRedo);

	function switchBasemaps() {
		[$currentBasemap, $previousBasemap] = [$previousBasemap, $currentBasemap];
	}

	function toggleOverlays() {
		if (anySelectedLayer($currentOverlays)) {
			[$currentOverlays, $previousOverlays] = [defaultOverlays, $currentOverlays];
		} else {
			[$currentOverlays, $previousOverlays] = [$previousOverlays, defaultOverlays];
		}
	}

	function toggle3D() {
		if ($map) {
			if ($map.getPitch() === 0) {
				$map.easeTo({ pitch: 70 });
			} else {
				$map.easeTo({ pitch: 0 });
			}
		}
	}

	let layerSettingsOpen = false;

	$: selectedMode = $mode ?? $systemPrefersMode ?? 'light';

	$: localeValue = $locale || 'en';

	function showCoordinatesMaps() {
		if ($map) {
			const popup = new GpsPopup($map);
			popup.showCenterCoordinates();
		}
	}

	function showCatchmentPopup() {
		if ($map) {
			const center = $map.getCenter();
			const container = document.createElement('div');
			
			// Create Mapbox popup
			new mapboxgl.Popup({
				maxWidth: '400px',
				className: 'catchment-popup'
			})
				.setLngLat([center.lng, center.lat])
				.setDOMContent(container)
				.addTo($map);
			
			// Initialize Svelte component in the container
			new CatchmentPopup({
				target: container,
				props: {
					coordinates: { lat: center.lat, lng: center.lng }
				}
			});
		}
	}

	function showWeatherPopup() {
		if ($map) {
			const center = $map.getCenter();
			const container = document.createElement('div');
			
			// Create Mapbox popup
			new mapboxgl.Popup({
				maxWidth: '400px',
				className: 'weather-popup'
			})
				.setLngLat([center.lng, center.lat])
				.setDOMContent(container)
				.addTo($map);
			
			// Initialize WeatherPopup component
			new WeatherPopup({
				target: container,
				props: {
					coordinates: { lat: center.lat, lng: center.lng }
				}
			});
		}
	}

	// Type guard for ListTrackItem
	function isListTrackItem(item: ListItem): item is ListTrackItem {
		return item instanceof ListTrackItem;
	}

	// Fix event target type checking
	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const targetInput =
			target?.tagName === 'INPUT' ||
			target?.tagName === 'TEXTAREA' ||
			target?.tagName === 'SELECT' ||
			target?.getAttribute('role') === 'combobox' ||
			target?.getAttribute('role') === 'radio' ||
			target?.getAttribute('role') === 'menu' ||
			target?.getAttribute('role') === 'menuitem' ||
			target?.getAttribute('role') === 'menuitemradio' ||
			target?.getAttribute('role') === 'menuitemcheckbox';

		if (e.key === '+' && (e.metaKey || e.ctrlKey)) {
			createFile();
			e.preventDefault();
		} else if (e.key === 'o' && (e.metaKey || e.ctrlKey)) {
			triggerFileInput();
			e.preventDefault();
		} else if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
			dbUtils.duplicateSelection();
			e.preventDefault();
		} else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
			if (!targetInput) {
				copySelection();
				e.preventDefault();
			}
		} else if (e.key === 'x' && (e.metaKey || e.ctrlKey)) {
			if (!targetInput) {
				cutSelection();
				e.preventDefault();
			}
		} else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
			if (!targetInput) {
				pasteSelection();
				e.preventDefault();
			}
		} else if ((e.key === 's' || e.key == 'S') && (e.metaKey || e.ctrlKey)) {
			if (e.shiftKey) {
				if ($fileObservers.size > 0) {
					$exportState = ExportState.ALL;
				}
			} else if ($selection.size > 0) {
				$exportState = ExportState.SELECTION;
			}
			e.preventDefault();
		} else if ((e.key === 'z' || e.key == 'Z') && (e.metaKey || e.ctrlKey)) {
			if (e.shiftKey) {
				dbUtils.redo();
			} else {
				dbUtils.undo();
			}
			e.preventDefault();
		} else if ((e.key === 'Backspace' || e.key === 'Delete') && (e.metaKey || e.ctrlKey)) {
			if (!targetInput) {
				if (e.shiftKey) {
					dbUtils.deleteAllFiles();
				} else {
					dbUtils.deleteSelection();
				}
				e.preventDefault();
			}
		} else if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
			if (!targetInput) {
				selectAll();
				e.preventDefault();
			}
		} else if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
			if (
				$selection.size === 1 &&
				$selection
					.getSelected()
					.every((item) => item instanceof ListFileItem || item instanceof ListTrackItem)
			) {
				$editMetadata = true;
			}
			e.preventDefault();
		} else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
			$elevationProfile = !$elevationProfile;
			e.preventDefault();
		} else if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
			$treeFileView = !$treeFileView;
			e.preventDefault();
		} else if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
			if ($allHidden) {
				dbUtils.setHiddenToSelection(false);
			} else {
				dbUtils.setHiddenToSelection(true);
			}
			e.preventDefault();
		} else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			if ($selection.size > 0) {
				centerMapOnSelection();
			}
		} else if (e.key === 'F1') {
			switchBasemaps();
			e.preventDefault();
		} else if (e.key === 'F2') {
			toggleOverlays();
			e.preventDefault();
		} else if (e.key === 'F3') {
			$distanceMarkers = !$distanceMarkers;
			e.preventDefault();
		} else if (e.key === 'F4') {
			$directionMarkers = !$directionMarkers;
			e.preventDefault();
		} else if (e.key === 'F5') {
			$routing = !$routing;
			e.preventDefault();
		} else if (
			e.key === 'ArrowRight' ||
			e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowUp'
		) {
			if (!targetInput) {
				updateSelectionFromKey(e.key === 'ArrowRight' || e.key === 'ArrowDown', e.shiftKey);
				e.preventDefault();
			}
		}
	}

	// Fix drop event type checking
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			loadFiles(files);
		}
	}

	// Fix mode change type checking
	function handleModeChange(e: CustomEvent<string>) {
		const value = e.detail;
		if (value === 'light' || value === 'dark' || value === 'system') {
			setMode(value);
		}
	}
</script>

<div class="absolute md:top-2 left-0 right-0 z-20 flex flex-row justify-center pointer-events-none">
	<div
		class="w-fit flex flex-row items-center justify-center p-1 bg-background rounded-b-md md:rounded-md pointer-events-auto shadow-md"
	>
		<a href={getURLForLanguage($locale, '/')} target="_blank" class="shrink-0">
			<Logo class="h-5 mt-0.5 mx-2 md:hidden" iconOnly={true} width="16" />
			<Logo class="h-5 mt-0.5 mx-2 hidden md:block" width="96" />
		</a>
		<Menubar.Root class="border-none h-fit p-0">
			<Menubar.Menu>
				<Menubar.Trigger aria-label={$_('gpx.file')}>
					<File size="18" class="md:hidden" />
					<span class="hidden md:block">{$_('gpx.file')}</span>
				</Menubar.Trigger>
				<Menubar.Content class="border-none">
					<Menubar.Item on:click={createFile}>
						<Plus size="16" class="mr-1" />
						{$_('menu.new')}
						<Shortcut key="+" ctrl={true} />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item on:click={triggerFileInput}>
						<FolderOpen size="16" class="mr-1" />
						{$_('menu.open')}
						<Shortcut key="O" ctrl={true} />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item on:click={dbUtils.duplicateSelection} disabled={$selection.size == 0}>
						<Copy size="16" class="mr-1" />
						{$_('menu.duplicate')}
						<Shortcut key="D" ctrl={true} />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item on:click={dbUtils.deleteSelectedFiles} disabled={$selection.size == 0}>
						<FileX size="16" class="mr-1" />
						{$_('menu.close')}
						<Shortcut key="⌫" ctrl={true} />
					</Menubar.Item>
					<Menubar.Item on:click={dbUtils.deleteAllFiles} disabled={$fileObservers.size == 0}>
						<FileX size="16" class="mr-1" />
						{$_('menu.close_all')}
						<Shortcut key="⌫" ctrl={true} shift={true} />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item
						on:click={() => ($exportState = ExportState.SELECTION)}
						disabled={$selection.size == 0}
					>
						<Download size="16" class="mr-1" />
						{$_('menu.export')}
						<Shortcut key="S" ctrl={true} />
					</Menubar.Item>
					<Menubar.Item
						on:click={() => ($exportState = ExportState.ALL)}
						disabled={$fileObservers.size == 0}
					>
						<Download size="16" class="mr-1" />
						{$_('menu.export_all')}
						<Shortcut key="S" ctrl={true} shift={true} />
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger aria-label={$_('menu.edit')}>
					<FilePen size="18" class="md:hidden" />
					<span class="hidden md:block">{$_('menu.edit')}</span>
				</Menubar.Trigger>
				<Menubar.Content class="border-none">
					<Menubar.Item on:click={dbUtils.undo} disabled={$undoDisabled}>
						<Undo2 size="16" class="mr-1" />
						{$_('menu.undo')}
						<Shortcut key="Z" ctrl={true} />
					</Menubar.Item>
					<Menubar.Item on:click={dbUtils.redo} disabled={$redoDisabled}>
						<Redo2 size="16" class="mr-1" />
						{$_('menu.redo')}
						<Shortcut key="Z" ctrl={true} shift={true} />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item
						disabled={$selection.size !== 1 ||
							!$selection
								.getSelected()
								.every((item) => item instanceof ListFileItem || item instanceof ListTrackItem)}
						on:click={() => ($editMetadata = true)}
					>
						<Info size="16" class="mr-1" />
						{$_('menu.metadata.button')}
						<Shortcut key="I" ctrl={true} />
					</Menubar.Item>
					<Menubar.Item
						disabled={$selection.size === 0 ||
							!$selection
								.getSelected()
								.every((item) => item instanceof ListFileItem || item instanceof ListTrackItem)}
						on:click={() => ($editStyle = true)}
					>
						<PaintBucket size="16" class="mr-1" />
						{$_('menu.style.button')}
					</Menubar.Item>
					<Menubar.Item
						on:click={() => {
							if ($allHidden) {
								dbUtils.setHiddenToSelection(false);
							} else {
								dbUtils.setHiddenToSelection(true);
							}
						}}
						disabled={$selection.size == 0}
					>
						{#if $allHidden}
							<Eye size="16" class="mr-1" />
							{$_('menu.unhide')}
						{:else}
							<EyeOff size="16" class="mr-1" />
							{$_('menu.hide')}
						{/if}
						<Shortcut key="H" ctrl={true} />
					</Menubar.Item>
					{#if $treeFileView}
						{#if $selection.getSelected().some((item) => item instanceof ListFileItem)}
							<Menubar.Separator />
							<Menubar.Item
								on:click={() => dbUtils.addNewTrack($selection.getSelected()[0].getFileId())}
								disabled={$selection.size !== 1}
							>
								<Plus size="16" class="mr-1" />
								{$_('menu.new_track')}
							</Menubar.Item>
						{:else if $selection.getSelected().some((item) => item instanceof ListTrackItem)}
							<Menubar.Separator />
							<Menubar.Item
								on:click={() => {
									const item = $selection.getSelected()[0];
									if (isListTrackItem(item)) {
										dbUtils.addNewSegment(item.getFileId(), item.getTrackIndex());
									}
								}}
								disabled={$selection.size !== 1}
							>
								<Plus size="16" class="mr-1" />
								{$_('menu.new_segment')}
							</Menubar.Item>
						{/if}
					{/if}
					<Menubar.Separator />
					<Menubar.Item on:click={selectAll} disabled={$fileObservers.size == 0}>
						<FileStack size="16" class="mr-1" />
						{$_('menu.select_all')}
						<Shortcut key="A" ctrl={true} />
					</Menubar.Item>
					<Menubar.Item
						on:click={() => {
							if ($selection.size > 0) {
								centerMapOnSelection();
							}
						}}
					>
						<Maximize size="16" class="mr-1" />
						{$_('menu.center')}
						<Shortcut key="⏎" ctrl={true} />
					</Menubar.Item>
					{#if $treeFileView}
						<Menubar.Separator />
						<Menubar.Item on:click={copySelection} disabled={$selection.size === 0}>
							<ClipboardCopy size="16" class="mr-1" />
							{$_('menu.copy')}
							<Shortcut key="C" ctrl={true} />
						</Menubar.Item>
						<Menubar.Item on:click={cutSelection} disabled={$selection.size === 0}>
							<Scissors size="16" class="mr-1" />
							{$_('menu.cut')}
							<Shortcut key="X" ctrl={true} />
						</Menubar.Item>
						<Menubar.Item
							disabled={$copied === undefined ||
								$copied.length === 0 ||
								($selection.size > 0 &&
									!allowedPastes[$copied[0].level].includes($selection.getSelected()[0]?.level ?? 0))}
							on:click={pasteSelection}
						>
							<ClipboardPaste size="16" class="mr-1" />
							{$_('menu.paste')}
							<Shortcut key="V" ctrl={true} />
						</Menubar.Item>
					{/if}
					<Menubar.Separator />
					<Menubar.Item on:click={dbUtils.deleteSelection} disabled={$selection.size == 0}>
						<Trash2 size="16" class="mr-1" />
						{$_('menu.delete')}
						<Shortcut key="⌫" ctrl={true} />
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger aria-label={$_('menu.view')}>
					<View size="18" class="md:hidden" />
					<span class="hidden md:block">{$_('menu.view')}</span>
				</Menubar.Trigger>
				<Menubar.Content class="border-none">
					<Menubar.CheckboxItem bind:checked={$elevationProfile}>
						<ChartArea size="16" class="mr-1" />
						{$_('menu.elevation_profile')}
						<Shortcut key="P" ctrl={true} />
					</Menubar.CheckboxItem>
					<Menubar.CheckboxItem bind:checked={$treeFileView}>
						<ListTree size="16" class="mr-1" />
						{$_('menu.tree_file_view')}
						<Shortcut key="L" ctrl={true} />
					</Menubar.CheckboxItem>
					<Menubar.Separator />
					<Menubar.Item inset on:click={switchBasemaps}>
						<Map size="16" class="mr-1" />{$_('menu.switch_basemap')}<Shortcut key="F1" />
					</Menubar.Item>
					<Menubar.Item inset on:click={toggleOverlays}>
						<Layers2 size="16" class="mr-1" />{$_('menu.toggle_overlays')}<Shortcut key="F2" />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.CheckboxItem bind:checked={$distanceMarkers}>
						<Coins size="16" class="mr-1" />{$_('menu.distance_markers')}<Shortcut key="F3" />
					</Menubar.CheckboxItem>
					<Menubar.CheckboxItem bind:checked={$directionMarkers}>
						<Milestone size="16" class="mr-1" />{$_('menu.direction_markers')}<Shortcut key="F4" />
					</Menubar.CheckboxItem>
					<Menubar.Separator />
					<Menubar.Item inset on:click={toggle3D}>
						<Box size="16" class="mr-1" />
						{$_('menu.toggle_3d')}
						<Shortcut key="{$_('menu.ctrl')}+{$_('menu.drag')}" />
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item inset on:click={showCoordinatesMaps}>
						<Map size="16" class="mr-1" />
						{$_('menu.show_coordinates_maps')}
					</Menubar.Item>
					<Menubar.Item inset on:click={showCatchmentPopup}>
						<Map size="16" class="mr-1" />
						{$_('menu.calculate_catchment')}
					</Menubar.Item>
					<Menubar.Item inset on:click={showWeatherPopup}>
						<CloudRain size="16" class="mr-1" />
						{$_('menu.weather_forecast')}
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger aria-label={$_('menu.settings')}>
					<Settings size="18" class="md:hidden" />
					<span class="hidden md:block">
						{$_('menu.settings')}
					</span>
				</Menubar.Trigger>
				<Menubar.Content class="border-none">
					<Menubar.Sub>
						<Menubar.SubTrigger>
							<Ruler size="16" class="mr-1" />{$_('menu.distance_units')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={$distanceUnits}>
								<Menubar.RadioItem value="metric">{$_('menu.metric')}</Menubar.RadioItem>
								<Menubar.RadioItem value="imperial">{$_('menu.imperial')}</Menubar.RadioItem>
								<Menubar.RadioItem value="nautical">{$_('menu.nautical')}</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Sub>
						<Menubar.SubTrigger>
							<Zap size="16" class="mr-1" />{$_('menu.velocity_units')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={$velocityUnits}>
								<Menubar.RadioItem value="speed">{$_('quantities.speed')}</Menubar.RadioItem>
								<Menubar.RadioItem value="pace">{$_('quantities.pace')}</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Sub>
						<Menubar.SubTrigger>
							<Thermometer size="16" class="mr-1" />{$_('menu.temperature_units')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={$temperatureUnits}>
								<Menubar.RadioItem value="celsius">{$_('menu.celsius')}</Menubar.RadioItem>
								<Menubar.RadioItem value="fahrenheit">{$_('menu.fahrenheit')}</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>
							<Languages size="16" class="mr-1" />
							{$_('menu.language')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={localeValue}>
								{#each Object.entries(languages) as [lang, label]}
									<a href={getURLForLanguage(lang, '/app')}>
										<Menubar.RadioItem value={lang}>{label}</Menubar.RadioItem>
									</a>
								{/each}
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Sub>
						<Menubar.SubTrigger>
							{#if selectedMode === 'light'}
								<Sun size="16" class="mr-1" />
							{:else}
								<Moon size="16" class="mr-1" />
							{/if}
							{$_('menu.mode')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={selectedMode} on:change={(e) => handleModeChange(e.detail)}>
								<Menubar.RadioItem value="light">{$_('menu.light')}</Menubar.RadioItem>
								<Menubar.RadioItem value="dark">{$_('menu.dark')}</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>
							<PersonStanding size="16" class="mr-1" />
							{$_('menu.street_view_source')}
						</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.RadioGroup bind:value={$streetViewSource}>
								<Menubar.RadioItem value="mapillary">{$_('menu.mapillary')}</Menubar.RadioItem>
								<Menubar.RadioItem value="google">{$_('menu.google')}</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Item on:click={() => (layerSettingsOpen = true)}>
						<Layers size="16" class="mr-1" />
						{$_('menu.layers')}
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
		</Menubar.Root>
		<div class="h-fit flex flex-row items-center ml-1 gap-1">
			<Button
				variant="ghost"
				href="./help"
				target="_blank"
				class="cursor-default h-fit rounded-sm px-3 py-0.5"
				aria-label={$_('menu.help')}
			>
				<BookOpenText size="18" class="md:hidden" />
				<span class="hidden md:block">
					{$_('menu.help')}
				</span>
			</Button>
		</div>
	</div>
</div>

<Export />
<LayerControlSettings bind:open={layerSettingsOpen} />

<svelte:window
	on:keydown={handleKeydown}
	on:dragover={(e) => e.preventDefault()}
	on:drop={handleDrop}
/>

<style>
	div :global(button) {
		background-color: transparent;
		padding: 0 0.75rem;
		padding-top: 0.125rem;
		padding-bottom: 0.125rem;
		transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
	div :global(button:hover) {
		background-color: hsl(var(--accent));
	}
</style>
