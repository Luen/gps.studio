import type { Map } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import type { SvelteComponent } from 'svelte';
import CatchmentPopupComponent from './CatchmentPopup.svelte';

export class CatchmentPopup {
    private map: Map;
    private popup: mapboxgl.Popup | null = null;
    private popupComponent: SvelteComponent | null = null;

    constructor(map: Map) {
        this.map = map;
    }

    calculateCatchment(coordinates: { lat: number; lng: number }) {
        // Close existing popup if it exists
        if (this.popup) {
            this.popup.remove();
            this.popupComponent?.$destroy();
            this.popupComponent = null;
        }

        const container = document.createElement('div');
        
        this.popupComponent = new CatchmentPopupComponent({
            target: container,
            props: {
                coordinates: {
                    lat: coordinates.lat,
                    lng: coordinates.lng
                }
            }
        }) as SvelteComponent;

        this.popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '600px',
            className: 'accessible-popup catchment-popup'
        })
            .setLngLat(coordinates)
            .setDOMContent(container)
            .addTo(this.map);

        const closeButton = container.parentElement?.querySelector('.mapboxgl-popup-close-button');
        if (closeButton) {
            closeButton.removeAttribute('aria-hidden');
            closeButton.setAttribute('aria-label', 'Close catchment details');
        }
    }
} 