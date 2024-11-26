import { TramFront, Utensils, ShoppingBasket, Droplet, ShowerHead, Fuel, CircleParking, Fence, FerrisWheel, Bed, Mountain, Pickaxe, Store, TrainFront, Bus, Ship, Croissant, House, Tent, Wrench, Binoculars, Toilet } from 'lucide-static';
import { type StyleSpecification } from 'mapbox-gl';
import ignFrTopo from './custom/ign-fr-topo.json';
import ignFrPlan from './custom/ign-fr-plan.json';
import ignFrSatellite from './custom/ign-fr-satellite.json';
import bikerouterGravel from './custom/bikerouter-gravel.json';
import { LucideArrowDownZA, TabletSmartphone } from 'lucide-svelte';

export const basemaps: { [key: string]: string | StyleSpecification; } = {
    /*wsOutdoors: {
        version: 8,
        sources: {
            wsOutdoors: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/mapbox/topo/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>'
            }
        },
        layers: [{
            id: 'wsOutdoors',
            type: 'raster',
            source: 'wsOutdoors',
        }],
    },*/
    wsOutdoors: 'mapbox://styles/luenwarneke/cjzdctwa31lsp1ctbxj8mlei5',
    mapboxOutdoors: 'mapbox://styles/mapbox/outdoors-v12',
    //mapboxSatellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    mapboxSatellite: {
        version: 8,
        sources: {
            mapboxSatellite: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/mapbox/satellite/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>'
            }
        },
        layers: [{
            id: 'mapboxSatellite',
            type: 'raster',
            source: 'mapboxSatellite',
        }],
    },
    openStreetMap: {
        version: 8,
        sources: {
            openStreetMap: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'openStreetMap',
            type: 'raster',
            source: 'openStreetMap',
        }],
    },
    openTopoMap: {
        version: 8,
        sources: {
            openTopoMap: {
                type: 'raster',
                //tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
                //tiles: ['https://opentopomap.wanderstories.space/{z}/{x}/{y}.png'],
                tiles: ['https://tiles.wanderstories.space/opentopomap/{z}/{x}/{y}.png'],
                tileSize: 256,
                //maxzoom: 17,
                maxzoom: 16,
                attribution: '&copy; <a href="https://www.opentopomap.org" target="_blank">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'openTopoMap',
            type: 'raster',
            source: 'openTopoMap',
        }],
    },
    openHikingMap: {
        version: 8,
        sources: {
            openHikingMap: {
                type: 'raster',
                tiles: ['https://maps.refuges.info/hiking/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://wiki.openstreetmap.org/wiki/Hiking/mri" target="_blank">sly</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'openHikingMap',
            type: 'raster',
            source: 'openHikingMap',
        }],
    },
    cyclOSM: {
        version: 8,
        sources: {
            cyclOSM: {
                type: 'raster',
                tiles: ['https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 'https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 'https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'cyclOSM',
            type: 'raster',
            source: 'cyclOSM',
        }],
    },
    swisstopoRaster: {
        version: 8,
        sources: {
            swisstopoRaster: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'],
                tileSize: 128,
                maxzoom: 19,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoRaster',
            type: 'raster',
            source: 'swisstopoRaster',
        }],
    },
    swisstopoVector: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json',
    swisstopoSatellite: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json',
    linz: 'https://basemaps.linz.govt.nz/v1/tiles/topographic/EPSG:3857/style/topographic.json?api=d01fbtg0ar23gctac5m0jgyy2ds',
    linzTopo: {
        version: 8,
        sources: {
            linzTopo: {
                type: 'raster',
                tiles: ['https://tiles-cdn.koordinates.com/services;key=39a8b989633a4bef98bc0e065380454a/tiles/v4/layer=50767/EPSG:3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.linz.govt.nz/" target="_blank">LINZ</a>'
            }
        },
        layers: [{
            id: 'linzTopo',
            type: 'raster',
            source: 'linzTopo',
        }],
    },
    linzImagery: {
        version: 8,
        sources: {
            linzImagery: {
                type: 'raster',
                tiles: ['https://tiles-cdn.koordinates.com/services;key=39a8b989633a4bef98bc0e065380454a/tiles/v4/layer=50766/EPSG:3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.linz.govt.nz/" target="_blank">LINZ</a>'
            }
        },
        layers: [{
            id: 'linzImagery',
            type: 'raster',
            source: 'linzImagery',
        }],
    },
    ignBe: {
        version: 8,
        sources: {
            ignBe: {
                type: 'raster',
                tiles: ['https://cartoweb.wmts.ngi.be/1.0.0/topo/default/3857/{z}/{y}/{x}.png'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '© <a href="https://www.ngi.be/" target="_blank">IGN/NGI</a>'
            }
        },
        layers: [{
            id: 'ignBe',
            type: 'raster',
            source: 'ignBe',
        }],
    },
    ignFrPlan: ignFrPlan,
    ignFrTopo: ignFrTopo,
    ignFrScan25: {
        version: 8,
        sources: {
            ignFrScan25: {
                type: 'raster',
                tiles: ['https://data.geopf.fr/private/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR&FORMAT=image/jpeg&STYLE=normal&apikey=ign_scan_ws'],
                tileSize: 256,
                maxzoom: 16,
                attribution: 'IGN-F/Géoportail'
            }
        },
        layers: [{
            id: 'ignFrScan25',
            type: 'raster',
            source: 'ignFrScan25',
        }],
    },
    ignFrSatellite: ignFrSatellite,
    ignEs: {
        version: 8,
        sources: {
            ignEs: {
                type: 'raster',
                tiles: ['https://www.ign.es/wmts/mapa-raster?layer=MTN&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}'],
                tileSize: 256,
                maxzoom: 20,
                attribution: '&copy; <a href="https://www.ign.es" target="_blank">IGN</a>'
            }
        },
        layers: [{
            id: 'ignEs',
            type: 'raster',
            source: 'ignEs',
        }],
    },
    ignEsSatellite: {
        version: 8,
        sources: {
            ignEsSatellite: {
                type: 'raster',
                tiles: ['https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}'],
                tileSize: 256,
                maxzoom: 20,
                attribution: '&copy; <a href="https://www.ign.es" target="_blank">IGN</a>'
            }
        },
        layers: [{
            id: 'ignEsSatellite',
            type: 'raster',
            source: 'ignEsSatellite',
        }],
    },
    ordnanceSurvey: "https://api.os.uk/maps/vector/v1/vts/resources/styles?srs=3857&key=piCT8WysfuC3xLSUW7sGLfrAAJoYDvQz",
    norwayTopo: {
        version: 8,
        sources: {
            norwayTopo: {
                type: 'raster',
                tiles: ['https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png'],
                tileSize: 256,
                maxzoom: 20,
                attribution: '&copy; <a href="https://www.geonorge.no/" target="_blank">Geonorge</a>'
            }
        },
        layers: [{
            id: 'norwayTopo',
            type: 'raster',
            source: 'norwayTopo',
        }],
    },
    swedenTopo: {
        version: 8,
        sources: {
            swedenTopoWMTS: {
                type: 'raster',
                tiles: ['https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/1d54dd14-a28c-38a9-b6f3-b4ebfcc3c204/1.0.0/topowebb/default/3857/{z}/{y}/{x}.png'],
                tileSize: 256,
                maxzoom: 14,
                attribution: '&copy; <a href="https://www.lantmateriet.se" target="_blank">Lantmäteriet</a>'
            },
            swedenTopoWMS: {
                type: 'raster',
                tiles: ['https://minkarta.lantmateriet.se/map/topowebb?REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=false&LAYERS=topowebbkartan&TILED=true&MAP_RESOLUTION=180&WIDTH=512&HEIGHT=512&SRS=EPSG%3A3857&BBOX={bbox-epsg-3857}'],
                tileSize: 512,
                minzoom: 14,
                maxzoom: 20,
                attribution: '&copy; <a href="https://www.lantmateriet.se" target="_blank">Lantmäteriet</a>'
            }
        },
        layers: [{
            id: 'swedenTopoWMTS',
            type: 'raster',
            source: 'swedenTopoWMTS',
            maxzoom: 14
        }, {
            id: 'swedenTopoWMS',
            type: 'raster',
            source: 'swedenTopoWMS',
            minzoom: 14
        }],
    },
    swedenSatellite: {
        version: 8,
        sources: {
            swedenSatellite: {
                type: 'raster',
                tiles: ['https://minkarta.lantmateriet.se/map/ortofoto?REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=false&LAYERS=Ortofoto_0.5%2COrtofoto_0.4%2COrtofoto_0.25%2COrtofoto_0.16&TILED=true&MAP_RESOLUTION=180&WIDTH=512&HEIGHT=512&SRS=EPSG%3A3857&BBOX={bbox-epsg-3857}'],
                tileSize: 512,
                maxzoom: 22,
                attribution: '&copy; <a href="https://www.lantmateriet.se" target="_blank">Lantmäteriet</a>'
            }
        },
        layers: [{
            id: 'swedenSatellite',
            type: 'raster',
            source: 'swedenSatellite',
        }],
    },
    finlandTopo: {
        version: 8,
        sources: {
            finlandTopo: {
                type: 'raster',
                tiles: ['https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?layer=maastokartta&amp;style=default&tilematrixset=WGS84_Pseudo-Mercator&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}&api-key=30cb768c-c968-493c-ae24-2b0b974ebd29'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.maanmittauslaitos.fi/" target="_blank">Maanmittauslaitos</a>'
            }
        },
        layers: [{
            id: 'finlandTopo',
            type: 'raster',
            source: 'finlandTopo',
        }],
    },
    bgMountains: {
        version: 8,
        sources: {
            bgMountains: {
                type: 'raster',
                tiles: ['https://bgmtile.kade.si/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '<a href="http://mountain.bajhui.org/trac/wiki/BGMountains%20%D0%BB%D0%B5%D0%B3%D0%B5%D0%BD%D0%B4%D0%B0" target="_blank">BGM Legend</a> / <a href="https://cart.uni-plovdiv.net/" target="_blank">CART Lab</a>, <a href="http://www.bgmountains.org/" target="_blank">BGM team</a>, © <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC BY-SA 4.0</a>, <a href="http://bgmountains.org/en/maps/garmin-maps/category/9-bgmountains/" target="_blank">Garmin version</a>'
            }
        },
        layers: [{
            id: 'bgMountains',
            type: 'raster',
            source: 'bgMountains',
        }],
    },
    usgs: {
        version: 8,
        sources: {
            usgs: {
                type: 'raster',
                tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}?blankTile=false'],
                tileSize: 256,
                maxzoom: 16,
                attribution: '&copy; <a href="usgs.gov" target="_blank">USGS</a>'
            }
        },
        layers: [{
            id: 'usgs',
            type: 'raster',
            source: 'usgs',
        }],
    },
    qTopo: {
        version: 8,
        sources: {
            qTopo: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/qtopo/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16,
                minzoom: 3,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qTopo',
            type: 'raster',
            source: 'qTopo',
        }],
    },
    qImagery: {
        version: 8,
        sources: {
            qImagery: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/qimagery/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qImagery',
            type: 'raster',
            source: 'qImagery',
        }],
    },
    qAerial: {
        version: 8,
        sources: {
            qAerial: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/qaerial/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qAerial',
            type: 'raster',
            source: 'qAerial',
        }],
    },
    nswTopo: {
        version: 8,
        sources: {
            nswTopo: {
                type: 'raster',
                tiles: ['https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 16,
                attribution: '&copy; <a href="https://maps.six.nsw.gov.au" target="_blank">NSW SIX Maps</a>'
            }
        },
        layers: [{
            id: 'nswTopo',
            type: 'raster',
            source: 'nswTopo',
        }],
    },
    nswBase: {
        version: 8,
        sources: {
            nswBase: {
                type: 'raster',
                tiles: ['https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Base_Map/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 20,
                attribution: '&copy; <a href="https://maps.six.nsw.gov.au" target="_blank">NSW SIX Maps</a>'
            }
        },
        layers: [{
            id: 'nswBase',
            type: 'raster',
            source: 'nswBase',
        }],
    },
    nswImagery: {
        version: 8,
        sources: {
            nswImagery: {
                type: 'raster',
                tiles: ['https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 21,
                attribution: '&copy; <a href="https://maps.six.nsw.gov.au" target="_blank">NSW SIX Maps</a>'
            }
        },
        layers: [{
            id: 'nswImagery',
            type: 'raster',
            source: 'nswImagery',
        }],
    },
    vicImagery: {
        version: 8,
        sources: {
            vicImagery: {
                type: 'raster',
                tiles: ['https://base.maps.vic.gov.au/service?'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://maps.vic.gov.au" target="_blank">Victoria State Government</a>'
            }
        },
        layers: [{
            id: 'vicImagery',
            type: 'raster',
            source: 'vicImagery',
        }],
    },
    saImagery: {
        version: 8,
        sources: {
            saImagery: {
                type: 'raster',
                tiles: ['https://imagemap.geohub.sa.gov.au/mapproxy/wmts/PublicMosaic/webmercator_22/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '&copy; <a href="https://imagemap.geohub.sa.gov.au" target="_blank">South Australia State Government</a>'
            }
        },
        layers: [{
            id: 'saImagery',
            type: 'raster',
            source: 'saImagery',
        }],
    },
    tasTopo: {
        version: 8,
        sources: {
            tasTopo: {
                type: 'raster',
                tiles: ['https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Topographic/ImageServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 16,
                attribution: '&copy; <a href="https://maps.thelist.tas.gov.au" target="_blank">Tasmania LIST</a>'
            }
        },
        layers: [{
            id: 'tasTopo',
            type: 'raster',
            source: 'tasTopo',
        }],
    },
    tasBase: {
        version: 8,
        sources: {
            tasBase: {
                type: 'raster',
                tiles: ['https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/TasmapRaster/ImageServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 16,
                attribution: '&copy; <a href="https://maps.thelist.tas.gov.au" target="_blank">Tasmania LIST</a>'
            }
        },
        layers: [{
            id: 'tasBase',
            type: 'raster',
            source: 'tasBase',
        }],
    },
    tasImagery: {
        version: 8,
        sources: {
            tasImagery: {
                type: 'raster',
                tiles: ['https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Orthophoto/ImageServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '&copy; <a href="https://maps.thelist.tas.gov.au" target="_blank">Tasmania LIST</a>'
            }
        },
        layers: [{
            id: 'tasImagery',
            type: 'raster',
            source: 'tasImagery',
        }],
    },
    getlostTopo: {
        version: 8,
        sources: {
            getlostTopo: {
                type: 'raster',
                //tiles: ['https://tiles.wanderstories.space/getlost/{z}/{x}/{y}.jpg'],
                tiles: ['https://getlost.wanderstories.space/{z}/{x}/{y}.jpg'],
                tileSize: 256,
                maxzoom: 13,
                minzoom: 10,
                attribution: '&copy; <a href="https://getlost.com.au/" target="_blank">Getlost Maps</a>'
            }
        },
        layers: [{
            id: 'getlostTopo',
            type: 'raster',
            source: 'getlostTopo',
        }],
    },
    natmapsTopo: {
        version: 8,
        sources: {
            natmapsTopo: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/natmap/natmap/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 14,
                attribution: '&copy; <a href="https://natmap.wanderstories.space" target="_blank">NatMaps</a>'
            }
        },
        layers: [{
            id: 'natmapsTopo',
            type: 'raster',
            source: 'natmapsTopo',
        }],
    },
    nafiTopo: {
        version: 8,
        sources: {
            nafiTopo: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/nafi/?service=WMS&request=GetMap&layers=topo_layer%2Csat_layer_overlay%2Csat_layer_labels%2Cnodata_raster&styles=null%2Cnull%2Cnull&format=image%2Fpng&transparent=true&version=1.1.1&id=nafiTopo&SRS=EPSG%3A900913&WIDTH=512&HEIGHT=512&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'],
                tileSize: 256,
                minzoom: 10,
                maxzoom: 12,
                attribution: '&copy; NAFI'
            }
        },
        layers: [{
            id: 'nafiTopo',
            type: 'raster',
            source: 'nafiTopo',
            maxzoom: 12
        }],
    },
    appleSatellite: {
        version: 8,
        sources: {
            appleSatellite: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/applemaps/satellite/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.apple.com/maps" target="_blank">Apple</a>'
            }
        },
        layers: [{
            id: 'appleSatellite',
            type: 'raster',
            source: 'appleSatellite',
        }],
    },
    appleMaps: {
        version: 8,
        sources: {
            appleMaps: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/applemaps/standard/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.apple.com/maps" target="_blank">Apple</a>'
            }
        },
        layers: [{
            id: 'appleMaps',
            type: 'raster',
            source: 'appleMaps',
        }],
    },
    yandexSatellite: {
        version: 8,
        sources: { // The projection is EPSG:3395 (Web Mercator)
            yandexSatellite: {
                type: 'raster',
                tiles: ['https://core-sat.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}'], //, 'https://sat0.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}', 'https://sat1.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}', 'https://sat2.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}', 'https://sat3.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}'
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://yandex.com/maps" target="_blank">Yandex</a>'
            }
        },
        layers: [{
            id: 'yandexSatellite',
            type: 'raster',
            source: 'yandexSatellite',
        }],
    },
    arcTopo: {
        version: 8,
        sources: {
            arcTopo: {
                type: 'raster',
                tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.arcgis.com" target="_blank">Esri</a>'
            }
        },
        layers: [{
            id: 'arcTopo',
            type: 'raster',
            source: 'arcTopo',
        }],
    },
    arcImagery: {
        version: 8,
        sources: {
            arcImagery: {
                type: 'raster',
                tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.arcgis.com" target="_blank">Esri</a>'
            }
        },
        layers: [{
            id: 'arcImagery',
            type: 'raster',
            source: 'arcImagery',
        }],
    },
    esriClarity: {
        version: 8,
        sources: {
            esriClarity: {
                type: 'raster',
                tiles: ['https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.arcgis.com" target="_blank">Esri</a>'
            }
        },
        layers: [{
            id: 'esriClarity',
            type: 'raster',
            source: 'esriClarity',
        }],
    },
    esriImagery: {
        version: 8,
        sources: {
            esriImagery: {
                type: 'raster',
                tiles: ['https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/mapserver/tile/645/{z}/{y}/{x}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.arcgis.com" target="_blank">Esri</a>'
            }
        },
        layers: [{
            id: 'esriImagery',
            type: 'raster',
            source: 'esriImagery',
        }],
    },
    bingSatellite: {
        version: 8,
        sources: {
            bingSatellite: {
                type: 'raster',
                tiles: ['https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=8547'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '&copy; <a href="https://www.microsoft.com/maps" target="_blank">Microsoft</a>'
            }
        },
        layers: [{
            id: 'bingSatellite',
            type: 'raster',
            source: 'bingSatellite',
        }],
    },
    googleSatellite: {
        version: 8,
        sources: {
            googleSatellite: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.google.com/maps" target="_blank">Google</a>'
            }
        },
        layers: [{
            id: 'googleSatellite',
            type: 'raster',
            source: 'googleSatellite',
        }],
    },
    googleMaps: {
        version: 8,
        sources: {
            googleMaps: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.google.com/maps" target="_blank">Google</a>'
            }
        },
        layers: [{
            id: 'googleMaps',
            type: 'raster',
            source: 'googleMaps',
        }],
    },
    googleTerrain: {
        version: 8,
        sources: {
            googleTerrain: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 14,
                attribution: '&copy; <a href="https://www.google.com/maps" target="_blank">Google</a>'
            }
        },
        layers: [{
            id: 'googleTerrain',
            type: 'raster',
            source: 'googleTerrain',
        }],
    },
};

export const overlays: { [key: string]: string | StyleSpecification; } = {
    qContours: {
        version: 8,
        sources: {
            qContours: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/contours/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16,
                minzoom: 11,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            },
            qWater: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/water/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16, // Can do 17
                min: 9, // Can do more
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qContours',
            type: 'raster',
            source: 'qContours',
        },
        {
            id: 'qWater',
            type: 'raster',
            source: 'qWater',
        }],
    },
    qFireScars: {
        version: 8,
        sources: {
            qFireScars: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/FireScarMapping/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16,
                minzoom: 11,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qFireScars',
            type: 'raster',
            source: 'qFireScars',
        }],
    },
    qMines: {
        version: 8,
        sources: {
            qMiningResources: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/MiningResources/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            },
            qMinesPermitsHistoric: {
                type: 'raster',
                tiles: ['https://qldglobe.wanderstories.space/MinesPermitsHistoric/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qMiningResources',
            type: 'raster',
            source: 'qMiningResources',
        },
        {
            id: 'qMinesPermitsHistoric',
            type: 'raster',
            source: 'qMinesPermitsHistoric',
        }],
    },
    qRoads: {
        version: 8,
        sources: {
            qRoads: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/RoadsAndTracks/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 17, // Can do 18
                minzoom: 11, // Can do 8
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            },
            qParks: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/ParksTerrestrialProtectedAreas/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 17,
                minzoom: 11,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qRoads',
            type: 'raster',
            source: 'qRoads',
        },
        {
            id: 'qParks',
            type: 'raster',
            source: 'qParks',
        }],
    },
    qLandParcel: {
        version: 8,
        sources: {
            qLandParcel: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/CadastralFramework/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16,
                minzoom: 11,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qLandParcel',
            type: 'raster',
            source: 'qLandParcel'
        }],
    },
    qLandUse: {
        version: 8,
        sources: {
            qLandUse: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/qldglobe/landuse/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 16,
                minzoom: 11,
                attribution: '&copy; <a href="https://qldglobe.wanderstories.space/" target="_blank">Queensland Government</a>'
            }
        },
        layers: [{
            id: 'qLandUse',
            type: 'raster',
            source: 'qLandUse'
        }],
    },
    calSlopes: {
        version: 8,
        sources: {
            calSlopes: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/caltopo/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 14,
                attribution: '&copy; <a href="https://caltopo.com" target="_blank">CalTopo</a>'
            }
        },
        layers: [{
            id: 'calSlopes',
            type: 'raster',
            source: 'calSlopes'
        }],
    },
    indigenousGroups: {
        version: 8,
        sources: {
            indigenousGroups: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/aiatsis/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 6,
                minzoom: 2,
                attribution: '&copy; <a href="https://aiatsis.gov.au" target="_blank">AIATSIS</a>'
            }
        },
        layers: [{
            id: 'indigenousGroups',
            type: 'raster',
            source: 'indigenousGroups',
        }],
    },
    shipwrecks: {
        version: 8,
        sources: {
            shipwrecks: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/shipwrecks/?dpi=96&transparent=true&format=png32&layers=show%3A3%2C4%2C5%2C7%2C8%2C9%2C32&bbox={bbox-epsg-3857}&bboxSR=102100&imageSR=102100&size=256%2C256&f=image'],
                tileSize: 256,
                maxzoom: 15,
                attribution: '&copy; <a href="https://www.environment.gov.au/" target="_blank">Australian Government</a>'
            }
        },
        layers: [{
            id: 'shipwrecks',
            type: 'raster',
            source: 'shipwrecks',
        }],
    },
    waterfalls: {
        version: 8,
        glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
        sources: {
            waterfalls: {
                type: 'geojson',
                data: 'https://waterfalls.wanderstories.space/data/waterfalls.geojson',
                attribution: '&copy; <a href="https://wanderstories.space" target="_blank">Wanderstories</a>'
            }
        },
        layers: [{
            id: 'waterfalls-symbol',
            type: 'symbol',
            source: 'waterfalls',
            layout: {
                'text-field': '▾',
                'text-font': ['Arial Unicode MS Regular'],
                'text-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    2, 16,    // Increased from 12
                    5, 20,    // Increased from 14
                    10, 24,   // Increased from 16
                    15, 28    // Increased from 18
                ],
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#0078D7',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1
            }
        },
        {
            id: 'waterfalls-label',
            type: 'symbol',
            source: 'waterfalls',
            minzoom: 11,
            filter: ['has', 'name'],
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Arial Unicode MS Regular'],
                'text-size': 12,
                'text-offset': [0, 1.5],
                'text-anchor': 'top'
            },
            paint: {
                'text-color': '#000000',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
            }
        }]
    },
    nafiFireScars: {
        version: 8,
        sources: {
            nafiFireScars: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/nafi/?service=WMS&request=GetMap&layers=fire_scar_by_month_current%2Cnodata_raster&styles=null%2Cnull%2Cnull%2Cnull&format=image%2Fpng&transparent=true&version=1.1.1&id=nafiFireScars&SRS=EPSG%3A900913&WIDTH=512&HEIGHT=512&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'],
                tileSize: 512,
                minzoom: 12,
                maxzoom: 15,
                attribution: '&copy; NAFI'
            }
        },
        layers: [{
            id: 'nafiFireScars',
            type: 'raster',
            source: 'nafiFireScars',
        }],
    },
    wanderstoriesHeatmap: {
        version: 8,
        sources: {
            wanderstoriesHeatmap: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/heatmap/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 15,
                attribution: '&copy; <a href="https://heatmap.wanderstories.space" target="_blank">Wanderstories</a>'
            }
        },
        layers: [{
            id: 'wanderstoriesHeatmap',
            type: 'raster',
            source: 'wanderstoriesHeatmap',
        }],
    },
    stravaHeatmapAll: {
        version: 8,
        sources: {
            stravaAll: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/strava/{z}/{x}/{y}/512/all/hot'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://strava.com" target="_blank">Strava</a>'
            }
        },
        layers: [{
            id: 'stravaAll',
            type: 'raster',
            source: 'stravaAll',
        }],
    },
    stravaHeatmapRide: {
        version: 8,
        sources: {
            stravaRide: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/strava/{z}/{x}/{y}/512/ride/hot'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://strava.com" target="_blank">Strava</a>'
            }
        },
        layers: [{
            id: 'stravaRide',
            type: 'raster',
            source: 'stravaRide',
        }],
    },
    trailforksHeatmap: {
        version: 8,
        sources: {
            trailforksHeatmap: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/trailforks/heatmap/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://trailforks.com" target="_blank">Trailforks</a>'
            }
        },
        layers: [{
            id: 'trailforksHeatmap',
            type: 'raster',
            source: 'trailforksHeatmap',
        }],
    },
    ridewithgpsHeatmap: {
        version: 8,
        sources: {
            ridewithgpsHeatmap: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/ridewithgps/heatmap/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://ridewithgps.com" target="_blank">Ride with GPS</a>'
            }
        },
        layers: [{
            id: 'ridewithgpsHeatmap',
            type: 'raster',
            source: 'ridewithgpsHeatmap',
        }],
    },
    garminHeatmap: {
        version: 8,
        sources: {
            garminRoad: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/ROAD_CYCLING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
            garminMtb: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/MOUNTAIN_BIKING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
            garminGravel: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/GRAVEL_BIKING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
            garminRunning: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/RUNNING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
            garminTrail: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/TRAIL_RUNNING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
            garminHiking: {
                type: 'raster',
                tiles: ['https://tiles.wanderstories.space/garmin/heatmap/HIKING/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://connect.garmin.com" target="_blank">Garmin</a>'
            },
        },
        layers: [
            {
                id: 'garminRoad',
                type: 'raster',
                source: 'garminRoad',
            },
            {
                id: 'garminMtb',
                type: 'raster',
                source: 'garminMtb',
            },
            {
                id: 'garminGravel',
                type: 'raster',
                source: 'garminGravel',
            },
            {
                id: 'garminRunning',
                type: 'raster',
                source: 'garminRunning',
            },
            {
                id: 'garminTrail',
                type: 'raster',
                source: 'garminTrail',
            },
            {
                id: 'garminHiking',
                type: 'raster',
                source: 'garminHiking',
            },
        ],
    },
    osmTraces: {
        version: 8,
        sources: {
            osmTraces: {
                type: 'raster',
                tiles: ['https://gps-tile.openstreetmap.org/lines/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'osmTraces',
            type: 'raster',
            source: 'osmTraces',
        }],
    },
    openSeaMap: {
        version: 8,
        sources: {
            openSeaMapProfile: { // Shading
                type: 'raster',
                tiles: ['http://tiles.wanderstories.space/openseamap/profile/{bbox-epsg-3857}'],
                tileSize: 256,
                maxzoom: 17,
                minzoom: 10,
                attribution: '&copy; <a href="https://openseamap.org" target="_blank">OpenSeaMap</a>'
            },
            openSeaMapDepth: { // Contours
                type: 'raster',
                tiles: ['http://tiles.wanderstories.space/openseamap/depth/{bbox-epsg-3857}'],
                tileSize: 256,
                maxzoom: 17,
                minzoom: 10,
                attribution: '&copy; <a href="https://openseamap.org" target="_blank">OpenSeaMap</a>'
            },
            openSeaMapMarkers: {
                type: 'raster',
                //tiles: ['http://tiles.wanderstories.space/openseamap/markers/{z}/{x}/{y}.png'],
                tiles: ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 17,
                minzoom: 10,
                attribution: '&copy; <a href="https://openseamap.org" target="_blank">OpenSeaMap</a>'
            },
        },
        layers: [{
            id: 'openSeaMapDepth',
            type: 'raster',
            source: 'openSeaMapDepth',
        },{
            id: 'openSeaMapProfile',
            type: 'raster',
            source: 'openSeaMapProfile',
        },
        {
            id: 'openSeaMapMarkers',
            type: 'raster',
            source: 'openSeaMapMarkers',
        }],
    },
    cyclOSMlite: {
        version: 8,
        sources: {
            cyclOSMlite: {
                type: 'raster',
                tiles: ['https://a.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png', 'https://b.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png', 'https://c.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '&copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
        },
        layers: [{
            id: 'cyclOSMlite',
            type: 'raster',
            source: 'cyclOSMlite',
        }],
    },
    bikerouterGravel: bikerouterGravel,
    swisstopoSlope: {
        version: 8,
        sources: {
            swisstopoSlope: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hangneigung-ueber_30/default/current/3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>',
            },
        },
        layers: [{
            id: 'swisstopoSlope',
            type: 'raster',
            source: 'swisstopoSlope',
        }],
    },
    swisstopoHiking: {
        version: 8,
        sources: {
            swisstopoHiking: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-wanderwege/default/current/3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            },
        },
        layers: [{
            id: 'swisstopoHiking',
            type: 'raster',
            source: 'swisstopoHiking',
        }],
    },
    swisstopoHikingClosures: {
        version: 8,
        sources: {
            swisstopoHikingClosures: {
                type: 'raster',
                tiles: ['https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetMap&sld_version=1.1.0&layers=ch.astra.wanderland-sperrungen_umleitungen&format=image/png&STYLE=default&bbox={bbox-epsg-3857}&width=256&height=256&crs=EPSG:3857&transparent=true'],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            },
        },
        layers: [{
            id: 'swisstopoHikingClosures',
            type: 'raster',
            source: 'swisstopoHikingClosures',
        }],
    },
    swisstopoCycling: {
        version: 8,
        sources: {
            swisstopoCycling: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.astra.veloland/default/current/3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoCycling',
            type: 'raster',
            source: 'swisstopoCycling',
        }],
    },
    swisstopoCyclingClosures: {
        version: 8,
        sources: {
            swisstopoCyclingClosures: {
                type: 'raster',
                tiles: ['https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetMap&sld_version=1.1.0&layers=ch.astra.veloland-sperrungen_umleitungen&format=image/png&STYLE=default&bbox={bbox-epsg-3857}&width=256&height=256&crs=EPSG:3857&transparent=true'],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoCyclingClosures',
            type: 'raster',
            source: 'swisstopoCyclingClosures',
        }],
    },
    swisstopoMountainBike: {
        version: 8,
        sources: {
            swisstopoMountainBike: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.astra.mountainbikeland/default/current/3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoMountainBike',
            type: 'raster',
            source: 'swisstopoMountainBike',
        }],
    },
    swisstopoMountainBikeClosures: {
        version: 8,
        sources: {
            swisstopoMountainBikeClosures: {
                type: 'raster',
                tiles: ['https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetMap&sld_version=1.1.0&layers=ch.astra.mountainbikeland-sperrungen_umleitungen&format=image/png&STYLE=default&bbox={bbox-epsg-3857}&width=256&height=256&crs=EPSG:3857&transparent=true'],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoMountainBikeClosures',
            type: 'raster',
            source: 'swisstopoMountainBikeClosures',
        }],
    },
    swisstopoSkiTouring: {
        version: 8,
        sources: {
            swisstopoSkiTouring: {
                type: 'raster',
                tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo-karto.skitouren/default/current/3857/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 17,
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>'
            }
        },
        layers: [{
            id: 'swisstopoSkiTouring',
            type: 'raster',
            source: 'swisstopoSkiTouring',
        }],
    },
    ignFrCadastre: {
        version: 8,
        sources: {
            ignFrCadastre: {
                type: 'raster',
                tiles: ['https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}&LAYER=CADASTRALPARCELS.PARCELS&FORMAT=image/png&STYLE=normal'],
                tileSize: 256,
                maxzoom: 20,
                attribution: 'IGN-F/Géoportail'
            }
        },
        layers: [{
            id: 'ignFrCadastre',
            type: 'raster',
            source: 'ignFrCadastre',
        }],
    },
    ignSlope: {
        version: 8,
        sources: {
            ignSlope: {
                type: 'raster',
                tiles: ['https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TileMatrixSet=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&Layer=GEOGRAPHICALGRIDSYSTEMS.SLOPES.MOUNTAIN&FORMAT=image/png&Style=normal'],
                tileSize: 256,
                attribution: 'IGN-F/Géoportail'
            }
        },
        layers: [{
            id: 'ignSlope',
            type: 'raster',
            source: 'ignSlope',
        }],
    },
    ignSkiTouring: {
        version: 8,
        sources: {
            ignSkiTouring: {
                type: 'raster',
                tiles: ['https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TileMatrixSet=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&Layer=TRACES.RANDO.HIVERNALE&FORMAT=image/png&Style=normal'],
                tileSize: 256,
                maxzoom: 16,
                attribution: 'IGN-F/Géoportail'
            },
        },
        layers: [{
            id: 'ignSkiTouring',
            type: 'raster',
            source: 'ignSkiTouring',
        }],
    },
    waymarkedTrailsHiking: {
        version: 8,
        sources: {
            waymarkedTrailsHiking: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsHiking',
            type: 'raster',
            source: 'waymarkedTrailsHiking',
        }],
    },
    waymarkedTrailsCycling: {
        version: 8,
        sources: {
            waymarkedTrailsCycling: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsCycling',
            type: 'raster',
            source: 'waymarkedTrailsCycling',
        }],
    },
    waymarkedTrailsMTB: {
        version: 8,
        sources: {
            waymarkedTrailsMTB: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsMTB',
            type: 'raster',
            source: 'waymarkedTrailsMTB',
        }],
    },
    waymarkedTrailsSkating: {
        version: 8,
        sources: {
            waymarkedTrailsSkating: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/skating/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsSkating',
            type: 'raster',
            source: 'waymarkedTrailsSkating',
        }],
    },
    waymarkedTrailsHorseRiding: {
        version: 8,
        sources: {
            waymarkedTrailsHorseRiding: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/riding/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsHorseRiding',
            type: 'raster',
            source: 'waymarkedTrailsHorseRiding',
        }],
    },
    waymarkedTrailsWinter: {
        version: 8,
        sources: {
            waymarkedTrailsWinter: {
                type: 'raster',
                tiles: ['https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
                attribution: '&copy; <a href="https://www.waymarkedtrails.org" target="_blank">Waymarked Trails</a>'
            }
        },
        layers: [{
            id: 'waymarkedTrailsWinter',
            type: 'raster',
            source: 'waymarkedTrailsWinter',
        }],
    },
};

