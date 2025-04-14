<template>
    <div class="layer-control">
        <h3>Layer Control</h3>
      <el-checkbox
        v-for="layer in layers"
        :key="layer.id"
        v-model="layer.visible"
        :disabled="!layer.avaliable"
        @change="toggleLayerVisibility(layer.id, layer.visible)"
        :label="layer.name"
        class="layer-checkbox"
      >
        {{ layer.name }}
      </el-checkbox>
      <el-checkbox class = 'layer-checkbox' v-model="HeadValue.heatLayercontrol" @change="controlHeatmap">
        Heatmap Layer
      </el-checkbox>
    </div>
  </template>
  
  <script setup>
  import { inject, reactive, watchEffect } from 'vue';
  import { ElCheckbox} from 'element-plus';
  import 'element-plus/es/components/checkbox/style/css';
  import { useValueStore } from '@/stores/HeadValue';
  import { load_noice } from '@/composables/loadNoise';
  const HeadValue = useValueStore()


  const map = inject('map');
  const currentTime = inject('currentTime');
  const layers = reactive([
    { id: 'add-3d-buildings', name: 'Building', visible: true , avaliable: true},
    { id: 'noise-receivers', name: 'Receivers', visible: false, avaliable: false },
    { id: 'cars-layer', name: 'Cars', visible: true ,avaliable: false},
  ]);
  
  // 监听地图的图层加载情况，动态显示相关的复选框
  watchEffect(() => {
    layers.forEach(layer => {
      if (map.value && map.value.getLayer(layer.id)) {
        layer.avaliable = true
      }else{
        layer.avaliable = false;
        if(layer.id=='noise-receivers'){
          layer.visible = false
        }
      }
    });
  });
  
  // 切换图层的显示/隐藏状态
  function toggleLayerVisibility(layerId, isVisible) {
    if (map.value) {
      const visibility = isVisible ? 'visible' : 'none';
      map.value.setLayoutProperty(layerId, 'visibility', visibility);
    }
  }

  const controlHeatmap = ()=>{
    if(map.value.getLayer('noise') && !HeadValue.heatLayercontrol){
      map.value.removeLayer('noise');
      map.value.removeLayer('noise-receivers');
      map.value.removeSource('receivers');
    } 
    if(!map.value.getLayer('noise') && HeadValue.heatLayercontrol) load_noice(currentTime.value,map,HeadValue)
  }
  </script>
  
  <style scoped>
  .layer-control {
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .layer-checkbox {
    width: 100px;
  }

  </style>
  