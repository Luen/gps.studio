<script lang="ts">
	import { map } from '$lib/stores';
	import { TrackPoint } from 'gpx';
	import { Map, ClipboardCopy, Compass, Droplet, CloudRain } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	import { GpsPopup } from './GPSCoordinatesMapsPopup';
	import { onDestroy } from 'svelte';
	import { CatchmentPopup } from './CatchmentPopup';
	import WeatherPopup from './WeatherPopup.svelte';
	import mapboxgl from 'mapbox-gl';
	import { Button } from '$lib/components/ui/button';
	import '../styles/popups.css';

	let contextMenuPosition: { lat: number; lng: number } | null = null;
	let contextMenuOpen = false;
	let popup: mapboxgl.Popup | null = null;
	let isClosing = false; // Flag to prevent recursion
	let popupCloseHandler: (() => void) | null = null;
	let rightMouseDownTime: number | null = null;
	let rightMouseDownPoint: { x: number; y: number } | null = null;
	let hasMovedAfterRightClick = false;
	let isRightMouseButtonDown = false;
	let mouseDownHandler: ((e: any) => void) | null = null;
	let mouseMoveHandler: ((e: any) => void) | null = null;
	let mouseUpHandler: ((e: any) => void) | null = null;
	let dragStartHandler: (() => void) | null = null;
	let dragEndHandler: (() => void) | null = null;

	function showCoordinatesMaps() {
		if ($map && contextMenuPosition) {
			const popupInstance = new GpsPopup($map);
			popupInstance.showCoordinatesAt(contextMenuPosition);
			closePopup();
		}
	}

	function calculateCatchment() {
		if ($map && contextMenuPosition) {
			const popupInstance = new CatchmentPopup($map);
			popupInstance.calculateCatchment(contextMenuPosition);
			closePopup();
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
			
			closePopup();
		}
	}

	function copyCoordinates() {
		if (contextMenuPosition) {
			try {
				navigator.clipboard.writeText(
					`${contextMenuPosition.lat.toFixed(6)}, ${contextMenuPosition.lng.toFixed(6)}`
				);
				closePopup();
			} catch (error) {
				console.error('Failed to copy coordinates:', error);
			}
		}
	}

	function closePopup() {
		// Prevent recursion
		if (isClosing) return;
		isClosing = true;
		
		try {
			if (popup) {
				// Remove event listeners before removing the popup
				if (popupCloseHandler) {
					popup.off('close', popupCloseHandler);
					popupCloseHandler = null;
				}
				popup.remove();
				popup = null;
			}
		} catch (error) {
			console.error('Error closing popup:', error);
		} finally {
			contextMenuPosition = null;
			contextMenuOpen = false;
			isClosing = false;
		}
	}

	function handleContextMenu(e: any) {
		try {
			// Don't show context menu if user was dragging after right-click
			if (hasMovedAfterRightClick) {
				// Reset flags
				hasMovedAfterRightClick = false;
				rightMouseDownPoint = null;
				rightMouseDownTime = null;
				isRightMouseButtonDown = false;
				e.preventDefault();
				return;
			}
			
			// Also check if there was significant movement between mousedown and contextmenu
			if (rightMouseDownPoint && rightMouseDownTime && e.originalEvent) {
				const timeDiff = Date.now() - rightMouseDownTime;
				const dx = e.originalEvent.clientX - rightMouseDownPoint.x;
				const dy = e.originalEvent.clientY - rightMouseDownPoint.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				// If moved more than 5 pixels or more than 100ms has passed (likely a drag), don't show menu
				if (distance > 5 || timeDiff > 100) {
					hasMovedAfterRightClick = false;
					rightMouseDownPoint = null;
					rightMouseDownTime = null;
					isRightMouseButtonDown = false;
					e.preventDefault();
					return;
				}
			}
			
			// Reset flags for non-drag right-clicks
			rightMouseDownPoint = null;
			rightMouseDownTime = null;
			isRightMouseButtonDown = false;
			
			e.preventDefault();
			
			// Remove any existing popup
			closePopup();
			
			contextMenuPosition = {
				lat: e.lngLat.lat,
				lng: e.lngLat.lng
			};
			contextMenuOpen = true;
			
			// Create a new popup
			if ($map) {
				const container = document.createElement('div');
				popup = new mapboxgl.Popup({
					closeButton: true,
					className: 'coordinates-popup',
					focusAfterOpen: false
				})
					.setLngLat([contextMenuPosition.lng, contextMenuPosition.lat])
					.setDOMContent(container)
					.addTo($map);
					
				// Render the popup content
				const coordinatesDiv = document.createElement('div');
				coordinatesDiv.className = 'px-2 py-1.5 text-sm font-mono border-b mb-1 flex items-center';
				
				const compassIcon = document.createElement('div');
				compassIcon.className = 'mr-1.5 shrink-0';
				compassIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
				
				const coordsSpan = document.createElement('span');
				coordsSpan.textContent = `${contextMenuPosition.lat.toFixed(6)}°, ${contextMenuPosition.lng.toFixed(6)}°`;
				
				coordinatesDiv.appendChild(compassIcon);
				coordinatesDiv.appendChild(coordsSpan);
				container.appendChild(coordinatesDiv);
				
				// Add buttons to container
				const buttonContainer = document.createElement('div');
				buttonContainer.className = 'flex flex-col gap-1 p-1';
				
				// Copy coordinates button
				const copyBtn = document.createElement('button');
				copyBtn.className = 'flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground';
				copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> ${$_('menu.copy_coordinates')}`;
				copyBtn.addEventListener('click', copyCoordinates);
				buttonContainer.appendChild(copyBtn);
				
				// Show coordinates maps button
				const mapsBtn = document.createElement('button');
				mapsBtn.className = 'flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground';
				mapsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg> ${$_('menu.show_coordinates_maps')}`;
				mapsBtn.addEventListener('click', showCoordinatesMaps);
				buttonContainer.appendChild(mapsBtn);
				
				// Calculate catchment button
				const catchmentBtn = document.createElement('button');
				catchmentBtn.className = 'flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground';
				catchmentBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M12 22a8 8 0 0 0 8-8c0-5-8-13-8-13S4 9 4 14a8 8 0 0 0 8 8z"/></svg> ${$_('menu.calculate_catchment')}`;
				catchmentBtn.addEventListener('click', calculateCatchment);
				buttonContainer.appendChild(catchmentBtn);
				
				// Weather forecast button
				const weatherBtn = document.createElement('button');
				weatherBtn.className = 'flex w-full items-center rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground';
				weatherBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg> ${$_('menu.weather_forecast')}`;
				weatherBtn.addEventListener('click', showWeatherForecast);
				buttonContainer.appendChild(weatherBtn);
				
				container.appendChild(buttonContainer);
				
				// Add mouseleave handler to close popup when mouse moves away
				const popupElement = container.parentElement;
				if (popupElement) {
					popupElement.addEventListener('mouseleave', () => {
						// Add a small delay to prevent accidental closes
						setTimeout(() => {
							if (popup && !popupElement.matches(':hover')) {
								closePopup();
							}
						}, 100);
					});
				}
				
				// Fix accessibility issues with the close button
				setTimeout(() => {
					try {
						const closeButton = container.parentElement?.querySelector('.mapboxgl-popup-close-button');
						if (closeButton) {
							closeButton.removeAttribute('aria-hidden');
							closeButton.setAttribute('aria-label', 'Close location details');
						}
					} catch (err) {
						console.error('Error fixing close button accessibility:', err);
					}
				}, 0);
				
				// Handle popup close
				popupCloseHandler = () => {
					// Only set the state variables, don't call closePopup to avoid recursion
					contextMenuPosition = null;
					contextMenuOpen = false;
					popup = null;
					popupCloseHandler = null;
				};
				
				popup.on('close', popupCloseHandler);
			}
		} catch (error) {
			console.error('Error handling context menu:', error);
		}
	}

	$: if ($map) {
		// Add event listeners
		$map.on('contextmenu', handleContextMenu);
		
		// Track right-click and drag to prevent context menu during drag
		mouseDownHandler = (e: any) => {
			// Check if right mouse button (button 2)
			if (e.originalEvent && e.originalEvent.button === 2) {
				isRightMouseButtonDown = true;
				rightMouseDownPoint = {
					x: e.originalEvent.clientX,
					y: e.originalEvent.clientY
				};
				rightMouseDownTime = Date.now();
				hasMovedAfterRightClick = false;
			} else {
				// Reset if other button is pressed
				isRightMouseButtonDown = false;
				rightMouseDownPoint = null;
				rightMouseDownTime = null;
			}
		};
		
		mouseMoveHandler = (e: any) => {
			// Only track movement if right mouse button is currently down
			if (isRightMouseButtonDown && rightMouseDownPoint && e.originalEvent) {
				const dx = e.originalEvent.clientX - rightMouseDownPoint.x;
				const dy = e.originalEvent.clientY - rightMouseDownPoint.y;
				// If mouse moved more than 5 pixels, consider it a drag
				const distance = Math.sqrt(dx * dx + dy * dy);
				if (distance > 5) {
					hasMovedAfterRightClick = true;
				}
			}
		};
		
		mouseUpHandler = (e: any) => {
			// Check if right mouse button was released
			if (e.originalEvent && e.originalEvent.button === 2) {
				isRightMouseButtonDown = false;
			}
		};
		
		// Also track map drag events which fire when the map is being dragged
		dragStartHandler = () => {
			// If drag starts while right mouse button is down, it's a right-click drag
			if (isRightMouseButtonDown) {
				hasMovedAfterRightClick = true;
			}
		};
		
		dragEndHandler = () => {
			// No need to reset here, handleContextMenu will handle cleanup
		};
		
		$map.on('mousedown', mouseDownHandler);
		$map.on('mousemove', mouseMoveHandler);
		$map.on('mouseup', mouseUpHandler);
		$map.on('dragstart', dragStartHandler);
		$map.on('dragend', dragEndHandler);
	}

	onDestroy(() => {
		try {
			// Remove event listeners when component is destroyed
			if ($map) {
				$map.off('contextmenu', handleContextMenu);
				if (mouseDownHandler) {
					$map.off('mousedown', mouseDownHandler);
					mouseDownHandler = null;
				}
				if (mouseMoveHandler) {
					$map.off('mousemove', mouseMoveHandler);
					mouseMoveHandler = null;
				}
				if (mouseUpHandler) {
					$map.off('mouseup', mouseUpHandler);
					mouseUpHandler = null;
				}
				if (dragStartHandler) {
					$map.off('dragstart', dragStartHandler);
					dragStartHandler = null;
				}
				if (dragEndHandler) {
					$map.off('dragend', dragEndHandler);
					dragEndHandler = null;
				}
				if (popup && popupCloseHandler) {
					// Remove event listener first
					popup.off('close', popupCloseHandler);
					// Just set to null instead of removing to avoid triggering the close event again
					popup = null;
					popupCloseHandler = null;
				}
			}
		} catch (error) {
			console.error('Error cleaning up component:', error);
		}
	});
</script>
