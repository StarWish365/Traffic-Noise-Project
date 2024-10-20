import request from '../utils/request'
import mapboxgl from 'mapbox-gl';
export function getNoiseHistory(lng, lat, time, map, HeadValue) {
    // 创建请求体数据
    const params = {
        longitude: lng,
        latitude: lat,
        time: time
    };

    // 使用 Axios 请求后端接口
    request.get('get_noise_value', { params })
        .then((response) => {
            console.log('服务器返回的数据:', response.data)
            // 处理返回的数据，例如更新地图上的图层或显示数据
            const coordinates = response.data[0].result.geometry.coordinates
            const noiseHistory = response.data[0].result.properties.laeq
            const idreceiver = response.data[0].result.properties.idreceiver
            HeadValue.idreceiver = idreceiver
            HeadValue.history = noiseHistory
            console.log("噪声点坐标", coordinates)
            // 如果上一次的 marker 存在，先将其移除
            if (HeadValue.marker) {
                HeadValue.marker.remove();
            }
            // 创建新的 marker 并添加到地图
            HeadValue.marker = new mapboxgl.Marker()
                .setLngLat(coordinates)
                .addTo(map.value);
        })
        .catch((error) => {
            console.error('请求失败:', error);
        });
}
