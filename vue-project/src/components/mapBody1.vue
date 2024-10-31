<script setup>
import { onMounted ,ref ,createApp} from 'vue';
import mapboxgl from'mapbox-gl';
import { load_cars } from '@/composables/loadCars';
import { load_noice } from '@/composables/loadNoise';
import { useValueStore } from '@/stores/HeadValue';
import { getNoiseHistory } from '@/composables/noiseHistory';
import { getNextNoise } from '@/composables/changeChart';
import AnimatedPopup from 'mapbox-gl-animated-popup';
import carLegend from './carLegend.vue';
import lineChart from './lineChart.vue';
import { ElButton,ElDrawer} from 'element-plus';
import 'mapbox-gl/dist/mapbox-gl.css'
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/drawer/style/css';
import factorBox from './factorBox.vue';
const HeadValue = useValueStore()
const map = ref(null);
const marker = ref(null)


onMounted(() => {
    // Set Mapbox Access Token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhcndpc2gzNjUiLCJhIjoiY20xMHQzeTQ0MGtyejJpczRxZmF2bXQ4eSJ9.zW7mqwq73g7PWUw5LKTQGw';
    const style = 'mapbox://styles/mapbox/dark-v11'
    // Load maps from Mapbox
    map.value = new mapboxgl.Map({
        container: 'mapid', 
        style: style, 
        center: [18.081889381459572, 59.31681882851151],
        zoom: 13,
        /* minZoom:12, */
        projection: 'mercator'
    });
    map.value.doubleClickZoom.disable();
   //添加控件
   map.value.on('load', () => {
      // 地图控件
      map.value.addControl(new mapboxgl.NavigationControl())
      map.value.addControl(new mapboxgl.FullscreenControl())
    })
    //set 3d buildings
    map.value.on('style.load', () => {
            // Insert the layer beneath any symbol layer.
            const layers = map.value.getStyle().layers;
            const labelLayerId = layers.find(
                (layer) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;

            // The 'building' layer in the Mapbox Streets
            // vector tileset contains building height data
            // from OpenStreetMap.
            map.value.addLayer(
                {
                    'id': 'add-3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',

                        // Use an 'interpolate' expression to
                        // add a smooth transition effect to
                        // the buildings as the user zooms in.
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId
            );
        });

    map.value.on('dblclick',async (e) => {
    // 创建一个空的 DOM 节点
    const container = document.createElement('div');

    // 将 Vue 组件挂载到该节点
    createApp(lineChart).mount(container);
    container.style.width = '400px';  // 设置宽度
    container.style.height = '100%'; // 设置高度
    const { lng, lat } = e.lngLat; // 获取双击位置的经纬度
    console.log(`双击坐标: 经度 ${lng}, 纬度 ${lat}`);
    await getNoiseHistory(lng, lat,currentTime.value,map,HeadValue,marker)
    let popup = new AnimatedPopup({
        maxWidth: '600px',
        offset: [-20, -50], 
        openingAnimation: {
            duration: 1000,
            easing: 'easeOutElastic',
            transform: 'scale'
        },
        closingAnimation: {
            duration: 300,
            easing: 'easeInBack',
            transform: 'scale'
        }
    }).setDOMContent(container)
    marker.value.setPopup(popup)
    });
});

let timeout;
let timer_on = 0;
const currentTime = ref(500);
let iscounting = ref(false);
const table = ref(false) //set for Drawbox
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
      iscounting.value = true
}
function stopCount() {
    clearTimeout(timeout);
    timer_on = 0;
    iscounting.value = false
    console.log(iscounting)
}
function refreshCount() {
    if(timeout) clearTimeout(timeout);
    iscounting.value = false
    timer_on = 0;
    currentTime.value = 500;
    if(map.value.getLayer('cars-layer')) map.value.removeLayer('cars-layer');
    if(map.value.getSource('cars')) map.value.removeSource('cars');
    if(map.value.getLayer('noise')) map.value.removeLayer('noise');
    HeadValue.resetHistory()
    if (marker.value) {
        marker.value.remove();
    }
}

</script>

<template>
    <div class="container">
        <div class = 'sidebar'>
            <div>
                <el-button type="primary" @click="startCount" class="button" v-show = '!iscounting'>Start</el-button>
                <el-button type="primary" @click="stopCount" class="button" v-show = 'iscounting'>Stop</el-button>
                <el-button type="primary" @click="refreshCount" class="button">Reset</el-button>
                <p>timestep:{{ currentTime-1 }}</p>
            </div>
        </div>
        <div id="mapid">
            <el-button @click="table = true" class ='mapbutton' circle>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
            </el-button>
            <carLegend />
            <el-drawer
                    v-model="table"
                    title="Setting the factors to create heatmap"
                    direction="ltr"
                    size="25%"
                    z-index=999
                    class = 'drawer'
                >
                <factorBox/>
                </el-drawer>
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
    .mapbutton {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
    }
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
    div{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
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
