import type { GPXFile } from "gpx";
import { map, selectFiles, currentTool, Tool } from "$lib/stores";
import { get, type Writable } from "svelte/store";
import type mapboxgl from "mapbox-gl";

let id = 0;
function getLayerId() {
    return `gpx-${id++}`;
}

let defaultWeight = 6;
let defaultOpacity = 1;

const colors = [
    '#ff0000',
    '#0000ff',
    '#46e646',
    '#00ccff',
    '#ff9900',
    '#ff00ff',
    '#ffff32',
    '#288228',
    '#9933ff',
    '#50f0be',
    '#8c645a'
];

const colorCount: { [key: string]: number } = {};
for (let color of colors) {
    colorCount[color] = 0;
}

// Get the color with the least amount of uses
function getColor() {
    let color = colors.reduce((a, b) => (colorCount[a] <= colorCount[b] ? a : b));
    colorCount[color]++;
    return color;
}

function decrementColor(color: string) {
    colorCount[color]--;
}

export class GPXLayer {
    map: mapboxgl.Map;
    file: Writable<GPXFile>;
    layerId: string;
    layerColor: string;
    unsubscribe: () => void;

    constructor(map: mapboxgl.Map, file: Writable<GPXFile>) {
        this.map = map;
        this.file = file;
        this.layerId = getLayerId();
        this.layerColor = getColor();
        this.unsubscribe = file.subscribe(this.updateData.bind(this));

        get(this.file)._data = {
            layerId: this.layerId,
            layerColor: this.layerColor
        };

        this.add();
        this.map.on('style.load', this.add.bind(this));
    }

    add() {
        if (!this.map.getSource(this.layerId)) {
            let data = this.getGeoJSON();

            this.map.addSource(this.layerId, {
                type: 'geojson',
                data
            });
        }

        if (!this.map.getLayer(this.layerId)) {
            this.map.addLayer({
                id: this.layerId,
                type: 'line',
                source: this.layerId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': ['get', 'weight'],
                    'line-opacity': ['get', 'opacity']
                }
            });

            this.map.on('click', this.layerId, this.selectOnClick.bind(this));
            this.map.on('mouseenter', this.layerId, toPointerCursor);
            this.map.on('mouseleave', this.layerId, toDefaultCursor);
        }
    }

    updateData() {
        let source = this.map.getSource(this.layerId);
        if (source) {
            source.setData(this.getGeoJSON());
        }
    }

    remove() {
        this.map.off('click', this.layerId, this.selectOnClick.bind(this));
        this.map.off('mouseenter', this.layerId, toPointerCursor);
        this.map.off('mouseleave', this.layerId, toDefaultCursor);
        this.map.off('style.load', this.add.bind(this));

        this.map.removeLayer(this.layerId);
        this.map.removeSource(this.layerId);

        this.unsubscribe();

        decrementColor(this.layerColor);
    }

    moveToFront() {
        this.map.moveLayer(this.layerId);
    }

    selectOnClick(e: any) {
        if (get(currentTool) === Tool.ROUTING) {
            return;
        }
        if (e.originalEvent.shiftKey) {
            get(selectFiles).addSelect(get(this.file));
        } else {
            get(selectFiles).select(get(this.file));
        }
    }

    getGeoJSON(): GeoJSON.FeatureCollection {
        let data = get(this.file).toGeoJSON();
        for (let feature of data.features) {
            if (!feature.properties) {
                feature.properties = {};
            }
            if (!feature.properties.color) {
                feature.properties.color = this.layerColor;
            }
            if (!feature.properties.weight) {
                feature.properties.weight = defaultWeight;
            }
            if (!feature.properties.opacity) {
                feature.properties.opacity = defaultOpacity;
            }
        }
        return data;
    }
}

function toPointerCursor() {
    get(map).getCanvas().style.cursor = 'pointer';
}

function toDefaultCursor() {
    get(map).getCanvas().style.cursor = '';
}