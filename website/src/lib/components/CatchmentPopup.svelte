<script lang="ts">
	import { onMount } from 'svelte';
	import { Droplet, AlertTriangle, Check, MapPin, ArrowDown } from 'lucide-svelte';
	import { map as mapStore } from '$lib/stores';
	import { createEventDispatcher } from 'svelte';

	export let coordinates: { lng: number; lat: number };
	export let onClose: () => void = () => {};

	const dispatch = createEventDispatcher();

	type CatchmentStatus = 'input' | 'loading' | 'error' | 'success';
	type TrackPoint = [number, number];
	type PointType = 'put_in' | 'take_out';

	interface CatchmentResult {
		track: TrackPoint[];
		river_names: string[] | null;
		elevation_profile: [number, number][];
		bounds_inner: [TrackPoint, TrackPoint];
		bounds_outer: [TrackPoint, TrackPoint];
		length: number;
		osm_length: number | null;
		total_drop: number;
		avg_gradient: number;
		peak_gradient: number;
		peak_gradient_region: [number, number] | null;
		catchment: TrackPoint[];
		catchment_area_km2: number;
		finish_error: number;
		river_catchments: any | null;
		sankey_data: any | null;
	}

	let status: CatchmentStatus = 'input';
	let result: CatchmentResult | null = null;
	let error: string | null = null;
	let progressCheckInterval: ReturnType<typeof setInterval> | null = null;
	let catchmentLayer: any = null;
	let trackLayer: any = null;
	let progressStage: string = 'Loading data...';
	
	// Points for put-in and take-out
	let putInPoint = { lat: coordinates.lat, lng: coordinates.lng };
	let takeOutPoint = { lat: coordinates.lat, lng: coordinates.lng };
	let selectedPointType: PointType = 'put_in';
	let pointsMarkers: { [key in PointType]?: any } = {};
	let mapMoveHandlerAdded = false;
	let mapMoveHandler: any = null;
	
	// Calculation options
	let improveGradientAccuracy = true;
	let findCatchmentArea = true;
	let snapToExistingRivers = false;
	
	// For direct DOM access to elements
	let catchmentContainerElement: HTMLDivElement;
	let trackContainerElement: HTMLDivElement;

	function ensureMapMoveHandler() {
		if (!$mapStore || mapMoveHandlerAdded) return;
		
		// Define the move handler function
		mapMoveHandler = () => {
			if (pointsMarkers['put_in']) repositionMarker('put_in');
			if (pointsMarkers['take_out']) repositionMarker('take_out');
		};
		
		// Add map move event to reposition markers
		$mapStore.on('move', mapMoveHandler);
		
		mapMoveHandlerAdded = true;
		console.log("Map move handler added");
	}

	onMount(() => {
		try {
			console.log("CatchmentPopup mounted", $mapStore ? "map available" : "map not available");
			
			// Setup Mapbox popup close listener
			const popupElement = document.querySelector('.mapboxgl-popup');
			if (popupElement) {
				const closeButton = popupElement.querySelector('.mapboxgl-popup-close-button');
				if (closeButton) {
					closeButton.addEventListener('click', handleClose);
					console.log("Added close button listener");
				} else {
					console.warn("Mapbox popup close button not found");
				}
			} else {
				console.warn("Mapbox popup element not found");
			}
			
			// Add a mutation observer to detect when the popup is removed from the DOM
			// This is a backup to ensure markers are removed if handleClose isn't called
			const body = document.body;
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
						// Check if any of the removed nodes is our popup
						for (let i = 0; i < mutation.removedNodes.length; i++) {
							const node = mutation.removedNodes[i];
							if (node instanceof Element && node.classList.contains('mapboxgl-popup')) {
								console.log("Popup was removed from DOM, cleaning up markers");
								handleClose();
								observer.disconnect();
								break;
							}
						}
					}
				});
			});
			
			observer.observe(body, {
				childList: true,
				subtree: true
			});
			
			// Delay to ensure map is fully loaded
			setTimeout(() => {
				try {
					console.log("Attempting to add initial put-in marker");
					
					if (!$mapStore) {
						console.error("Map not available for initial marker");
						return;
					}
					
					// Add initial put-in marker and ensure move handler is registered
					addMarkerToMap('put_in', putInPoint);
					
				} catch (e) {
					console.error("Error adding initial marker:", e);
				}
			}, 500);
		} catch (e) {
			console.error("Error in onMount:", e);
		}
		
		return () => {
			// Cleanup happens here or in handleClose
			// We're already doing the cleanup in handleClose now
			// But still doing basic cleanup here as a fallback
			try {
				console.log("Component destroy cleanup triggered");
				if (progressCheckInterval) {
					clearInterval(progressCheckInterval);
					progressCheckInterval = null;
				}
				
				// Clean up map layers on component destruction
				removeLayers();
				
				// Force removal of marker elements directly
				for (const type of ['put_in', 'take_out']) {
					const markerId = type === 'put_in' ? 'put-in-marker' : 'take-out-marker';
					const markerElement = document.getElementById(markerId);
					if (markerElement && markerElement.parentNode) {
						markerElement.parentNode.removeChild(markerElement);
						console.log(`Removed ${type} marker on component destroy`);
					}
				}
				removeMarkers();
			} catch (e) {
				console.error("Error in cleanup:", e);
			}
		};
	});
	
	// Function to manually add a marker
	function addMarkerToMap(type: PointType, coordinates: { lat: number, lng: number }) {
		console.log(`Adding ${type} marker at:`, coordinates);
		
		if (!$mapStore) {
			console.error("Map not available for marker");
			return;
		}
		
		try {
			// Remove old marker if exists
			if (pointsMarkers[type]) {
				pointsMarkers[type].remove();
			}
			
			// Create marker element
			const markerId = type === 'put_in' ? 'put-in-marker' : 'take-out-marker';
			const markerColor = type === 'put_in' ? '#10B981' : '#EF4444';
			const markerSymbol = type === 'put_in' ? '▲' : '▼';
			
			const markerElement = document.createElement('div');
			markerElement.id = markerId;
			markerElement.style.position = 'absolute';
			markerElement.style.width = '30px';
			markerElement.style.height = '30px';
			markerElement.style.background = markerColor;
			markerElement.style.borderRadius = '50%';
			markerElement.style.border = '3px solid white';
			markerElement.style.color = 'white';
			markerElement.style.display = 'flex';
			markerElement.style.justifyContent = 'center';
			markerElement.style.alignItems = 'center';
			markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
			markerElement.style.zIndex = '999';
			markerElement.style.cursor = 'grab';
			markerElement.style.userSelect = 'none';
			markerElement.style.fontWeight = 'bold';
			markerElement.innerHTML = markerSymbol;
			
			// Add to map container instead of body for proper positioning
			const mapContainer = $mapStore.getContainer();
			mapContainer.appendChild(markerElement);
			
			// Store point coordinates
			if (type === 'put_in') {
				putInPoint = coordinates;
			} else {
				takeOutPoint = coordinates;
			}
			
			// Position the marker
			repositionMarker(type);
			
			// Set up drag functionality
			let isDragging = false;
			let startX = 0;
			let startY = 0;
			
			// Disable map dragging when marker is dragged
			const disableMapDragPan = () => {
				if ($mapStore && $mapStore.dragPan) {
					$mapStore.dragPan.disable();
				}
			};
			
			// Re-enable map dragging when marker drag is complete
			const enableMapDragPan = () => {
				if ($mapStore && $mapStore.dragPan) {
					$mapStore.dragPan.enable();
				}
			};
			
			// Begin drag
			markerElement.addEventListener('mousedown', (e) => {
				e.preventDefault();
				e.stopPropagation();
				isDragging = true;
				startX = e.clientX;
				startY = e.clientY;
				markerElement.style.cursor = 'grabbing';
				disableMapDragPan();
			});
			
			// Touch start handler for mobile devices
			markerElement.addEventListener('touchstart', (e) => {
				if (e.touches.length === 1) {
					e.preventDefault();
					e.stopPropagation();
					isDragging = true;
					startX = e.touches[0].clientX;
					startY = e.touches[0].clientY;
					markerElement.style.cursor = 'grabbing';
					disableMapDragPan();
				}
			});
			
			// Handle drag move
			const mouseMoveHandler = (e: MouseEvent) => {
				if (!isDragging || !$mapStore) return;
				
				e.preventDefault();
				e.stopPropagation();
				
				// Calculate new position
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				startX = e.clientX;
				startY = e.clientY;
				
				// Get current marker position from DOM
				const left = parseInt(markerElement.style.left, 10) || 0;
				const top = parseInt(markerElement.style.top, 10) || 0;
				
				// Update DOM position
				markerElement.style.left = `${left + dx}px`;
				markerElement.style.top = `${top + dy}px`;
				
				// Convert pixel position to map coordinates
				const point = $mapStore.unproject([left + dx + 15, top + dy + 15]);
				
				// Update stored coordinates
				if (type === 'put_in') {
					putInPoint = { ...putInPoint, lat: point.lat, lng: point.lng };
				} else {
					takeOutPoint = { ...takeOutPoint, lat: point.lat, lng: point.lng };
				}
			};
			
			// Touch move handler for mobile devices
			const touchMoveHandler = (e: TouchEvent) => {
				if (!isDragging || !$mapStore || e.touches.length !== 1) return;
				
				e.preventDefault();
				e.stopPropagation();
				
				// Calculate new position
				const dx = e.touches[0].clientX - startX;
				const dy = e.touches[0].clientY - startY;
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
				
				// Get current marker position from DOM
				const left = parseInt(markerElement.style.left, 10) || 0;
				const top = parseInt(markerElement.style.top, 10) || 0;
				
				// Update DOM position
				markerElement.style.left = `${left + dx}px`;
				markerElement.style.top = `${top + dy}px`;
				
				// Convert pixel position to map coordinates
				const point = $mapStore.unproject([left + dx + 15, top + dy + 15]);
				
				// Update stored coordinates
				if (type === 'put_in') {
					putInPoint = { ...putInPoint, lat: point.lat, lng: point.lng };
				} else {
					takeOutPoint = { ...takeOutPoint, lat: point.lat, lng: point.lng };
				}
			};
			
			// End drag
			const mouseUpHandler = (e: MouseEvent) => {
				if (!isDragging) return;
				
				e.preventDefault();
				e.stopPropagation();
				
				isDragging = false;
				markerElement.style.cursor = 'grab';
				enableMapDragPan();
				
				// Final update to ensure accuracy
				if ($mapStore) {
					const left = parseInt(markerElement.style.left, 10) || 0;
					const top = parseInt(markerElement.style.top, 10) || 0;
					const point = $mapStore.unproject([left + 15, top + 15]);
					
					if (type === 'put_in') {
						putInPoint = { ...putInPoint, lat: point.lat, lng: point.lng };
					} else {
						takeOutPoint = { ...takeOutPoint, lat: point.lat, lng: point.lng };
					}
				}
			};
			
			// Touch end handler for mobile devices
			const touchEndHandler = (e: TouchEvent) => {
				if (!isDragging) return;
				
				e.preventDefault();
				e.stopPropagation();
				
				isDragging = false;
				markerElement.style.cursor = 'grab';
				enableMapDragPan();
				
				// Final update to ensure accuracy
				if ($mapStore) {
					const left = parseInt(markerElement.style.left, 10) || 0;
					const top = parseInt(markerElement.style.top, 10) || 0;
					const point = $mapStore.unproject([left + 15, top + 15]);
					
					if (type === 'put_in') {
						putInPoint = { ...putInPoint, lat: point.lat, lng: point.lng };
					} else {
						takeOutPoint = { ...takeOutPoint, lat: point.lat, lng: point.lng };
					}
				}
			};
			
			// Add event listeners to document to track mouse movement outside the marker
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
			document.addEventListener('touchmove', touchMoveHandler, { passive: false });
			document.addEventListener('touchend', touchEndHandler);
			document.addEventListener('touchcancel', touchEndHandler);
			
			// Store marker reference
			pointsMarkers[type] = {
				element: markerElement,
				remove: () => {
					if (markerElement.parentNode) {
						markerElement.parentNode.removeChild(markerElement);
					}
					// Remove event listeners when marker is removed
					document.removeEventListener('mousemove', mouseMoveHandler);
					document.removeEventListener('mouseup', mouseUpHandler);
					document.removeEventListener('touchmove', touchMoveHandler);
					document.removeEventListener('touchend', touchEndHandler);
					document.removeEventListener('touchcancel', touchEndHandler);
				}
			};
			
			// Make sure we have a move handler
			ensureMapMoveHandler();
			
			console.log(`${type} marker added successfully via DOM`);
		} catch (e) {
			console.error("Error adding marker:", e);
		}
	}
	
	// Function to reposition marker based on its coordinates
	function repositionMarker(type: PointType) {
		if (!$mapStore) return;
		
		try {
			// Get the corresponding marker element
			const markerId = type === 'put_in' ? 'put-in-marker' : 'take-out-marker';
			const markerElement = document.getElementById(markerId);
			if (!markerElement) return;
			
			// Get the coordinates
			const coords = type === 'put_in' ? putInPoint : takeOutPoint;
			
			// Convert coordinates to pixel position
			const point = $mapStore.project([coords.lng, coords.lat]);
			
			// Position the marker (accounting for marker center)
			markerElement.style.left = `${point.x - 15}px`;
			markerElement.style.top = `${point.y - 15}px`;
		} catch (e) {
			console.error(`Error repositioning ${type} marker:`, e);
		}
	}

	function setPointLocation(type: PointType) {
		selectedPointType = type;
		
		console.log(`Setting ${type} location, awaiting map click`);
		
		if (!$mapStore) {
			console.error("Map not available for click selection");
			return;
		}
		
		try {
			// Create visual indicator
			const indicator = document.createElement('div');
			indicator.style.position = 'fixed';
			indicator.style.top = '20%';
			indicator.style.left = '50%';
			indicator.style.transform = 'translateX(-50%)';
			indicator.style.background = 'rgba(0,0,0,0.8)';
			indicator.style.color = 'white';
			indicator.style.padding = '10px 20px';
			indicator.style.borderRadius = '4px';
			indicator.style.zIndex = '9999';
			indicator.textContent = `Click on the map to set ${type === 'put_in' ? 'put-in' : 'take-out'} point`;
			document.body.appendChild(indicator);
			
			// Set up click handler
			const handleMapClick = (e: any) => {
				console.log(`Map clicked at:`, e.lngLat);
				
				const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
				
				// Update coordinates and add marker
				addMarkerToMap(type, coords);
				
				// Remove indicator
				document.body.removeChild(indicator);
				
				// Reset selection state to show calculate button
				selectedPointType = null as any;
				
				// Remove handler
				$mapStore.off('click', handleMapClick);
			};
			
			// Add click handler
			$mapStore.once('click', handleMapClick);
		} catch (e) {
			console.error("Error setting up click handler:", e);
			selectedPointType = null as any;
		}
	}

	function removeLayers() {
		if (!$mapStore) return;
		
		try {
			console.log("Removing existing map layers");
			
			// Remove catchment polygon
			if ($mapStore.getSource('catchment-area')) {
				try {
					if ($mapStore.getLayer('catchment-area-fill')) {
						$mapStore.removeLayer('catchment-area-fill');
					}
					if ($mapStore.getLayer('catchment-area-outline')) {
						$mapStore.removeLayer('catchment-area-outline');
					}
					$mapStore.removeSource('catchment-area');
				} catch (error) {
					console.error("Error removing catchment layers:", error);
				}
			}
			
			// Remove catchment GeoJSON
			if ($mapStore.getSource('catchment-area-geojson')) {
				try {
					if ($mapStore.getLayer('catchment-area-fill-geojson')) {
						$mapStore.removeLayer('catchment-area-fill-geojson');
					}
					if ($mapStore.getLayer('catchment-area-outline-geojson')) {
						$mapStore.removeLayer('catchment-area-outline-geojson');
					}
					$mapStore.removeSource('catchment-area-geojson');
				} catch (error) {
					console.error("Error removing catchment GeoJSON layers:", error);
				}
			}
			
			// Remove track line
			if ($mapStore.getSource('catchment-track')) {
				try {
					if ($mapStore.getLayer('catchment-track-line')) {
						$mapStore.removeLayer('catchment-track-line');
					}
					$mapStore.removeSource('catchment-track');
				} catch (error) {
					console.error("Error removing track layers:", error);
				}
			}
			
			// Remove track GPX
			if ($mapStore.getSource('catchment-track-gpx')) {
				try {
					if ($mapStore.getLayer('catchment-track-line-gpx')) {
						$mapStore.removeLayer('catchment-track-line-gpx');
					}
					$mapStore.removeSource('catchment-track-gpx');
				} catch (error) {
					console.error("Error removing track GPX layers:", error);
				}
			}
		} catch (error) {
		}
	}

	function removeMarkers() {
		// Remove existing markers
		Object.values(pointsMarkers).forEach(marker => {
			if (marker) marker.remove();
		});
		pointsMarkers = {};
	}

	// New function to create SVG elements for displaying the catchment and track
	function createSVGLayer(container: HTMLDivElement, points: TrackPoint[], isTrack: boolean = false) {
		// Clear previous content
		container.innerHTML = '';
		
		if (!points || points.length < 2) return;
		
		// Calculate bounding box for the points
		const lats = points.map(p => p[0]);
		const lngs = points.map(p => p[1]);
		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);
		const minLng = Math.min(...lngs);
		const maxLng = Math.max(...lngs);
		
		// Create SVG element
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		svg.style.position = 'absolute';
		svg.style.top = '0';
		svg.style.left = '0';
		svg.style.pointerEvents = 'none';
		svg.style.zIndex = isTrack ? '10' : '5';
		
		// Create path element
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		
		// Generate path data
		let pathData = '';
		
		if (isTrack) {
			// Line string for track
			points.forEach((p, i) => {
				// Normalize coordinates to viewport
				const x = (p[1] - minLng) / (maxLng - minLng) * 100;
				const y = 100 - (p[0] - minLat) / (maxLat - minLat) * 100;
				
				if (i === 0) pathData += `M${x} ${y}`;
				else pathData += ` L${x} ${y}`;
			});
			
			path.setAttribute('d', pathData);
			path.setAttribute('stroke', 'red');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('fill', 'none');
		} else {
			// Polygon for catchment
			points.forEach((p, i) => {
				// Normalize coordinates to viewport
				const x = (p[1] - minLng) / (maxLng - minLng) * 100;
				const y = 100 - (p[0] - minLat) / (maxLat - minLat) * 100;
				
				if (i === 0) pathData += `M${x} ${y}`;
				else pathData += ` L${x} ${y}`;
			});
			// Close the path
			pathData += ' Z';
			
			path.setAttribute('d', pathData);
			path.setAttribute('stroke', '#0060d0');
			path.setAttribute('stroke-width', '1');
			path.setAttribute('fill', '#0080ff');
			path.setAttribute('fill-opacity', '0.35');
		}
		
		svg.appendChild(path);
		container.appendChild(svg);
		
		console.log(`Added ${isTrack ? 'track' : 'catchment'} SVG layer with ${points.length} points`);
	}

	function addGeometryToMap(catchment: TrackPoint[], track: TrackPoint[]) {
		if (!$mapStore) {
			console.error("Map not available for adding geometry");
			return;
		}
		
		console.log("Adding geometry to map:", {
			catchmentPoints: catchment.length,
			trackPoints: track.length
		});
		
		try {
			// Remove existing layers but keep markers
			removeLayers();
			
			// Ensure we're working with a properly formatted catchment polygon
			if (!catchment || catchment.length < 3) {
				console.error("Invalid catchment polygon: needs at least 3 points");
				return;
			}
			
			// Generate GPX data for track
			if (track && track.length > 1) {
				let gpxTrack = '<?xml version="1.0" encoding="UTF-8"?>\n';
				gpxTrack += '<gpx version="1.1" creator="gps.studio" xmlns="http://www.topografix.com/GPX/1/1">\n';
				gpxTrack += '  <trk>\n';
				gpxTrack += '    <name>River Track</name>\n';
				gpxTrack += '    <trkseg>\n';
				
				// Add track points - GPX expects [lat, lon] order
				track.forEach(point => {
					gpxTrack += `      <trkpt lat="${point[0]}" lon="${point[1]}"></trkpt>\n`;
				});
				
				gpxTrack += '    </trkseg>\n';
				gpxTrack += '  </trk>\n';
				
				// Add the catchment as a route if provided
				if (catchment && catchment.length > 2) {
					gpxTrack += '  <rte>\n';
					gpxTrack += '    <name>Catchment Boundary</name>\n';
					
					// Add catchment points - GPX expects [lat, lon] order
					catchment.forEach(point => {
						gpxTrack += `    <rtept lat="${point[0]}" lon="${point[1]}"></rtept>\n`;
					});
					
					gpxTrack += '  </rte>\n';
				}
				
				gpxTrack += '</gpx>';
				
				// Create a blob URL for the GPX data
				const trackBlob = new Blob([gpxTrack], { type: 'application/gpx+xml' });
				const trackUrl = URL.createObjectURL(trackBlob);
				
				// Add track via GeoJSON instead of GPX for compatibility
				const trackGeoJson = {
					type: 'Feature' as const,
					properties: {},
					geometry: {
						type: 'LineString' as const,
						coordinates: track.map(p => [p[1], p[0]]) // Convert [lat, lng] to [lng, lat]
					}
				};
				
				$mapStore.addSource('catchment-track-gpx', {
					type: 'geojson',
					data: trackGeoJson
				});
				
				$mapStore.addLayer({
					id: 'catchment-track-line-gpx',
					type: 'line',
					source: 'catchment-track-gpx',
					paint: {
						'line-color': '#ff0000',
						'line-width': 4,
						'line-opacity': 0.8
					}
				});
				
				console.log("Added track as GeoJSON LineString");
			}
			
			// Create a GeoJSON for the catchment polygon
			const catchmentCoordinates: [number, number][] = [];
			
			// Copy the catchment points to the GeoJSON, ensuring it's closed
			catchment.forEach((point) => {
				// GeoJSON expects [lng, lat] order
				catchmentCoordinates.push([point[1], point[0]]);
			});
			
			// Ensure the polygon is closed
			const firstPoint = catchment[0];
			const lastPoint = catchment[catchment.length - 1];
			if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
				catchmentCoordinates.push([firstPoint[1], firstPoint[0]]);
			}
			
			const catchmentGeoJson = {
				type: 'Feature' as const,
				properties: {},
				geometry: {
					type: 'Polygon' as const,
					coordinates: [catchmentCoordinates]
				}
			};
			
			// Add catchment GeoJSON source
			$mapStore.addSource('catchment-area-geojson', {
				type: 'geojson',
				data: catchmentGeoJson
			});
			
			// Add fill layer
			$mapStore.addLayer({
				id: 'catchment-area-fill-geojson',
				type: 'fill',
				source: 'catchment-area-geojson',
				paint: {
					'fill-color': '#0080ff',
					'fill-opacity': 0.35
				}
			});
			
			// Add outline layer
			$mapStore.addLayer({
				id: 'catchment-area-outline-geojson',
				type: 'line',
				source: 'catchment-area-geojson',
				paint: {
					'line-color': '#0060d0',
					'line-width': 2
				}
			});
			
			console.log("Added catchment as GeoJSON Polygon");
			
			// Try to fit map to the bounds
			try {
				// Calculate bounds from catchment
				const lngs = catchment.map(c => c[1]);
				const lats = catchment.map(c => c[0]);
				
				const minLng = Math.min(...lngs);
				const maxLng = Math.max(...lngs);
				const minLat = Math.min(...lats);
				const maxLat = Math.max(...lats);
				
				console.log("Fitting map to bounds:", { minLng, maxLng, minLat, maxLat });
				
				// Check if bounds are valid
				if (isFinite(minLng) && isFinite(maxLng) && isFinite(minLat) && isFinite(maxLat)) {
					const sw: [number, number] = [minLng, minLat];
					const ne: [number, number] = [maxLng, maxLat];
					
					$mapStore.fitBounds([sw, ne], {
						padding: 50
					});
				} else {
					console.error("Invalid bounds, cannot fit map");
				}
			} catch (fitError) {
				console.error("Error fitting map to bounds:", fitError);
			}
			
			console.log("Geometry processing complete");
		} catch (error) {
			console.error("Error in addGeometryToMap:", error);
		}
	}

	// Function to handle closing the popup
	function handleClose() {
		try {
			console.log("Popup close triggered");
			// Cleanup
			if (progressCheckInterval) {
				clearInterval(progressCheckInterval);
				progressCheckInterval = null;
			}
			
			// Remove map move handler
			if ($mapStore && mapMoveHandlerAdded && mapMoveHandler) {
				try {
					$mapStore.off('move', mapMoveHandler);
					console.log("Map move handler removed on close");
				} catch (e) {
					console.error("Error removing map move handler:", e);
				}
			}
			
			// Clean up map layers
			removeLayers();
			
			// Force the removal of markers
			for (const type of ['put_in', 'take_out']) {
				const markerId = type === 'put_in' ? 'put-in-marker' : 'take-out-marker';
				const markerElement = document.getElementById(markerId);
				if (markerElement && markerElement.parentNode) {
					markerElement.parentNode.removeChild(markerElement);
					console.log(`Removed ${type} marker on close`);
				}
			}
			removeMarkers();
			
			// Call parent onClose handler
			onClose();
			
			// Dispatch event for parent components
			dispatch('close');
		} catch (e) {
			console.error("Error in handleClose:", e);
		}
	}

	async function checkProgress(uuid: string) {
		console.log("Checking progress for UUID:", uuid);
		
		// Add cache-busting query parameter to prevent cached responses
		const timestamp = new Date().getTime();
		const url = `https://maps.wanderstories.space/gis/track-progress/${uuid}?_t=${timestamp}`;
		
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache'
			},
			mode: 'cors',
			credentials: 'same-origin'
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error("Progress API error:", response.status, response.statusText, errorText);
			throw new Error(`Failed to check progress: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Catchment progress:", data);
		
		// Update stage information for display in the UI
		if (data.status === 'PROGRESS' && data.result && typeof data.result === 'string') {
			progressStage = data.result;
		}
		
		// Check for the new response format with status at top level
		if (data.status === 'SUCCESS') {
			if (progressCheckInterval) {
				clearInterval(progressCheckInterval);
				progressCheckInterval = null;
			}
			result = data.result;
			status = 'success';
			
			// Add the catchment and track to the map
			if (result && result.catchment && result.catchment.length > 0) {
				// Use setTimeout to ensure UI updates first, then add geometry to map
				setTimeout(() => {
					if (result) { // Additional null check for TypeScript
						addGeometryToMap(result.catchment, result.track);
					}
				}, 100);
			}
		} else if (data.status === 'ERROR') {
			if (progressCheckInterval) {
				clearInterval(progressCheckInterval);
				progressCheckInterval = null;
			}
			throw new Error(data.error || 'Unknown error in catchment calculation');
		}
		// If status is 'PENDING' or 'PROGRESS', we continue waiting
	}
	
	async function calculateCatchment() {
		try {
			console.log("Calculate catchment button clicked");
			status = 'loading';
			error = null;

			// Prepare the request payload
			const payload = {
				map_data: {
					put_in: {
						lat: putInPoint.lat,
						lng: putInPoint.lng
					},
					take_out: {
						lat: takeOutPoint.lat,
						lng: takeOutPoint.lng
					}
				},
				generate_catchment: findCatchmentArea,
				generate_osm: snapToExistingRivers,
				generate_astar: improveGradientAccuracy
			};

			console.log("Sending request with payload:", payload);

			// Send POST request to calculate catchment
			const response = await fetch('https://maps.wanderstories.space/gis/track', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache'
				},
				mode: 'cors',
				credentials: 'same-origin',
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("API error:", response.status, response.statusText, errorText);
				throw new Error(`Failed to calculate catchment: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Catchment calculation initiated:", data);
			if (!data.uuid) {
				throw new Error('No UUID returned from catchment calculation');
			}

			// Check progress every 1 second
			progressCheckInterval = setInterval(async () => {
				try {
					await checkProgress(data.uuid);
				} catch (e) {
					if (progressCheckInterval) {
						clearInterval(progressCheckInterval);
						progressCheckInterval = null;
					}
					status = 'error';
					error = e instanceof Error ? e.message : 'Unknown error checking progress';
				}
			}, 1000);
		} catch (e) {
			console.error("Error in calculateCatchment:", e);
			status = 'error';
			error = e instanceof Error ? e.message : 'Unknown error calculating catchment';
		}
	}
	
	function resetAnalysis() {
		status = 'input';
		result = null;
		error = null;
		removeLayers();
	}

	// Function to generate properly formatted GPX data for track and catchment
	function generateTrackGpx(track: TrackPoint[], catchment?: TrackPoint[]): string {
		let gpxContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
		gpxContent += '<gpx version="1.1" creator="gps.studio" xmlns="http://www.topografix.com/GPX/1/1">\n';
		
		// Add the track
		gpxContent += '  <trk>\n';
		gpxContent += '    <name>River Track</name>\n';
		gpxContent += '    <trkseg>\n';
		
		// Add track points - GPX expects [lat, lon] order
		track.forEach(point => {
			gpxContent += `      <trkpt lat="${point[0]}" lon="${point[1]}"></trkpt>\n`;
		});
		
		gpxContent += '    </trkseg>\n';
		gpxContent += '  </trk>\n';
		
		// Add the catchment as a route if provided
		if (catchment && catchment.length > 2) {
			gpxContent += '  <rte>\n';
			gpxContent += '    <name>Catchment Boundary</name>\n';
			
			// Add catchment points - GPX expects [lat, lon] order
			catchment.forEach(point => {
				gpxContent += `    <rtept lat="${point[0]}" lon="${point[1]}"></rtept>\n`;
			});
			
			gpxContent += '  </rte>\n';
		}
		
		gpxContent += '</gpx>';
		
		return gpxContent;
	}

	// Download GPX file with both track and catchment
	function downloadGpxFile(track: TrackPoint[], catchment?: TrackPoint[]) {
		if (!track || track.length < 2) return;
		
		const gpxContent = generateTrackGpx(track, catchment);
		const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'river_track.gpx';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// New function to download combined GPX with both track and catchment
	function downloadCombinedGpx() {
		if (!result || !result.track || result.track.length < 2) return;
		
		// Create GPX content
		let gpxContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
		gpxContent += '<gpx version="1.1" creator="gps.studio" xmlns="http://www.topografix.com/GPX/1/1">\n';
		
		// Add the track
		gpxContent += '  <trk>\n';
		gpxContent += '    <name>River Track</name>\n';
		gpxContent += '    <trkseg>\n';
		
		// Add track points - GPX expects [lat, lon] order
		result.track.forEach(point => {
			gpxContent += `      <trkpt lat="${point[0]}" lon="${point[1]}"></trkpt>\n`;
		});
		
		gpxContent += '    </trkseg>\n';
		gpxContent += '  </trk>\n';
		
		// Add the catchment as a route if available
		if (result.catchment && result.catchment.length > 2) {
			gpxContent += '  <rte>\n';
			gpxContent += '    <name>Catchment Boundary</name>\n';
			
			// Add catchment points - GPX expects [lat, lon] order
			result.catchment.forEach(point => {
				gpxContent += `    <rtept lat="${point[0]}" lon="${point[1]}"></rtept>\n`;
			});
			
			gpxContent += '  </rte>\n';
		}
		
		gpxContent += '</gpx>';
		
		// Create and download the file
		const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'river_catchment.gpx';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="p-2 text-sm bg-background rounded-md shadow-md border border-border">
	<div class="flex items-center justify-between border-b pb-2 mb-2">
		<h3 class="text-lg font-semibold flex items-center">
			<Droplet size="18" class="mr-2" />
			Catchment Analysis
		</h3>
	</div>

	<!-- Container for SVG fallback layers (only used if Mapbox layers fail) -->
	<div bind:this={catchmentContainerElement} class="absolute inset-0 pointer-events-none"></div>
	<div bind:this={trackContainerElement} class="absolute inset-0 pointer-events-none"></div>
	
	{#if status === 'input'}
		<div class="space-y-4">
			<p class="text-sm">Select the put-in and take-out points to analyze the river section:</p>
			
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-muted-foreground">Put-in Point</span>
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
					</div>
					<div class="font-mono text-xs truncate">
						{putInPoint.lat.toFixed(6)}, {putInPoint.lng.toFixed(6)}
					</div>
					<button 
						class="w-full mt-1 px-2 py-1 bg-muted hover:bg-muted/80 text-xs rounded-sm"
						on:click={() => setPointLocation('put_in')}
					>
						Set on Map
					</button>
				</div>
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-muted-foreground">Take-out Point</span>
						<div class="h-3 w-3 rounded-full bg-red-500"></div>
					</div>
					{#if pointsMarkers['take_out']}
						<div class="font-mono text-xs truncate">
							{takeOutPoint.lat.toFixed(6)}, {takeOutPoint.lng.toFixed(6)}
						</div>
						<button 
							class="w-full mt-1 px-2 py-1 bg-muted hover:bg-muted/80 text-xs rounded-sm"
							on:click={() => setPointLocation('take_out')}
						>
							Change Location
						</button>
					{:else}
						<div class="font-mono text-xs truncate">Not set</div>
						<button 
							class="w-full mt-1 px-2 py-1 bg-muted hover:bg-muted/80 text-xs rounded-sm"
							on:click={() => setPointLocation('take_out')}
						>
							Set on Map
						</button>
					{/if}
				</div>
			</div>
			
			<div class="mt-3 space-y-2 bg-muted/30 p-2 rounded-md">
				<div class="text-xs font-medium mb-1">Calculation Options:</div>
				<label class="flex items-center gap-2 text-xs cursor-pointer">
					<input type="checkbox" bind:checked={improveGradientAccuracy} class="w-3.5 h-3.5 rounded" />
					<span>Improve gradient accuracy</span>
				</label>
				<label class="flex items-center gap-2 text-xs cursor-pointer">
					<input type="checkbox" bind:checked={findCatchmentArea} class="w-3.5 h-3.5 rounded" />
					<span>Find catchment area</span>
				</label>
				<label class="flex items-center gap-2 text-xs cursor-pointer">
					<input type="checkbox" bind:checked={snapToExistingRivers} class="w-3.5 h-3.5 rounded" />
					<span>Snap to existing rivers</span>
				</label>
			</div>
			
			<div class="flex items-center justify-center mt-2">
				{#if selectedPointType === 'put_in' || selectedPointType === 'take_out'}
					<div class="bg-primary/10 text-primary px-3 py-1 rounded-md text-xs">
						Click on the map to set {selectedPointType === 'put_in' ? 'put-in' : 'take-out'} point
					</div>
				{:else}
					<button 
						class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors"
						on:click={() => {
							console.log("Calculate button clicked");
							calculateCatchment();
						}}
						disabled={!pointsMarkers['take_out']}
					>
						Calculate Catchment
					</button>
					{#if !pointsMarkers['take_out']}
						<div class="text-xs text-destructive ml-2">Set take-out point first</div>
					{/if}
				{/if}
			</div>
			
			<div class="text-xs text-muted-foreground text-center mt-2">
				<span>Tip: Markers can be dragged to adjust position</span>
			</div>
		</div>
	{:else if status === 'loading'}
		<div class="flex flex-col items-center justify-center py-8">
			<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
			<p>Calculating catchment area...</p>
			<div class="text-xs text-muted-foreground mt-2 text-center max-w-[300px]">
				<p class="mb-1">This may take a minute or two</p>
				{#if progressStage}
					<p class="font-medium text-primary bg-primary/10 py-1 px-2 rounded mt-2">{progressStage}</p>
				{/if}
			</div>
		</div>
	{:else if status === 'error'}
		<div class="flex flex-col items-center justify-center py-8 text-destructive">
			<AlertTriangle size="24" class="mb-2" />
			<p>Error calculating catchment:</p>
			<p class="text-xs mt-2">{error}</p>
			<button 
				class="mt-4 px-4 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-md"
				on:click={resetAnalysis}
			>
				Try Again
			</button>
		</div>
	{:else if result}
		<div class="space-y-3">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<div class="text-xs text-muted-foreground">Catchment Area</div>
					<div class="font-medium">{result.catchment_area_km2.toFixed(2)} km²</div>
				</div>
				<div class="space-y-1">
					<div class="text-xs text-muted-foreground">River Length</div>
					<div class="font-medium">{result.length.toFixed(2)} km</div>
				</div>
				<div class="space-y-1">
					<div class="text-xs text-muted-foreground">Total Drop</div>
					<div class="font-medium">{result.total_drop} m</div>
				</div>
				<div class="space-y-1">
					<div class="text-xs text-muted-foreground">Average Gradient</div>
					<div class="font-medium">{result.avg_gradient.toFixed(2)} m/km</div>
				</div>
			</div>

			{#if result.elevation_profile.length > 1}
				<div class="mt-3 pt-3 border-t">
					<h4 class="text-sm font-medium mb-2">Elevation Profile</h4>
					<div class="h-20 w-full bg-muted/50 rounded-md relative">
						<div class="absolute inset-0 flex items-end">
							{#each result.elevation_profile as [distance, elevation], i}
								{#if result.total_drop > 0}
									<!-- Calculate bar height based on elevation drop from highest point -->
									{@const minElev = Math.min(...result.elevation_profile.map(p => p[1]))}
									{@const maxElev = Math.max(...result.elevation_profile.map(p => p[1]))}
									{@const heightPercent = ((elevation - minElev) / (maxElev - minElev) * 100) || 50}
									<div 
										class="bg-primary flex-1 mx-0.5 transition-all duration-200"
										style="height: {heightPercent}%;"
										title="{elevation}m at {(distance/1000).toFixed(2)}km"
									></div>
								{:else}
									<div 
										class="bg-primary flex-1 mx-0.5 transition-all duration-200"
										style="height: 50%;"
										title="{elevation}m at {(distance/1000).toFixed(2)}km"
									></div>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="mt-3 pt-3 border-t">
					<h4 class="text-sm font-medium mb-2">Elevation Profile</h4>
					<div class="h-20 w-full bg-muted/50 rounded-md flex items-center justify-center">
						<span class="text-xs text-muted-foreground">Insufficient elevation data</span>
					</div>
				</div>
			{/if}

			<div class="mt-3 pt-3 border-t">
				<h4 class="text-sm font-medium mb-2">GeoJSON Data</h4>
				<div class="text-xs">
					<div class="flex items-start mb-2">
						<MapPin size="12" class="mt-0.5 mr-1 text-red-500 shrink-0" />
						<div>
							<div class="font-medium">Track Data ({result.track.length} points)</div>
							{#if result.track.length === 1}
								<div class="font-mono mt-1">
									{result.track[0][1].toFixed(6)}, {result.track[0][0].toFixed(6)}
								</div>
							{:else if result.track.length > 1}
								<div class="font-mono mt-1">
									{result.track.length} points from [{result.track[0][1].toFixed(4)}, {result.track[0][0].toFixed(4)}] to [{result.track[result.track.length-1][1].toFixed(4)}, {result.track[result.track.length-1][0].toFixed(4)}]
								</div>
								<div class="flex space-x-2 mt-2">
									<button 
										class="px-2 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-sm text-xs"
										on:click={downloadCombinedGpx}
									>
										Download GPX
									</button>
								</div>
							{/if}
						</div>
					</div>
					<div class="flex items-start">
						<Droplet size="12" class="mt-0.5 mr-1 text-blue-500 shrink-0" />
						<div>
							<div class="font-medium">Catchment Polygon ({result.catchment.length} points)</div>
							<div class="flex space-x-2 mt-1">
								<button 
									class="px-2 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-sm text-xs"
									on:click={() => {
										if (result) {
											const geojson = {
												type: "Feature",
												geometry: {
													type: "Polygon",
													coordinates: [result.catchment]
												},
												properties: {
													catchmentArea: result.catchment_area_km2,
													elevation: result.elevation_profile
												}
											};
											navigator.clipboard.writeText(JSON.stringify(geojson));
										}
									}}
								>
									Copy GeoJSON
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flex justify-between mt-4">
				<button 
					class="px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-md text-xs"
					on:click={resetAnalysis}
				>
					New Analysis
				</button>
				
				<div class="flex items-center text-success">
					<Check size="16" class="mr-1" />
					<span>Calculation complete</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.catchment-popup) {
		max-width: 400px !important;
	}
	
	/* Add styles to prevent interference with Mapbox close button */
	:global(.mapboxgl-popup-close-button) {
		font-size: 16px !important;
		padding: 4px 8px !important;
		color: var(--muted-foreground) !important;
	}
	
	:global(.mapboxgl-popup-close-button:hover) {
		color: var(--foreground) !important;
		background: transparent !important;
	}
</style> 