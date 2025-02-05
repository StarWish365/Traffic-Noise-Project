<script setup>
import { inject, ref} from 'vue';
import { ElButton } from 'element-plus';
import { load_cars } from '@/composables/loadCars';
import { load_noice } from '@/composables/loadNoise';
import { getNextNoise } from '@/composables/changeChart';
import { useValueStore } from '@/stores/HeadValue';
const HeadValue = useValueStore();
import 'element-plus/es/components/button/style/css';



const map = inject('map');
const marker = inject('marker');
const currentTime = inject('currentTime');
let timeout;
let timer_on = 0;
let iscounting = ref(false);
//console.log(map)
function cars_move() {
    load_cars(currentTime.value,map,HeadValue.sel,HeadValue);
    if(HeadValue.heatLayercontrol){
        load_noice(currentTime.value,map,HeadValue)
    }

    if(HeadValue.idreceiver){
        getNextNoise(HeadValue.idreceiver,currentTime.value,HeadValue)
    }
    //console.log("history:",HeadValue.history)
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
}
function refreshCount() {
    if(timeout) clearTimeout(timeout);
    iscounting.value = false
    timer_on = 0;
    currentTime.value = 500;
    if(map.value.getLayer('cars-layer')) map.value.removeLayer('cars-layer');
    if(map.value.getSource('cars')) map.value.removeSource('cars');
    if(map.value.getLayer('noise')) map.value.removeLayer('noise');
    if(map.value.getLayer('noise-receivers')) map.value.removeLayer('noise-receivers');
    if(map.value.getSource('receivers')) map.value.removeSource('receivers');
    HeadValue.resetHistory()
    if (marker.value) {
        marker.value.remove();
    }
}

</script>

<template>
    <div class="controlBox">
        <el-button @click="startCount" v-if = '!iscounting' class="button"  circle>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
        </el-button>
        <el-button @click="stopCount" v-if= 'iscounting' class="button"  circle>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
        </el-button>
        <el-button @click="refreshCount" class="button" circle>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        </el-button>
        <p>timestep:{{ currentTime-1 }}</p>
    </div>
</template>

<style scoped>
.controlBox {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    padding: 15px; /* 增加内边距 */
    bottom: 25px;
    right: 10px;
    border-radius: 8px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15); 
}

.controlBox .button {
    width: 50px;
    height: 50px;
    font-size: 14px;
    margin: 10px;
}

.controlBox p {
    font-size: 16px;
    color: #333;
    margin: 5px 0 0; /* 调整文字的上边距 */
}
</style>
