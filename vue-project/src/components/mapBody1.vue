<script setup>
import { onMounted ,ref } from 'vue';
import mapboxgl from'mapbox-gl';
import { load_cars } from '@/composables/loadCars';
import { load_noice } from '@/composables/loadNoise';
import { useValueStore } from '@/stores/HeadValue';
import { getNoiseHistory } from '@/composables/noiseHistory';
import { getNextNoise } from '@/composables/changeChart';
import carLegend from './carLegend.vue';
import lineChart from './lineChart.vue';
import { ElButton } from 'element-plus';
import 'element-plus/es/components/button/style/css';
import factorBox from './factorBox.vue';
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
        minZoom:12,
        projection: 'mercator'
    });
    map.value.doubleClickZoom.disable();
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
    load_noice(currentTime.value,map,HeadValue.heatP,HeadValue.FramebufferFactor)
    if(HeadValue.idreceiver){
        getNextNoise(HeadValue.idreceiver,currentTime.value,HeadValue)
    }
    console.log("history:",HeadValue.history)
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
    if(timeout) clearTimeout(timeout);
    timer_on = 0;
    currentTime.value = 20001;
    if(map.value.getLayer('cars-layer')) map.value.removeLayer('cars-layer');
    if(map.value.getSource('cars')) map.value.removeSource('cars');
    if(map.value.getLayer('noise')) map.value.removeLayer('noise');
    HeadValue.resetHistory()
    if (HeadValue.marker) {
        HeadValue.marker.remove();
    }
}

</script>

<template>
    <div class="container">
        <div class = 'sidebar'>
            <factorBox/>
            <el-button type="primary" @click="startCount" class="button">Start</el-button>
            <el-button type="primary" @click="stopCount" class="button">Stop</el-button>
            <el-button type="primary" @click="refreshCount" class="button">Refresh</el-button>
            <p>timestep:{{ currentTime-1 }}</p>
        </div>
        <div id="mapid">
            <carLegend />
        </div>
        <div class="data-show">
            <h2>Noise History</h2>
            <lineChart />
        </div>
    </div>
</template>

<style scoped>

#mapid {
    padding: 20px;
    margin: auto;
    flex: 1;
    aspect-ratio: 1 / 1; 
    max-width: 100%;
    max-height: 100vh; 
    box-sizing: border-box;
}
.container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: space-between;
    background-color:aqua;
    margin-top:10px;
}
.sidebar{
    background-color: aliceblue;
    width: 300px;
    display: flex;
    flex-direction: column;
    padding-left: 10px;
    margin-left: -15px;
    .button {
        width: 150px;
        margin: 10px;
    }
    p{
        margin-left: 10px;
        font-size: 16px;
    }
}
.data-show{
    width: 400px;
    height: 100%;
    display: flex;
    justify-content: right;
    flex-direction: column;
    background-color: #f5f5f5;
    padding: 20px;
    box-sizing: border-box;
    margin-right: -15px;
}

</style>