export const defaultOpacities: { [key: string]: number; } = {
    ignFrCadastre: 0.5,
    ignSlope: 0.4,
    swisstopoSlope: 0.4,
    calSlopes: 0.5,
    qLandUse: 0.4,
    qLandParcel: 0.6,
    qContours: 0.7,
    qWater: 0.7,
};

export type LayerTreeType = { [key: string]: LayerTreeType | boolean; };

// Hierarchy containing all basemaps
export const basemapTree: LayerTreeType = {
    basemaps: {
        world: {
            wsOutdoors: true,
            mapboxOutdoors: true,
            mapboxSatellite: true,
            openStreetMap: true,
            openTopoMap: true,
            openHikingMap: true,
            cyclOSM: true,
            arcTopo: true,
            arcImagery: true,
            esriClarity: true,
            esriImagery: true,
            bingSatellite: true,
            googleSatellite: true,
            googleMaps: true,
            googleTerrain: true,
            appleSatellite: true,
            appleMaps: true,
            yandexSatellite: true,
        },
        countries: {
            australia: {
                qTopo: true,
                qImagery: true,
                qAerial: true,
                nswTopo: true,
                nswBase: true,
                nswImagery: true,
                vicImagery: true,
                saImagery: true,
                tasTopo: true,
                tasBase: true,
                tasImagery: true,
                nafiTopo: true,
                natmapsTopo: true,
                getlostTopo: true,
            },
            belgium: {
                ignBe: true,
            },
            bulgaria: {
                bgMountains: true,
            },
            finland: {
                finlandTopo: true,
            },
            france: {
                ignFrPlan: true,
                ignFrTopo: true,
                ignFrScan25: true,
                ignFrSatellite: true,
            },
            new_zealand: {
                linz: true,
                linzTopo: true,
                linzImagery: true,
            },
            norway: {
                norwayTopo: true,
            },
            spain: {
                ignEs: true,
                ignEsSatellite: true,
            },
            sweden: {
                swedenTopo: true,
                swedenSatellite: true,
            },
            switzerland: {
                swisstopoRaster: true,
                swisstopoVector: true,
                swisstopoSatellite: true,
            },
            united_kingdom: {
                ordnanceSurvey: true,
            },
            united_states: {
                usgs: true,
            }
        },
    },
}

