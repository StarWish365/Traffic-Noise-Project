<script setup>
import { onMounted ,ref ,createApp,provide} from 'vue';
import mapboxgl from'mapbox-gl';
import request from '@/utils/request'
import { useValueStore } from '@/stores/HeadValue';
import { getNoiseHistory } from '@/composables/noiseHistory';
import { getBuildingId} from '@/composables/getBuildingId';
import { getReceiverstoBuilding } from '@/composables/getReceiverstoBuilding';
import { analyzeOverNoise } from '@/composables/analyseOvernoise';
import { loadBuildings } from '@/composables/loadBuildings';
import AnimatedPopup from 'mapbox-gl-animated-popup';
import carLegend from '@/components/carLegend.vue';
import lineChart from '@/components/lineChartNew.vue';
import barChart from '@/components/barChart.vue';
import progressBar from '@/components/progressBar.vue';
import layerControl from '@/components/layerControl.vue';
import ecarControl from '@/components/ecarControl.vue';
import { ElButton,ElDrawer} from 'element-plus';
import 'mapbox-gl/dist/mapbox-gl.css'
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/drawer/style/css';
import factorBox from '@/components/factorBox.vue';
import controlBox from '@//components/controlBox.vue';
import InstructionDialog from '@/components/InstructionDialog.vue'


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
        center: [18.05063098207004, 59.31738134579155],
        zoom: 15,
        /* minZoom:12, */
        projection: 'mercator'
    });
    map.value.doubleClickZoom.disable();
    map.value.addControl(new mapboxgl.ScaleControl(),'top-right');
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
                        'fill-extrusion-color': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false], // 检查 feature-state: hover 是否为 true
                            '#ff6600', // 悬停时的颜色（橙色）
                            '#aaa' // 默认颜色
                        ],

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
                        'fill-extrusion-opacity': 0
                    }
                },
                labelLayerId
            );
        });
        let hoveredBuildingId = null;
    

        // 监听鼠标移动事件
        map.value.on('mousemove', 'add-3d-buildings', (e) => {
            if (e.features.length > 0) {
                const buildingId = e.features[0].id;
                map.value.getCanvas().style.cursor = 'pointer';

                if (hoveredBuildingId !== null && hoveredBuildingId !== buildingId) {
                    map.value.setFeatureState(
                        { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
                        { hover: false }
                    );
                }

                hoveredBuildingId = buildingId;

                map.value.setFeatureState(
                    { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
                    { hover: true }
                );
            }
        });

        // 监听点击事件
        map.value.on('click', 'add-3d-buildings', async(e) => {
            /* console.log(e.features[0]); */
            const polygon = e.features[0].geometry.coordinates
            const buildingID = await getBuildingId(polygon)
            if(!buildingID || buildingID.length === 0) return
            const buildingName =`building${buildingID}`
            const ans = analyzeOverNoise(HeadValue.receiverstoBuilding[buildingName])
            //设置建筑信息弹窗
            // 创建一个空的 DOM 节点
            const container = document.createElement('div');
            // 将 Vue 组件挂载到该节点
            createApp(barChart,{ chartData: ans,buildingName }).mount(container);
            container.style.width = '100%';  // 设置宽度
            container.style.height = '100%'; // 设置高度
            new AnimatedPopup({
                maxWidth: '600px',
                offset: [-20, -30], 
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
            }).setLngLat(e.lngLat) // 设置 Popup 位置为点击的点
                .setDOMContent(container) // 显示内容
                .addTo(map.value);
        })

        // 监听鼠标离开事件
        map.value.on('mouseleave', 'add-3d-buildings', () => {
            if (hoveredBuildingId !== null) {
                map.value.setFeatureState(
                    { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
                    { hover: false }
                );
            }
            hoveredBuildingId = null;
            map.value.getCanvas().style.cursor = '';
        });
    //添加建筑图层（自定义）
        map.value.on('load',async function () {
        // 添加数据源
        const geojsondata = await loadBuildings()
        map.value.addSource('buildings', {
            'type': 'geojson',
            'data': {
                "type": "FeatureCollection",
                "features": geojsondata
            }
        });

        // 添加填充图层
        map.value.addLayer({
            'id': 'buildings-fill',
            'type': 'fill',
            'source': 'buildings',
            'minzoom': 15,
            'paint': {
                'fill-color': ['get', 'color'], // 从 properties 读取颜色
                'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.6,  // 悬停时的不透明度
                1   // 默认不透明度
            ]
            }
        });
        // 当前悬停的要素ID
    let hoveredBuildingId = null;

    // 鼠标移动事件处理
    map.value.on('mousemove', 'buildings-fill', (e) => {
        if (e.features.length > 0) {
            // 如果有悬停的要素，重置之前悬停的要素样式
            if (hoveredBuildingId !== null) {
                map.value.setFeatureState(
                    { source: 'buildings', id: hoveredBuildingId },
                    { hover: false }
                );
            }
            
            // 设置新悬停要素的样式
            hoveredBuildingId = e.features[0].id;
            map.value.setFeatureState(
                { source: 'buildings', id: hoveredBuildingId },
                { hover: true }
            );
            
            // 更改鼠标指针样式
            map.value.getCanvas().style.cursor = 'pointer';
        }
    });

    // 鼠标离开图层区域时
    map.value.on('mouseleave', 'buildings-fill', () => {
        if (hoveredBuildingId !== null) {
            map.value.setFeatureState(
                { source: 'buildings', id: hoveredBuildingId },
                { hover: false }
            );
        }
        hoveredBuildingId = null;
        map.value.getCanvas().style.cursor = '';
    });
});

    map.value.on('dblclick',async (e) => {
    // 创建一个空的 DOM 节点
    const container = document.createElement('div');
    // 将 Vue 组件挂载到该节点
    createApp(lineChart).mount(container);
    container.style.width = '510px';  // 设置宽度
    container.style.height = '100%'; // 设置高度
    const { lng, lat } = e.lngLat; // 获取双击位置的经纬度
    console.log(`双击坐标: 经度 ${lng}, 纬度 ${lat}`);
    await getNoiseHistory(lng, lat,map,HeadValue,marker)
    let popup = new AnimatedPopup({
        maxWidth: '600px',
        offset: [-20, -30], 
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
    getReceiverstoBuilding(HeadValue)
});
let currentTime = ref(500)
const table = ref(true) //set for Drawbox
HeadValue.currentTime = currentTime
//传递给子组件
provide('currentTime',currentTime)
provide('map',map)
provide('marker',marker)

// 生成唯一 userId（如果不存在）
function getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("userId", userId);
    }
    return userId;
}

const userId = getUserId();
console.log("用户 ID:", userId);
//请求生成临时表
request.get('connect')
//关闭页面自动删除临时表

window.addEventListener("beforeunload", function () {
    const userId = localStorage.getItem("userId");
    if (userId) {
        /* navigator.sendBeacon("http://localhost:3000/api/logout", JSON.stringify({ userId })); */
        navigator.sendBeacon("/api/logout", JSON.stringify({ userId }));
    }
});

const controlRef = ref()
provide('controlRef', controlRef)
provide('tableRef',table)


</script>

<template>
    <div id="mapid">
        <controlBox ref="controlRef"/>
        <InstructionDialog />
        <el-button @click="table = true" class ='factorbutton' circle>
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
                z-index= 1
                class = 'drawer'
            >
            <factorBox/>
            <layerControl/>
            <ecarControl/>
        </el-drawer>
        <progressBar/>
    </div>
</template>

<style scoped>

#mapid {
    position: relative;
    padding: 20px;
    margin: auto;
    flex: 1;
    /* aspect-ratio: 1 / 1;
    max-width: 100%;
    max-height: 100vh;  */
    height: 90vh;
    width: 100%;
    box-sizing: border-box;
    .factorbutton {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
    }
}

.container {
    width: 100%;
    height: 80vh;
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
    p{
        margin-left: 10px;
        font-size: 16px;
    }
}
.button {
    width: 150px;
    margin: 10px;
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
