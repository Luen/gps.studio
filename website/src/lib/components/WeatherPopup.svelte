<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { 
		Cloud, 
		CloudRain, 
		Sun, 
		Wind, 
		AlertTriangle, 
		Search, 
		CloudLightning, 
		Thermometer, 
		CloudFog,
		CloudDrizzle,
		CloudSnow,
		Cloudy,
		SunDim,
		SunMedium,
		CloudSun,
		Moon,
		MoonStar,
		CloudMoon
	} from 'lucide-svelte';
	import { map as mapStore } from '$lib/stores';

	export let coordinates: { lng: number; lat: number };
	export let onClose: () => void = () => {};

	type WeatherStatus = 'input' | 'loading' | 'error' | 'success';
	
	interface SearchResponse {
		metadata: {
			response_timestamp: string;
		};
		data: Array<{
			geohash: string;
			id: string;
			name: string;
			postcode: string;
			state: string;
		}>;
	}

	interface LocationInformationResponse {
		metadata: {
			response_timestamp: string;
		};
		data: {
			geohash: string;
			timezone: string;
			latitude: number;
			longitude: number;
			marine_area_id?: string;
			tidal_point?: string;
			id: string;
			name: string;
			state: string;
		};
	}

	interface ForecastItem {
		rain: {
			amount: {
				min?: number;
				max?: number;
				units?: string;
			};
			chance?: number;
		};
		uv: {
			category?: string;
			end_time?: string;
			max_index?: number;
			start_time: string;
		};
		now?: {
			is_night: boolean;
			now_label: string;
			later_label: string;
			temp_now: number;
			temp_later: number;
		};
		astronomical?: {
			sunrise_time: string;
			sunset_time: string;
		};
		date: string;
		temp_max?: number;
		temp_min?: number;
		extended_text: string;
		icon_descriptor: string;
		short_text: string;
		fire_danger?: string;
	}

	interface ForecastResponse {
		data: Array<ForecastItem>;
		metadata: {
			response_timestamp: string;
			issue_time: string;
			forecast_region: string;
			forecast_type: string;
		};
	}

	interface ObservationResponse {
		metadata: {
			response_timestamp: string;
			issue_time: string;
		};
		data: {
			temp?: number;
			temp_feels_like?: number;
			rain_since_9am?: number;
			humidity?: number;
			wind?: {
				speed_kilometre?: number;
				speed_knot?: number;
				direction?: string;
			};
			gust?: {
				speed_kilometre?: number;
				speed_knot?: number;
			};
			station?: {
				bom_id: string;
				name: string;
				distance: number;
			};
		};
	}

	let status: WeatherStatus = 'input';
	let searchInput = '';
	let searchResults: SearchResponse['data'] = [];
	let selectedLocation: LocationInformationResponse['data'] | null = null;
	let forecast: ForecastResponse | null = null;
	let observations: ObservationResponse | null = null;
	let error: string | null = null;
	let searching = false;

	// Variables to track which forecast view is active
	let viewMode: 'daily' | 'hourly' = 'daily';
	let hourlyForecast: any = null;

	onMount(() => {
		// Auto-search based on coordinates
		searchByCoordinates();
		
		// Setup Mapbox popup close listener and fix accessibility
		const popupElement = document.querySelector('.mapboxgl-popup');
		if (popupElement) {
			const closeButton = popupElement.querySelector('.mapboxgl-popup-close-button');
			if (closeButton) {
				// Fix the accessibility issue by removing aria-hidden attribute
				closeButton.removeAttribute('aria-hidden');
				
				// Make sure button is properly labeled
				if (!closeButton.getAttribute('aria-label')) {
					closeButton.setAttribute('aria-label', 'Close weather popup');
				}
				
				closeButton.addEventListener('click', handleClose);
				console.log("Added close button listener and fixed accessibility");
			}
		}
	});

	// Helper function to format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-AU', { 
			weekday: 'short', 
			day: 'numeric', 
			month: 'short' 
		});
	}

	// Helper function to format time
	function formatTime(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleTimeString('en-AU', { 
			hour: '2-digit', 
			minute: '2-digit',
			hour12: true 
		});
	}

	// Mapping function to convert BOM weather icon descriptors to Lucide icons
	function getWeatherIcon(descriptor: string) {
		if (!descriptor) return Cloud;
		
		// Simple mapping based on common BOM descriptors
		switch (descriptor.toLowerCase()) {
			case 'sunny':
			case 'mostly_sunny':
				return Sun;
			case 'partly_cloudy':
			case 'partly_sunny':
				return CloudSun;
			case 'cloudy':
			case 'mostly_cloudy':
				return Cloud;
			case 'overcast':
				return Cloudy;
			case 'light_rain':
			case 'drizzle':
				return CloudDrizzle;
			case 'rain':
			case 'heavy_rain':
			case 'heavy_showers':
				return CloudRain;
			case 'thunderstorm':
			case 'storm':
				return CloudLightning;
			case 'fog':
			case 'mist':
				return CloudFog;
			case 'frost':
			case 'snow':
			case 'snow_and_rain':
				return CloudSnow;
			case 'hail':
				return CloudSnow;
			case 'windy':
			case 'dust':
				return Wind;
			case 'clear':
			case 'fine':
				return Sun;
			case 'night_clear':
			case 'night_fine':
				return Moon;
			case 'night_mostly_fine':
			case 'night_partly_cloudy':
				return MoonStar;
			case 'night_cloudy':
			case 'night_mostly_cloudy':
				return CloudMoon;
			default:
				// Fall back to generic cloud for unknown descriptors
				return Cloud;
		}
	}

	// Function to search for locations using BOM API
	async function searchLocations() {
		if (searchInput.length < 3) {
			error = "Search term must be at least 3 characters";
			return;
		}
		
		try {
			searching = true;
			error = null;
			
			const response = await fetch(`https://api.weather.bom.gov.au/v1/locations?search=${encodeURIComponent(searchInput)}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!response.ok) {
				throw new Error(`Search failed: ${response.statusText}`);
			}
			
			const data: SearchResponse = await response.json();
			searchResults = data.data;
			
			if (searchResults.length === 0) {
				error = "No locations found matching your search";
			}
			
		} catch (e) {
			console.error("Error searching locations:", e);
			error = e instanceof Error ? e.message : "Error searching for locations";
		} finally {
			searching = false;
		}
	}

	// Try to determine a nearby city or location for better search results
	async function searchNearbyCity() {
		try {
			const lat = coordinates.lat;
			const lng = coordinates.lng;
			
			// Use MapBox's reverse geocoding service to get a nearby city or place
			// This would require your MapBox token, which should be available via the map store
			if ($mapStore) {
				const mapboxToken = ($mapStore as any)._accessToken;
				if (mapboxToken) {
					const response = await fetch(
						`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=place,locality`
					);
					
					if (response.ok) {
						const data = await response.json();
						if (data.features && data.features.length > 0) {
							// Get the place name from the first result
							const placeName = data.features[0].text || data.features[0].place_name;
							if (placeName) {
								console.log("Found nearby place:", placeName);
								return placeName;
							}
						}
					}
				}
			}
			
			// Fallback: Just return the coordinates
			return `${lat.toFixed(2)},${lng.toFixed(2)}`;
		} catch (e) {
			console.error("Error finding nearby city:", e);
			return `${coordinates.lat.toFixed(2)},${coordinates.lng.toFixed(2)}`;
		}
	}

	// Search by coordinates
	async function searchByCoordinates() {
		try {
			status = 'loading';
			error = null;
			
			// First try to find a nearby city or place name for better search results
			const searchTerm = await searchNearbyCity();
			searchInput = searchTerm;
			
			console.log("Searching with term:", searchTerm);
			
			// Try to search with the place name first
			await searchLocations();
			
			// If no results, try with broader search terms
			if (searchResults.length === 0) {
				// Try with just the state/region if available
				if (searchTerm.includes(",")) {
					const state = searchTerm.split(",")[1]?.trim();
					if (state && state.length >= 3) {
						searchInput = state;
						await searchLocations();
					}
				}
				
				// If still no results, fall back to country
				if (searchResults.length === 0) {
					searchInput = "Australia"; // Fallback
					await searchLocations();
				}
			}
			
			if (searchResults.length > 0) {
				// Find closest location by calculating distance to each result
				let closestLocation = searchResults[0];
				let shortestDistance = Number.MAX_VALUE;
				
				const lat = coordinates.lat;
				const lng = coordinates.lng;
				
				searchResults.forEach(location => {
					// Convert location's geohash to lat/lng - simple approximation using available coordinates
					// In a full implementation, you'd decode the geohash properly
					if (location.geohash) {
						const locationData = getLocationFromGeohash(location);
						if (locationData) {
							const distance = calculateDistance(
								lat, lng, 
								locationData.latitude, locationData.longitude
							);
							
							if (distance < shortestDistance) {
								shortestDistance = distance;
								closestLocation = location;
							}
						}
					}
				});
				
				// Select the closest location
				await selectLocation(closestLocation);
			} else {
				status = 'input';
			}
		} catch (e) {
			console.error("Error searching by coordinates:", e);
			status = 'error';
			error = e instanceof Error ? e.message : "Error searching by coordinates";
		}
	}

	// Helper to get lat/lng from location data
	function getLocationFromGeohash(location: any) {
		// For BOM API, we can directly use the info from the search response
		if (location.geohash) {
			return {
				// These are approximate values based on the search results
				latitude: parseFloat(location.name.split(',')[0]) || -25.0, // Default to central Australia
				longitude: parseFloat(location.name.split(',')[1]) || 135.0
			};
		}
		return null;
	}

	// Calculate distance between two points using Haversine formula
	function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
		const R = 6371; // Radius of the earth in km
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		const d = R * c; // Distance in km
		return d;
	}

	function deg2rad(deg: number) {
		return deg * (Math.PI/180);
	}

	// Function to get hourly forecast
	async function getHourlyForecast() {
		if (!selectedLocation) return;
		
		try {
			console.log("Starting hourly forecast request");
			// Clear any previous errors
			error = null;
			
			// Get the geohash from the selected location
			const geohash = selectedLocation.geohash;
			console.log("Location geohash:", geohash);
			
			if (!geohash || geohash.length < 5) {
				console.error("Invalid geohash:", geohash);
				throw new Error("Invalid geohash for hourly forecast");
			}

			// The BOM API requires the full geohash for the hourly forecasts endpoint
			const hourlyResponse = await fetch(`https://api.weather.bom.gov.au/v1/locations/${geohash}/forecasts/hourly`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (hourlyResponse.ok) {
				const hourlyData = await hourlyResponse.json();
				console.log("Successfully received hourly forecast data");
				hourlyForecast = hourlyData;
				viewMode = 'hourly';
			} else {
				console.error("Failed to get hourly forecast:", hourlyResponse.status, hourlyResponse.statusText);
				throw new Error(`Hourly forecast unavailable: ${hourlyResponse.statusText}`);
			}
		} catch (e) {
			console.error("Failed to get hourly forecast:", e);
			error = "Unable to load hourly forecast for this location. Please try a different location or use the daily forecast.";
			// Show the error to the user, but stay in the current view
		}
	}

	// Function to switch back to daily view
	function showDailyForecast() {
		viewMode = 'daily';
	}

	// Function to get location details when a location is selected
	async function selectLocation(location: SearchResponse['data'][0]) {
		try {
			status = 'loading';
			error = null;
			
			// Make sure we're using exactly 6 characters of the geohash
			// The BOM API requires exactly 6 characters
			const validGeohash = location.geohash.substring(0, 6);
			
			// Get location information
			const locationResponse = await fetch(`https://api.weather.bom.gov.au/v1/locations/${validGeohash}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!locationResponse.ok) {
				throw new Error(`Failed to get location info: ${locationResponse.statusText}`);
			}
			
			const locationData: LocationInformationResponse = await locationResponse.json();
			selectedLocation = locationData.data;
			
			// Get forecast data
			const forecastResponse = await fetch(`https://api.weather.bom.gov.au/v1/locations/${validGeohash}/forecasts/daily`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!forecastResponse.ok) {
				throw new Error(`Failed to get forecast: ${forecastResponse.statusText}`);
			}
			
			const forecastData: ForecastResponse = await forecastResponse.json();
			forecast = forecastData;
			
			// Get current observations
			const observationsResponse = await fetch(`https://api.weather.bom.gov.au/v1/locations/${validGeohash}/observations`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!observationsResponse.ok) {
				throw new Error(`Failed to get observations: ${observationsResponse.statusText}`);
			}
			
			const observationsData: ObservationResponse = await observationsResponse.json();
			observations = observationsData;
			
			status = 'success';
			
		} catch (e) {
			console.error("Error getting weather data:", e);
			status = 'error';
			error = e instanceof Error ? e.message : "Error getting weather data";
		}
	}

	// Function to reset the form
	function resetSearch() {
		status = 'input';
		selectedLocation = null;
		forecast = null;
		observations = null;
		error = null;
	}

	// Function to handle closing the popup
	function handleClose() {
		// Call parent onClose handler
		onClose();
	}