// Hierarchy containing all overlays
export const overlayTree: LayerTreeType = {
    overlays: {
        world: {
            waymarked_trails: {
                waymarkedTrailsHiking: true,
                waymarkedTrailsCycling: true,
                waymarkedTrailsMTB: true,
                waymarkedTrailsSkating: true,
                waymarkedTrailsHorseRiding: true,
                waymarkedTrailsWinter: true,
            },
            cyclOSMlite: true,
            bikerouterGravel: true,
            wanderstoriesHeatmap: true,
            stravaHeatmapAll: true,
            stravaHeatmapRide: true,
            trailforksHeatmap: true,
            ridewithgpsHeatmap: true,
            garminHeatmap: true,
            osmTraces: true,
            openSeaMap: true,
        },
        countries: {
            australia: {
                qMines: true,
                qRoads: true,
                qLandUse: true,
                qLandParcel: true,
                qContours: true,
                qFireScars: true,
                nafiFireScars: true,
                shipwrecks: true,
                waterfalls: true,
                calSlopes: true,
                indigenousGroups: false,
            },
            france: {
                ignFrCadastre: true,
                ignSlope: true,
                ignSkiTouring: true,
            },
            switzerland: {
                swisstopoSlope: true,
                swisstopoHiking: true,
                swisstopoHikingClosures: true,
                swisstopoCycling: true,
                swisstopoCyclingClosures: true,
                swisstopoMountainBike: true,
                swisstopoMountainBikeClosures: true,
                swisstopoSkiTouring: true,
            }
        },
    },
}

