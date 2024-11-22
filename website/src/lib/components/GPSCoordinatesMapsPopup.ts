import type { Map } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import type { SvelteComponent } from 'svelte';
import GpsCoordinatesMapsPopupComponent from './GPSCoordinatesMapsPopup.svelte';

export class GpsPopup {
    private map: Map;
    private popup: mapboxgl.Popup | null = null;
    private popupComponent: SvelteComponent | null = null;

    constructor(map: Map) {
        this.map = map;
    }

    showCenterCoordinates() {
        // Close existing popup if it exists
        if (this.popup) {
            this.popup.remove();
            this.popupComponent?.$destroy();
            this.popupComponent = null;
        }

        const center = this.map.getCenter();
        const container = document.createElement('div');
        
        // @ts-expect-error - Svelte component constructor type mismatch
        this.popupComponent = new GpsCoordinatesMapsPopupComponent({
            target: container,
            props: {
                coordinates: {
                    lat: center.lat,
                    lng: center.lng
                }
            }
        });

        this.popup = new mapboxgl.Popup({
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
}import type { Map } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import GpsCoordinatesMapsPopup from './GPSCoordinatesMapsPopup.svelte';

export class GpsPopup {
    private map: Map;
    private popup: mapboxgl.Popup | null = null;

    constructor(map: Map) {
        this.map = map;
    }

    showCenterCoordinates() {
        // Close existing popup if it exists
        if (this.popup) {
            this.popup.remove();
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

        this.popup = new mapboxgl.Popup({
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