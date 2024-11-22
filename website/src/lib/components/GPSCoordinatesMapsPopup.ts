import type { Map } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import GpsCoordinatesMapsPopup from './GPSCoordinatesMapsPopup.svelte';

export class GpsPopup {
    private static currentPopup: mapboxgl.Popup | null = null;
    private map: Map;

    constructor(map: Map) {
        this.map = map;
    }

    showCenterCoordinates() {
        // Close existing popup if it exists
        if (GpsPopup.currentPopup) {
            GpsPopup.currentPopup.remove();
        }

        const center = this.map.getCenter();
        const container = document.createElement('div');
        
        new GpsCoordinatesMapsPopup({
            target: container,
            props: {
                coordinates: {
                    lat: center.lat,
                    lng: center.lng
                }
            }
        });

        GpsPopup.currentPopup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '400px',
            className: 'accessible-popup'
        })
            .setLngLat(center)
            .setDOMContent(container)
            .addTo(this.map);

        const closeButton = container.parentElement?.querySelector('.mapboxgl-popup-close-button');
        if (closeButton) {
            closeButton.removeAttribute('aria-hidden');
            closeButton.setAttribute('aria-label', 'Close location details');
        }
    }
}