// Hierachy containing all Overpass layers
export const overpassTree: LayerTreeType = {
    points_of_interest: {
        food: {
            bakery: true,
            "food-store": true,
            "eat-and-drink": true,
        },
        amenities: {
            toilets: true,
            "water": true,
            shower: true,
            shelter: true,
            barrier: true
        },
        tourism: {
            attraction: true,
            viewpoint: true,
            hotel: true,
            campsite: true,
            hut: true,
            picnic: true,
            summit: true,
            pass: true,
            climbing: true,
        },
        bicycle: {
            "bicycle-parking": true,
            "bicycle-rental": true,
            "bicycle-shop": true
        },
        "public-transport": {
            "railway-station": true,
            "tram-stop": true,
            "bus-stop": true,
            ferry: true
        },
        motorized: {
            "fuel-station": true,
            parking: true,
            garage: true
        },
    },
};

// Default basemap used
export const defaultBasemap = 'wsOutdoors';

// Default overlays used (none)
export const defaultOverlays: LayerTreeType = {
    overlays: {
        world: {
            waymarked_trails: {
                waymarkedTrailsHiking: false,
                waymarkedTrailsCycling: false,
                waymarkedTrailsMTB: false,
                waymarkedTrailsSkating: false,
                waymarkedTrailsHorseRiding: false,
                waymarkedTrailsWinter: false,
            },
            cyclOSMlite: false,
            bikerouterGravel: false,
            wanderstoriesHeatmap: false,
            stravaHeatmapAll: false,
            stravaHeatmapRide: false,
            trailforksHeatmap: false,
            ridewithgpsHeatmap: false,
            garminHeatmap: false,
            osmTraces: false,
            openSeaMap: true,
        },
        countries: {
            australia: {
                qMines: false,
                qRoads: false,
                qLandUse: false,
                qLandParcel: false,
                qContours: false,
                qFireScars: false,
                nafiFireScars: false,
                shipwrecks: false,
                waterfalls: false,
                calSlopes: false,
                indigenousGroups: false,
            },
            france: {
                ignFrCadastre: false,
                ignSlope: false,
                ignSkiTouring: false,
            },
            switzerland: {
                swisstopoSlope: false,
                swisstopoHiking: false,
                swisstopoHikingClosures: false,
                swisstopoCycling: false,
                swisstopoCyclingClosures: false,
                swisstopoMountainBike: false,
                swisstopoMountainBikeClosures: false,
                swisstopoSkiTouring: false,
            }
        },
    },
};

