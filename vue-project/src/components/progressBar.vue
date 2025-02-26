<template>
    <transition name="fade">
      <div
        v-show="isVisible"
        class="hover-panel"
        @mouseleave="hidePanel"
      >
        <p>Timeline</p>
        <el-slider v-model="currentTime" :step="1" :min=500 :max=800 />
      </div>
    </transition>


  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount,nextTick,inject,watch} from 'vue'
  import { ElSlider } from 'element-plus'
  import { processNoiseData } from '@/composables/getReceiverstoBuilding';
  import { useValueStore } from '@/stores/HeadValue';
  import { load_cars } from '@/composables/loadCars';
  import { load_noice } from '@/composables/loadNoise';
  import 'element-plus/es/components/slider/style/css';

  const HeadValue = useValueStore()

  const currentTime = inject('currentTime')
  const map = inject('map')
  let previousTime = 0 // 记录上一次时间
  // 防抖函数
  function debounce(func, delay) {
    let timer = null
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
  }

  //更新函数
const refreshMapValue = async()=>{
  await processNoiseData(HeadValue,currentTime.value)
  updateBuildingColors(HeadValue.receiverstoBuilding,map)
  load_noice(currentTime.value,map,HeadValue)
  load_cars(currentTime.value,map,HeadValue.sel,HeadValue);
}
  // 防抖函数
  const debouncedLogTime = debounce(refreshMapValue, 2000)

  // 监听 currentTime 变化
  watch(currentTime, (newValue) => {
  const timeDifference = Math.abs(newValue - previousTime)

  // 只有当时间变化超过 5 秒才会触发
  if (timeDifference > 5 && currentTime.value!==500) {
    previousTime = newValue
    debouncedLogTime()
  }
})



//更新建筑颜色
function updateBuildingColors(buildingData, map) {
    let source = map.value.getSource('buildings');
    if (!source) return;
    let data = source._data; // 获取当前 GeoJSON 数据

    // 遍历 buildingData 对象
    Object.keys(buildingData).forEach(buildingKey => {
        const building = buildingData[buildingKey];
        const buildingId = parseInt(buildingKey.replace('building', ''), 10); // 提取 building ID

        // 根据 highlight 设置颜色
        let newColor = '#7a7a7a'; // 默认颜色
        if (building.highlight === 1) {
            newColor = '#FFFF00'; // 黄色
        } else if (building.highlight === 2) {
            newColor = '#FFA500'; // 橙色
        } else if (building.highlight === 3) {
            newColor = '#FF0000'; // 红色
        }

        // 找到对应的 Feature
        let feature = data.features.find(f => f.id === buildingId);

        if (feature) {
            feature.properties.color = newColor; // 直接修改目标 Feature 的颜色
        }
    });

    // 最后统一更新数据
    source.setData(data);
}

    
  const isVisible = ref(false)
  let parentElement = null
  
  const showPanel = () => {
    isVisible.value = true
  }
  
  const hidePanel = () => {
    isVisible.value = false
  }
  const handleMouseMove = (event) => {
  if (!parentElement) return

  const rect = parentElement.getBoundingClientRect()
  const mouseY = event.clientY

  // 检查鼠标是否在父组件底部 50px 区域内
  if (mouseY > rect.bottom - 200 && mouseY < rect.bottom) {
    showPanel()
  } else {
    hidePanel()
  }
}

onMounted(async () => {
  // 确保父组件完全挂载之后再执行
  await nextTick()
  parentElement = document.getElementById('mapid')
  if (parentElement) {
    parentElement.addEventListener('mousemove', handleMouseMove)
  }
})

onBeforeUnmount(() => {
  if (parentElement) {
    parentElement.removeEventListener('mousemove', handleMouseMove)
  }
})
  
  </script>
  
  <style scoped>
  .hover-panel {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    z-index: 1;
    height: 100px;
    background-color: rgba(0, 0, 0, 0.7); /* 半透明黑色背景 */
    backdrop-filter: blur(5px);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    padding: 20px;
    color: white;
    transition: all 0.3s ease;
  }
  
  /* 渐隐渐显效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  