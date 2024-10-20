import request from '../utils/request'
import { create as interpolateHeatmapLayer } from 'interpolateheatmaplayer'

export function load_noice(time, map, heatP, framebufferFactor) {
    request.get('get_noice_time?time=' + time).then(res => {
        const noise = res.data[0].row_to_json.features.map(feature => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            val: feature.properties.laeq
        }))
        //console.log(noise)
        if (!map.value.getLayer('noise')) {
            const layer = interpolateHeatmapLayer({
                points: noise,
                layerId: 'noise',
                p: heatP,
                pointRadius: 100,
                framebufferFactor: framebufferFactor
            });
            map.value.addLayer(layer);
            //console.log('Noise layer added:', layer);
        } else {
            const layer = interpolateHeatmapLayer({
                points: noise,
                layerId: 'noise',
                p: heatP,
                pointRadius: 100,
                framebufferFactor: framebufferFactor
            });
            map.value.removeLayer('noise');
            map.value.addLayer(layer, 'cars-layer');
        }

        //console.log("noisepoints:", noise)
    }).catch(error => {
        console.error('Error fetching data:', error);
    })
}