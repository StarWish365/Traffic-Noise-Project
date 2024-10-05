<script setup>
import { onMounted ,ref } from 'vue';
import mapboxgl from'mapbox-gl';
import { load_cars } from '@/composables/loadCars';
import { load_noice } from '@/composables/loadNoise';
import { useValueStore } from '@/stores/HeadValue';
import { getNoiseHistory } from '@/composables/noiseHistory';
import carLegend from './carLegend.vue';
import lineChart from './lineChart.vue';
import { ElButton } from 'element-plus';
import 'element-plus/es/components/button/style/css';
const HeadValue = useValueStore()
const map = ref(null);


onMounted(() => {
    // Set Mapbox Access Token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhcndpc2gzNjUiLCJhIjoiY20xMHQzeTQ0MGtyejJpczRxZmF2bXQ4eSJ9.zW7mqwq73g7PWUw5LKTQGw';

    // Load maps from Mapbox
    map.value = new mapboxgl.Map({
        container: 'mapid', 
        style: 'mapbox://styles/mapbox/dark-v11', 
        center: [18.081889381459572, 59.31681882851151], 
        zoom: 13,
        projection: 'mercator'
    });
    map.value.on('dblclick', (e) => {
    const { lng, lat } = e.lngLat; // 获取双击位置的经纬度
    console.log(`双击坐标: 经度 ${lng}, 纬度 ${lat}`);
    getNoiseHistory(lng, lat,currentTime.value,map,HeadValue)
    console.log("laeq:",HeadValue.history)
    });
});

let timeout;
let timer_on = 0;
const currentTime = ref(20001);

//console.log(map)
function cars_move() {
    load_cars(currentTime.value,map,HeadValue.sel);
    load_noice(currentTime.value,map)
    currentTime.value++;
    timeout = setTimeout(cars_move, 1000);
}

function startCount() {
      if (!timer_on) {
        timer_on = 1;
        cars_move();
        console.log("start count")
      }
}
function stopCount() {
    clearTimeout(timeout);
    timer_on = 0;
}
function refreshCount() {
    currentTime.value = 20001;
    map.value.removeLayer('cars-layer');
    map.value.removeSource('cars');
    map.value.removeLayer('noise');
}

</script>

<template>
    <el-button type="primary" @click="startCount">Start</el-button>
    <el-button type="primary" @click="stopCount">Stop</el-button>
    <el-button type="primary" @click="refreshCount">Refresh</el-button>
    <p>timestep:{{ currentTime-1 }}</p>
    <div id="mapid" style="width: 100%; height: 700px;margin:auto;padding: 20px;">
    </div>
    <carLegend />
    <lineChart />
</template>

<style scoped>

</style>
