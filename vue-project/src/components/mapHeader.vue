<script setup>
import { useValueStore } from "@/stores/HeadValue";
const HeadValue = useValueStore()
// 按需引入 Element Plus 组件
import { ElSelect, ElOption, ElSwitch} from 'element-plus';
// 按需引入样式
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/switch/style/css';

// 定义下拉选项
const optionsVisualize = [
  { value: 'Speed', label: 'Speed' },
  { value: 'Acceleration', label: 'Acceleration' },
];

const optionsCellsize= [
  { value: '10', label: '10m' },
  { value: '20', label: '20m' },
  { value: '30', label: '30m' },
  { value: '40', label: '40m' },
  { value: '50', label: '50m' }
];

const optionsReduction= [
  { value: '1', label: '0%' },
  { value: '0.9', label: '10%' },
  { value: '0.8', label: '20%' },
  { value: '0.7', label: '30%' },
  { value: '0.6', label: '40%' }
];

const optionsRadius= [
  { value: '50', label: '50m'},
  { value: '75', label: '75m' },
  { value: '100', label: '100m' },
  { value: '125', label: '125m' },
  { value: '150', label: '150m' },
  { value: '200', label: '200m' }
];

function myFunction4() {
      if (HeadValue.car_id === null) {
        // 如果 car_id 为 null，重置开关按钮
        HeadValue.show_car_noice = false
        alert("You have not selected a Car! To select a Car please click on a specific Car and press the Select Button in the Pop-Up Window");
        return;
      }
}
</script>

<template>
    <div class="header">
        <h2><span class="headerc">Traffic Noise Explorer</span></h2>
        <!-- Select Visualisation-->
        <label for="cars"><span class="headera">Visualize:</span></label>
        <el-select v-model="HeadValue.sel" style="width: 150px">
            <el-option
            v-for="item in optionsVisualize"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>

        <!-- Select Cellsize-->
        <label for="framework2"><span class="headera">Cellsize: </span></label>
        <el-select v-model="HeadValue.cellsize" style="width: 150px">
            <el-option
            v-for="item in optionsCellsize"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>

        <h4><span class="headerb">Show Noise Distribution for Single Car:</span>
            <!-- swich between noise buffer around Car and the whole noise-->
            <el-switch v-model="HeadValue.show_car_noice" @change="myFunction4" />
        </h4>
        <!-- select noise reduction-->
        <label for="Noise_Red"><span class="headera">Reduction of Noise:</span></label>
        <el-select v-model="HeadValue.reduction" style="width: 150px" placeholder="0%">
            <el-option
            v-for="item in optionsReduction"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>

        <!-- select radius around car-->
        <label for="Radius"><span class="headera">Radius of Noisebuffer:</span></label>
        <el-select v-model="HeadValue.radius" style="width: 150px" placeholder="50m">
            <el-option
            v-for="item in optionsRadius"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
    </div>
</template>

<style scoped></style>
