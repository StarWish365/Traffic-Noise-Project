import axios from 'axios'
import { create as interpolateHeatmapLayer } from 'interpolateheatmaplayer'

export function load_noice(time, map) {
    axios.get('http://localhost:3000/api/get_noice_time?time=' + time).then(res => {
        const noise = res.data[0].row_to_json.features.map(feature => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            val: feature.properties.laeq
        }))
        if (!map.value.getLayer('noise')) {
            const layer = interpolateHeatmapLayer({
                points: noise,
                layerId: 'noise'
            });
            map.value.addLayer(layer);
            console.log('Noise layer added:', layer);
        } else {
            const layer = interpolateHeatmapLayer({
                points: noise,
                layerId: 'noise',
                p:2
            });
            map.value.removeLayer('noise');
            map.value.addLayer(layer, 'cars-layer');
        }

        //console.log("noisepoints:", noise)
    }).catch(error => {
        console.error('Error fetching data:', error);
    })
}