// Default Overpass queries used (none)
export const defaultOverpassQueries: LayerTreeType = {
    points_of_interest: {
        "food": {
            bakery: false,
            "food-store": false,
            "eat-and-drink": false,
        },
        amenities: {
            toilets: false,
            "water": false,
            shower: false,
            shelter: false,
            barrier: false
        },
        tourism: {
            attraction: false,
            viewpoint: false,
            hotel: false,
            campsite: false,
            hut: false,
            picnic: false,
            summit: false,
            pass: false,
            climbing: false
        },
        bicycle: {
            "bicycle-parking": false,
            "bicycle-rental": false,
            "bicycle-shop": false
        },
        "public-transport": {
            "railway-station": false,
            "tram-stop": false,
            "bus-stop": false,
            ferry: false
        },
        motorized: {
            "fuel-station": false,
            parking: false,
            garage: false
        },
    },
};

// Default basemaps shown in the layer menu
export const defaultBasemapTree: LayerTreeType = {
    basemaps: {
        world: {
            wsOutdoors: true,
            mapboxOutdoors: true,
            mapboxSatellite: true,
            openStreetMap: true,
            openTopoMap: true,
            openHikingMap: true,
            cyclOSM: true,
            arcTopo: false,
            arcImagery: true,
            esriClarity: true,
            esriImagery: true,
            bingSatellite: true,
            googleSatellite: true,
            googleMaps: false,
            googleTerrain: false,
            appleSatellite: true,
            appleMaps: false,
            yandexSatellite: false,
        },
        countries: {
            australia: {
                qTopo: true,
                qImagery: true,
                qAerial: true,
                nswTopo: false,
                nswBase: false,
                nswImagery: false,
                vicImagery: false,
                saImagery: false,
                tasTopo: false,
                tasBase: false,
                tasImagery: false,
                nafiTopo: true,
                natmapsTopo: true,
                getlostTopo: true,
            },
            belgium: {
                ignBe: false,
            },
            bulgaria: {
                bgMountains: false,
            },
            finland: {
                finlandTopo: false,
            },
            france: {
                ignFrPlan: false,
                ignFrTopo: false,
                ignFrScan25: false,
                ignFrSatellite: false,
            },
            new_zealand: {
                linz: false,
                linzTopo: false,
                linzImagery: false,
            },
            norway: {
                norwayTopo: false,
            },
            spain: {
                ignEs: false,
                ignEsSatellite: false,
            },
            sweden: {
                swedenTopo: false,
                swedenSatellite: false,
            },
            switzerland: {
                swisstopoRaster: false,
                swisstopoVector: false,
                swisstopoSatellite: false,
            },
            united_kingdom: {
                ordnanceSurvey: false,
            },
            united_states: {
                usgs: false,
            }
        },
    }
};

