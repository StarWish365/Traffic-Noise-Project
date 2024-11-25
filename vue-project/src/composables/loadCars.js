import mapboxgl from 'mapbox-gl';
import request from '../utils/request'
import { createGeoJSON } from './createGeoJSON';

let animationDuration = 1000; // animation duration in milliseconds
let previousPositions = {}; // store previous positions

export function load_cars(time, map, sel) {
    request.get('get_cars_time?time=' + time).then(response => {
        // create the dictionary for the current position
        const newPositions = response.data[0].row_to_json.features.reduce((acc, feature) => {
            const id = feature.properties.id;
            const coordinates = feature.geometry.coordinates;
            acc[id] = coordinates;
            return acc;
        }, {});
        // if it's the first time we've loaded car layer
        if (!map.value.getSource('cars')) {
            const geojsonData = createGeoJSON(response.data);
            map.value.addSource('cars', {
                'type': 'geojson',
                'data': geojsonData
            });
            //console.log(geojsonData);
            if (sel === "Speed") {
                map.value.addLayer({
                    'id': 'cars-layer',
                    'type': 'circle',
                    'source': 'cars',
                    'paint': {
                        'circle-radius': [
                            'case',
                            //set the radius of the circle
                            ['==', ['get', 'type'], 'veh_passenger_e'], 8,
                            ['==', ['get', 'type'], 'veh_passenger'], 6,
                            5
                        ],
                        'circle-color': [
                            'case',
                            //set icon for different speed and cars
                            ['==', ['get', 'type'], 'veh_passenger_e'], '#1938a4',
                            ['all', ['==', ['get', 'type'], 'veh_passenger'], ['<', ['get', 'speed'], 5.55]], '#00ff00',
                            ['all', ['==', ['get', 'type'], 'veh_passenger'], ['<', ['get', 'speed'], 11.11]], '#ffa500',
                            ['all', ['==', ['get', 'type'], 'veh_passenger'], ['>=', ['get', 'speed'], 11.11]], '#ff0000',
                            '#292c34'
                        ]
                    }
                })
            } else {
                map.value.addLayer({
                    'id': 'cars-layer',
                    'type': 'circle',
                    'source': 'cars',
                    'paint': {
                        'circle-radius': [
                            'case',
                            ['==', ['get', 'type'], 'veh_passenger_e'], 8,
                            ['==', ['get', 'type'], 'veh_passenger'], 6,
                            5
                        ],
                        'circle-color': [
                            'case',
                            ['>', ['get', 'acceleration'], 0], '#00ff00',
                            ['<', ['get', 'acceleration'], 0], '#ff0000',
                            '#292c34'
                        ]
                    }
                })
            }

            map.value.moveLayer('cars-layer');
            const carsSource = map.value.getSource('cars');
            console.log("Cars Source Data:", carsSource._data);
            mouseEvent(map)
            /* handlerPopup(map) */

        } else {
            // create the animation
            animateCarMovement(newPositions, previousPositions, response.data, map);
        }
        //console.log("previousPositions: ", previousPositions);
        //console.log(newPositions);
        // 更新上一帧的位置信息
        previousPositions = newPositions;
    }).catch(error => {
        console.log('Error fetching cars:', error);
    });
}
//set mouse
function mouseEvent(map) {
    map.value.on('mouseenter', 'cars-layer', () => {
        map.value.getCanvas().style.cursor = 'pointer';
    });
    map.value.on('mouseleave', 'cars-layer', () => {
        map.value.getCanvas().style.cursor = '';
    });
}

// Handle click events and display car-related information in a popup
function handlerPopup(map) {
    const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true
    })
    map.value.on('click', 'cars-layer', (e) => {
        console.log("click at:", e.lngLat)
        const coordinates = e.features[0].geometry.coordinates.slice();  // Get the coordinates of the clicked feature
        const description = `speed: ${e.features[0].properties.speed}km/h <br>
        acceleration: ${e.features[0].properties.acceleration}m/s^2<br>
        lng: ${coordinates[0]}<br>
        lat: ${coordinates[1]}`;
        popup.setLngLat(coordinates).setHTML(description).addTo(map.value)
    })
}

// Linear interpolation function,
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Animation transition function
function animateCarMovement(newPositions, previousPositions, data, map) {
    const startTime = performance.now();

    function animateFrame(currentTime) {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / animationDuration, 1); // 计算动画进度 0 到 1
        //console.log("data: " ,data)

        let interpolatedData = data[0].row_to_json.features.map(item => {
            const id = item.properties.id;
            const previousPos = previousPositions[id] || item.geometry.coordinates;
            const targetPos = newPositions[id];

            // 检查 targetPos 是否存在
            if (!targetPos) {
                console.warn(`Missing target position for vehicle with id: ${id}`);
                return null; // 跳过此条数据
            }

            // 对每个车辆的经纬度进行线性插值
            const interpolatedPos = [
                lerp(previousPos[0], targetPos[0], t), // Linear interpolation lng
                lerp(previousPos[1], targetPos[1], t)  // Linear interpolation lat
            ];
            //console.log("interpolatedPos:",interpolatedPos);

            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": interpolatedPos
                },
                "properties": item.properties
            };
        }).filter(item => item !== null); // 移除 null 项


        // 打印结果，确认数据
        //console.log("interpolatedData:", interpolatedData);
        //console.log("interpolatedData:",interpolatedData);
        // 更新地图上的车辆位置
        map.value.getSource('cars').setData({
            "type": "FeatureCollection",
            "features": interpolatedData
        });

        // 如果动画没有结束，则继续下一帧
        if (t < 1) {
            requestAnimationFrame(animateFrame);  // 确保传递回调函数
        }
    }

    // 启动动画
    requestAnimationFrame(animateFrame); // 这里传递 animateFrame 函数，它会接收 currentTime
}