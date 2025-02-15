import request from '../utils/request'
import { create as interpolateHeatmapLayer } from 'interpolateheatmaplayer'
import { convertToGeoJSON } from './createGeoJSON'


export function load_noice(time, map, store) {
    request.get('get_noice_time?time=' + time).then(res => {
        const rawNoise = res.data[0].row_to_json.features.map(feature => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            id: feature.properties.idreceive,
            building: feature.properties.bg_pk,
            val: feature.properties.laeq
        }))
        noiseCount(rawNoise, store, map)
        updateVehicleIndex(store.vehicleLocation)
        const noise = filterNoisePoints(rawNoise)
        const geojsonData = convertToGeoJSON(noise)
        if (!map.value.getSource('receivers')) {
            /* console.log(geojsonData) */
            map.value.addSource('receivers', {
                'type': 'geojson',
                'data': geojsonData
            })
            map.value.addLayer({
                'id': 'noise-receivers',
                'type': 'circle',
                'source': 'receivers',
                'paint': {
                    'circle-radius': 3,
                    'circle-color': '#292c34'
                }
            })
            map.value.setLayoutProperty('noise-receivers', 'visibility', 'none');
        } else {
            map.value.getSource('receivers').setData(geojsonData)
        }
        //console.log(noise)
        if(store.heatLayercontrol){
            if (!map.value.getLayer('noise')) {
            const layer = interpolateHeatmapLayer({
                points: noise,
                layerId: 'noise',
                p: store.heatP,
                pointRadius: 100,
                framebufferFactor: store.FramebufferFactor,
            });
            map.value.addLayer(layer);
            } else {
                const layer = interpolateHeatmapLayer({
                    points: noise,
                    layerId: 'noise',
                    p: store.heatP,
                    pointRadius: 100,
                    framebufferFactor: store.FramebufferFactor,
                });
                map.value.removeLayer('noise');
                map.value.addLayer(layer, 'cars-layer');
            }
        }
        

        //console.log("noisepoints:", noise)
    }).catch(error => {
        console.error('Error fetching data:', error);
    })
}

import RBush from 'rbush';

let vehicleTree = new RBush();

// 每秒更新车辆位置索引
function updateVehicleIndex(vehicleData) {
    let items = Object.entries(vehicleData).map(([id, coords]) => ({
        minX: coords[0],  // 经度
        minY: coords[1],  // 纬度
        maxX: coords[0],
        maxY: coords[1],
        id: id
    }));
    vehicleTree.clear();
    vehicleTree.load(items);
}


function filterNoisePoints(noisePoints) {
    return noisePoints.filter(noisePoint => {
        // 查询 20m 半径内的车辆
        let vehicles20m = vehicleTree.search({
            minX: noisePoint.lon - 0.0004,  // 20m 大致转换为经纬度
            minY: noisePoint.lat - 0.0004,
            maxX: noisePoint.lon + 0.0004,
            maxY: noisePoint.lat + 0.0004
        });

        if (vehicles20m.length > 0) return true; // 20m 内有车，直接保留

        /*         // 查询 20m - 50m 半径内的车辆
                let vehicles50m = vehicleTree.search({
                    minX: noisePoint.lon - 0.0008,  // 50m 大致转换为经纬度
                    minY: noisePoint.lat - 0.0008,
                    maxX: noisePoint.lon + 0.0008,
                    maxY: noisePoint.lat + 0.0008
                });
        
                if (vehicles50m.length > 0) return Math.random() < 0.8; // 50m 内有车，80% 概率保留
        
                // 查询 50m - 100m 半径内的车辆
                let vehicles100m = vehicleTree.search({
                    minX: noisePoint.lon - 0.0012,  // 100m 大致转换为经纬度
                    minY: noisePoint.lat - 0.0012,
                    maxX: noisePoint.lon + 0.0012,
                    maxY: noisePoint.lat + 0.0012
                });
        
                if (vehicles100m.length > 0) return Math.random() < 0.5; // 100m 内有车，50% 概率保留 */

        return false; // 超过 100m，直接丢弃
    });
}

//每一轮计算每个building的人口噪声暴露程度
function noiseCount(noiseData, store, map) {
    noiseData.forEach(({ building, id, val }) => {
        if (val >= 65) {
            const buildingID = `building${building}`
            const receiverID = `receiver${id}`;
            if (store.receiverstoBuilding[buildingID].receivers[receiverID]) {
                store.receiverstoBuilding[buildingID].receivers[receiverID].overNoisecount++
                store.receiverstoBuilding[buildingID].sum += Number(store.receiverstoBuilding[buildingID].pop)
            }
            if (store.receiverstoBuilding[buildingID].sum > 100) {
                if (!store.receiverstoBuilding[buildingID].highlight) {
                    store.receiverstoBuilding[buildingID].highlight = true
                    updateBuildingColor(building, '#ffa500', map)
                }
            }
        }
    });
}

// 改变噪声暴露程度过高的building的颜色
function updateBuildingColor(buildingId, newColor, map) {
    let source = map.value.getSource('buildings');
    if (!source) return;
    let data = source._data; // 获取当前 GeoJSON 数据
    let feature = data.features.find(f => f.id === buildingId); // 直接查找对应 Feature

    if (feature) {
        feature.properties.color = newColor; // 直接修改目标 Feature 的颜色
        source.setData(data); // 仅更新一次数据
    }
}