// Default overlays shown in the layer menu
export const defaultOverlayTree: LayerTreeType = {
    overlays: {
        world: {
            waymarked_trails: {
                waymarkedTrailsHiking: true,
                waymarkedTrailsCycling: true,
                waymarkedTrailsMTB: true,
                waymarkedTrailsSkating: false,
                waymarkedTrailsHorseRiding: false,
                waymarkedTrailsWinter: false,
            },
            cyclOSMlite: false,
            bikerouterGravel: false,
            wanderstoriesHeatmap: true,
            stravaHeatmapAll: false,
            stravaHeatmapRide: false,
            trailforksHeatmap: false,
            ridewithgpsHeatmap: false,
            garminHeatmap: false,
            osmTraces: false,
            openSeaMap: true,
        },
        countries: {
            australia: {
                qMines: true,
                qRoads: true,
                qLandUse: true,
                qLandParcel: true,
                qContours: true,
                qFireScars: true,
                nafiFireScars: true,
                shipwrecks: false,
                waterfalls: true,
                calSlopes: true,
                indigenousGroups: false,
            },
            france: {
                ignFrCadastre: false,
                ignSlope: false,
                ignSkiTouring: false,
            },
            switzerland: {
                swisstopoSlope: false,
                swisstopoHiking: false,
                swisstopoHikingClosures: false,
                swisstopoCycling: false,
                swisstopoCyclingClosures: false,
                swisstopoMountainBike: false,
                swisstopoMountainBikeClosures: false,
                swisstopoSkiTouring: false,
            }
        },
    }
}