</script>

<div class="p-2 text-sm bg-background rounded-md shadow-md border border-border">
	<div class="flex items-center justify-between border-b pb-2 mb-2">
		<h3 class="text-lg font-semibold flex items-center">
			<CloudRain size="18" class="mr-2" />
			Weather Forecast
		</h3>
	</div>

	{#if status === 'input'}
		<div class="space-y-3">
			<p class="text-sm">Search for a location to view the weather forecast:</p>
			
			<div class="text-xs text-muted-foreground mb-2">
				Current map coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
			</div>
			
			<div class="space-y-2">
				<div class="flex flex-row gap-2">
					<input 
						type="text" 
						bind:value={searchInput}
						placeholder="Enter location (min 3 characters)"
						class="flex-1 px-2 py-1 bg-muted border border-border rounded-sm text-sm"
					/>
					<button 
						class="px-3 py-1 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors"
						on:click={searchLocations}
						disabled={searchInput.length < 3 || searching}
					>
						{#if searching}
							<div class="animate-spin h-4 w-4 border-2 border-muted rounded-full border-t-primary-foreground"></div>
						{:else}
							<Search size="16" />
						{/if}
					</button>
				</div>
				
				{#if error}
					<div class="text-xs text-destructive">{error}</div>
				{/if}
				
				{#if searchResults.length > 0}
					<div class="mt-3 border rounded-sm max-h-40 overflow-auto">
						<ul class="divide-y divide-border">
							{#each searchResults as location}
								<li>
									<button 
										class="w-full px-2 py-1.5 text-left hover:bg-accent/50 transition-colors"
										on:click={() => selectLocation(location)}
									>
										<div class="font-medium">{location.name}</div>
										<div class="text-xs text-muted-foreground">
											{location.state}
											{location.postcode && location.postcode !== 'null' ? `, ${location.postcode}` : ''}
										</div>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
			
			<div class="text-xs text-muted-foreground mt-2">
				<p>Data provided by the Australian Bureau of Meteorology</p>
			</div>
		</div>
	{:else if status === 'loading'}
		<div class="flex flex-col items-center justify-center py-6">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
			<p>Loading weather data...</p>
		</div>
	{:else if status === 'error'}
		<div class="flex flex-col items-center justify-center py-6 text-destructive">
			<AlertTriangle size="24" class="mb-2" />
			<p>Error loading weather data:</p>
			<p class="text-xs mt-2">{error}</p>
			<button 
				class="mt-4 px-4 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-md text-xs"
				on:click={resetSearch}
			>
				Try Again
			</button>
		</div>
	{:else if selectedLocation && forecast && observations}
		<div class="space-y-4">
			<div class="flex justify-between items-start">
				<div>
					<h4 class="font-medium text-base">
						{selectedLocation.name}
						{selectedLocation.state ? `, ${selectedLocation.state}` : ''}
					</h4>
					<div class="text-xs text-muted-foreground">
						{observations.metadata.issue_time ? formatDate(observations.metadata.issue_time) + ' ' + formatTime(observations.metadata.issue_time) : 'Data unavailable'}
					</div>
				</div>
				<button 
					class="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-sm"
					on:click={resetSearch}
				>
					Change Location
				</button>
			</div>
			
			<!-- Current observations -->
			{#if observations.data && observations.data.temp !== undefined}
				<div class="bg-muted/30 p-3 rounded-md">
					<div class="flex items-center justify-between">
						<div>
							<div class="text-xl font-medium">{observations.data.temp}°C</div>
							{#if observations.data.temp_feels_like !== undefined}
								<div class="text-xs">Feels like {observations.data.temp_feels_like}°C</div>
							{/if}
						</div>
						
						<div class="text-right">
							{#if observations.data.humidity !== undefined}
								<div class="text-xs">Humidity: {observations.data.humidity}%</div>
							{/if}
							{#if observations.data.wind && observations.data.wind.speed_kilometre !== undefined}
								<div class="text-xs flex items-center justify-end">
									<Wind size={14} class="mr-1" />
									{observations.data.wind.speed_kilometre} km/h {observations.data.wind.direction || ''}
								</div>
							{/if}
						</div>
					</div>
					
					{#if observations.data.station}
						<div class="text-xs mt-2 text-muted-foreground">
							Station: {observations.data.station.name} ({(observations.data.station.distance / 1000).toFixed(1)} km away)
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Daily forecast -->
			{#if forecast.data && forecast.data.length > 0}
				<div>
					<div class="flex justify-between items-center mb-2">
						<h5 class="font-medium">Forecast</h5>
						<div class="view-toggle">
							<button 
								class="{viewMode === 'daily' ? 'active' : ''}"
								on:click={showDailyForecast}
								aria-pressed={viewMode === 'daily'}
							>
								Daily
							</button>
							<button 
								class="{viewMode === 'hourly' ? 'active' : ''}"
								on:click={getHourlyForecast}
								aria-pressed={viewMode === 'hourly'}
							>
								Hourly
							</button>
						</div>
					</div>
					
					{#if viewMode === 'daily' && forecast.data.length > 0}
						<div class="forecast-container">
							<h3 class="forecast-title">{$_('menu.weather_forecast')}</h3>
							<div class="forecast-list">
								{#each forecast.data as day}
									<div class="forecast-day">
										<div class="forecast-date">{formatDate(day.date)}</div>
										<div class="forecast-icon">
											<svelte:component this={getWeatherIcon(day.icon_descriptor)} size={20} />
										</div>
										<div class="forecast-temp">
											{#if day.temp_max !== null && day.temp_max !== undefined}
												<span class="temp-max">{day.temp_max}°</span>
											{/if}
											{#if day.temp_min !== null && day.temp_min !== undefined}
												<span class="temp-min">{day.temp_min}°</span>
											{/if}
										</div>
										<div class="forecast-text">
											{#if day.short_text && day.short_text !== "null"}
												{day.short_text}
											{:else if day.rain && day.rain.chance !== null}
												{day.rain.chance}% {$_('menu.chance_of_rain')}
											{:else}
												-
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else if viewMode === 'hourly' && hourlyForecast && hourlyForecast.data}
						<div class="forecast-container">
							<h3 class="forecast-title">{$_('menu.hourly_forecast')}</h3>
							<div class="forecast-list hourly-list">
								{#each hourlyForecast.data as hour}
									<div class="forecast-hour">
										<div class="forecast-time">{formatTime(hour.time)}</div>
										<div class="forecast-icon">
											<svelte:component this={getWeatherIcon(hour.icon_descriptor)} size={20} />
										</div>
										<div class="forecast-temp">
											{#if hour.temp !== null && hour.temp !== undefined}
												<span class="temp-current">{hour.temp}°</span>
											{/if}
										</div>
										<div class="forecast-text">
											{#if hour.short_text && hour.short_text !== "null"}
												{hour.short_text}
											{:else if hour.rain && hour.rain.chance !== null}
												{hour.rain.chance}% {$_('menu.chance_of_rain')}
											{:else}
												-
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="p-3 bg-muted/20 rounded-md text-center">
							<p class="text-xs text-muted-foreground">
								{#if error}
									{error}
								{:else}
									Unable to load hourly forecast for this location.
								{/if}
							</p>
							<button
								class="mt-2 button-small"
								on:click={showDailyForecast}
							>
								Show Daily Forecast
							</button>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Rain chance -->
			{#if forecast.data && forecast.data[0] && forecast.data[0].rain}
				<div class="bg-primary/10 p-2 rounded-md">
					<div class="flex items-start">
						<CloudRain size={16} class="mr-2 mt-0.5 text-primary" />
						<div>
							<div class="font-medium">Rain Forecast</div>
							<div class="text-sm">
								{#if forecast.data[0].rain.chance !== undefined}
									{forecast.data[0].rain.chance}% {$_('menu.chance_of_rain')} today
								{:else}
									No rain data available
								{/if}
								
								{#if forecast.data[0].rain.amount && (forecast.data[0].rain.amount.min !== undefined || forecast.data[0].rain.amount.max !== undefined)}
									<div class="text-xs">
										Expected amount: 
										{#if forecast.data[0].rain.amount.min !== undefined && forecast.data[0].rain.amount.max !== undefined}
											{forecast.data[0].rain.amount.min}-{forecast.data[0].rain.amount.max} {forecast.data[0].rain.amount.units}
										{:else if forecast.data[0].rain.amount.min !== undefined}
											{forecast.data[0].rain.amount.min}+ {forecast.data[0].rain.amount.units}
										{:else if forecast.data[0].rain.amount.max !== undefined}
											Up to {forecast.data[0].rain.amount.max} {forecast.data[0].rain.amount.units}
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="text-xs text-muted-foreground border-t pt-3 mt-3">
				<p>Data provided by the Australian Bureau of Meteorology (BOM)</p>
				<p>Updated: {forecast.metadata.issue_time ? formatDate(forecast.metadata.issue_time) + ' ' + formatTime(forecast.metadata.issue_time) : 'Unknown'}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.weather-popup) {
		max-width: 400px !important;
	}
	
	/* Add styles to prevent interference with Mapbox close button */
	:global(.mapboxgl-popup-close-button) {
		font-size: 16px !important;
		padding: 4px 8px !important;
		color: var(--muted-foreground) !important;
		border: none !important;
		background: transparent !important;
		cursor: pointer !important;
		position: absolute !important;
		right: 0 !important;
		top: 0 !important;
		outline: none !important;
	}
	
	:global(.mapboxgl-popup-close-button:hover) {
		color: var(--foreground) !important;
		background: transparent !important;
	}
	
	:global(.mapboxgl-popup-close-button:focus) {
		color: var(--foreground) !important;
		box-shadow: 0 0 0 2px var(--ring, rgba(59, 130, 246, 0.5)) !important;
		border-radius: 2px !important;
	}

	/* Weather forecast styling */
	.forecast-container {
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: var(--background-muted, #f5f5f5);
	}

	.forecast-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.forecast-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 20rem;
		overflow-y: auto;
	}

	.hourly-list {
		max-height: 18rem;
	}

	.forecast-day, .forecast-hour {
		display: grid;
		grid-template-columns: 4rem 2rem minmax(2.5rem, auto) 1fr;
		align-items: center;
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: var(--background, white);
	}

	.forecast-day:nth-child(odd), .forecast-hour:nth-child(odd) {
		background-color: var(--muted, #f0f0f0);
	}

	.forecast-date, .forecast-time {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.forecast-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 24px;
		height: 24px;
		color: var(--primary, #4a90e2);
	}

	.forecast-icon :global(svg) {
		width: 20px;
		height: 20px;
	}

	.forecast-temp {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.temp-max {
		font-weight: 600;
		font-size: 0.875rem;
	}

	.temp-min, .temp-current {
		font-size: 0.875rem;
	}

	.temp-min {
		color: var(--muted-foreground, #666);
	}

	.forecast-text {
		font-size: 0.75rem;
		padding-left: 0.5rem;
		color: var(--muted-foreground, #666);
		word-break: break-word;
	}

	/* View mode toggles */
	.view-toggle {
		display: flex;
		gap: 0.25rem;
		background-color: var(--background-muted, #f0f0f0);
		border-radius: 0.25rem;
		padding: 0.2rem;
		border: 1px solid var(--border, #ddd);
	}

	.view-toggle button {
		flex: 1;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border-radius: 0.25rem;
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
		min-width: 4rem;
		position: relative;
		z-index: 1;
	}

	.view-toggle button.active {
		background-color: var(--background, white);
		color: var(--foreground, #333);
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.view-toggle button:hover:not(.active) {
		background-color: rgba(255,255,255,0.5);
	}
	
	/* Small button for error states */
	.button-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border-radius: 0.25rem;
		background-color: var(--background-muted, #f5f5f5);
		border: 1px solid var(--border, #ddd);
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.button-small:hover {
		background-color: var(--hover, #eee);
	}
</style> 