// Default Overpass queries shown in the layer menu
export const defaultOverpassTree: LayerTreeType = {
    points_of_interest: {
        "food": {
            bakery: true,
            "food-store": true,
            "eat-and-drink": true,
        },
        amenities: {
            toilets: true,
            "water": true,
            shower: false,
            shelter: false,
            barrier: false
        },
        tourism: {
            attraction: false,
            viewpoint: false,
            hotel: true,
            campsite: true,
            hut: true,
            picnic: false,
            summit: true,
            pass: true,
            climbing: false
        },
        bicycle: {
            "bicycle-parking": false,
            "bicycle-rental": false,
            "bicycle-shop": true
        },
        "public-transport": {
            "railway-station": true,
            "tram-stop": true,
            "bus-stop": true,
            ferry: false
        },
        motorized: {
            "fuel-station": false,
            parking: false,
            garage: false
        },
    },
};

export type CustomLayer = {
    id: string,
    name: string,
    tileUrls: string[],
    maxZoom: number,
    layerType: 'basemap' | 'overlay',
    resourceType: 'raster' | 'vector',
    value: string | {},
};

type OverpassQueryData = {
    icon: {
        svg: string,
        color: string,
    },
    tags: Record<string, string | boolean | string[]> | Record<string, string | boolean | string[]>[],
    symbol?: string,
};

export const overpassQueryData: Record<string, OverpassQueryData> = {
    bakery: {
        icon: {
            svg: Croissant,
            color: "Coral",
        },
        tags: {
            shop: "bakery"
        },
        symbol: "Convenience Store"
    },
    "food-store": {
        icon: {
            svg: ShoppingBasket,
            color: "Coral",
        },
        tags: {
            shop: ["supermarket", "convenience"],
        },
        symbol: "Convenience Store"
    },
    "eat-and-drink": {
        icon: {
            svg: Utensils,
            color: "Coral",
        },
        tags: {
            amenity: ["restaurant", "fast_food", "cafe", "pub", "bar"]
        },
        symbol: "Restaurant"
    },
    toilets: {
        icon: {
            svg: Toilet,
            color: "DeepSkyBlue",
        },
        tags: {
            amenity: "toilets"
        },
        symbol: "Restroom"
    },
    water: {
        icon: {
            svg: Droplet,
            color: "DeepSkyBlue",
        },
        tags: [{
            amenity: ["drinking_water", "water_point"]
        }, {
            natural: "spring",
            drinking_water: "yes"
        }],
        symbol: "Drinking Water"
    },
    shower: {
        icon: {
            svg: ShowerHead,
            color: "DeepSkyBlue",
        },
        tags: {
            amenity: "shower"
        },
        symbol: "Shower"
    },
    shelter: {
        icon: {
            svg: Tent,
            color: "#000000",
        },
        tags: {
            amenity: "shelter"
        },
        symbol: "Shelter"
    },
    "fuel-station": {
        icon: {
            svg: Fuel,
            color: "#000000",
        },
        tags: {
            amenity: "fuel"
        },
        symbol: "Gas Station"
    },
    parking: {
        icon: {
            svg: CircleParking,
            color: "#000000",
        },
        tags: {
            amenity: "parking"
        },
        symbol: "Parking Area"
    },
    garage: {
        icon: {
            svg: Wrench,
            color: "#000000",
        },
        tags: {
            shop: ["car_repair", "motorcycle_repair"]
        },
        symbol: "Car Repair"
    },
    barrier: {
        icon: {
            svg: Fence,
            color: "#000000",
        },
        tags: {
            barrier: true
        }
    },
    attraction: {
        icon: {
            svg: FerrisWheel,
            color: "Green",
        },
        tags: {
            tourism: "attraction"
        }
    },
    viewpoint: {
        icon: {
            svg: Binoculars,
            color: "Green",
        },
        tags: {
            tourism: "viewpoint"
        },
        symbol: "Scenic Area"
    },
    hotel: {
        icon: {
            svg: Bed,
            color: "#e6c100",
        },
        tags: {
            tourism: ["hotel", "hostel", "guest_house", "motel"]
        },
        symbol: "Hotel"
    },
    campsite: {
        icon: {
            svg: Tent,
            color: "#e6c100",
        },
        tags: {
            tourism: "camp_site"
        },
        symbol: "Campground"
    },
    hut: {
        icon: {
            svg: House,
            color: "#e6c100",
        },
        tags: {
            tourism: ["alpine_hut", "wilderness_hut"]
        },
        symbol: "Lodge"
    },
    picnic: {
        icon: {
            svg: Utensils,
            color: "Green",
        },
        tags: {
            tourism: "picnic_site"
        },
        symbol: "Picnic Area"
    },
    summit: {
        icon: {
            svg: Mountain,
            color: "Green",
        },
        tags: {
            natural: "peak"
        },
        symbol: "Summit"
    },
    pass: {
        icon: {
            svg: Mountain,
            color: "Green",
        },
        tags: {
            mountain_pass: "yes"
        }
    },
    climbing: {
        icon: {
            svg: Pickaxe,
            color: "Green",
        },
        tags: {
            sport: "climbing"
        }
    },
    "bicycle-parking": {
        icon: {
            svg: CircleParking,
            color: "HotPink",
        },
        tags: {
            amenity: "bicycle_parking"
        },
        symbol: "Parking Area"
    },
    "bicycle-rental": {
        icon: {
            svg: Store,
            color: "HotPink",
        },
        tags: {
            amenity: "bicycle_rental"
        }
    },
    "bicycle-shop": {
        icon: {
            svg: Store,
            color: "HotPink",
        },
        tags: {
            shop: "bicycle"
        }
    },
    "railway-station": {
        icon: {
            svg: TrainFront,
            color: "DarkBlue",
        },
        tags: {
            railway: "station"
        },
        symbol: "Ground Transportation"
    },
    "tram-stop": {
        icon: {
            svg: TramFront,
            color: 'DarkBlue',
        },
        tags: {
            railway: "tram_stop"
        },
        symbol: "Ground Transportation"
    },
    "bus-stop": {
        icon: {
            svg: Bus,
            color: "DarkBlue",
        },
        tags: {
            "public_transport": ["stop_position", "platform"],
            bus: "yes"
        },
        symbol: "Ground Transportation"
    },
    ferry: {
        icon: {
            svg: Ship,
            color: "DarkBlue",
        },
        tags: {
            amenity: "ferry_terminal"
        },
        symbol: "Anchor"
    }
};