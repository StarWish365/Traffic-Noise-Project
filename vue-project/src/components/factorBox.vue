<script setup>
import { useValueStore } from "@/stores/HeadValue";
const HeadValue = useValueStore()
// 按需引入 Element Plus 组件
import { ElSelect,ElOption,ElTooltip} from 'element-plus';
// 按需引入样式
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/theme-chalk/el-tooltip.css'; 
// 定义下拉选项
const optionsVisualize = [
  { value: 'Speed', label: 'Speed' },
  { value: 'Acceleration', label: 'Acceleration' },
];
const optionsHeatP= [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' }
];
const optionFramebufferFactor= [
  { value: '0.1', label: '0.1' },
  { value: '0.3', label: '0.3' },
  { value: '0.5', label: '0.5' },
  { value: '0.7', label: '0.7' },
  { value: '0.9', label: '0.9' }
];
</script>

<template>
    <h3>Enter Factor</h3>
    <div class="factor-container">
        <el-tooltip content="Select whether to classify vehicles by speed or acceleration" placement="top-start">
            <span>Visualize:</span>
        </el-tooltip>
        <el-select v-model="HeadValue.sel" style="width: 150px">
            <el-option
            v-for="item in optionsVisualize"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
    </div>
    <h4>Heatmap Factor</h4>
    <div class = "factor-container">
        <el-tooltip placement="top-start">
            <template #content> Number affecting the computation of the color. <br /> A high value makes the color uniform around each point.</template>
            <span>P:</span>
        </el-tooltip>
        <el-select v-model="HeadValue.heatP" style="width: 150px">
            <el-option
            v-for="item in optionsHeatP"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
    </div>

    <div class = "factor-container">
        <el-tooltip placement="top-start">
            <template #content> If the framebuffer factor is around 0, <br /> the computation of the IDW algorithm will be faster<br/>but with a lower resolution.</template>
            <span>FramebufferFactor:</span>
        </el-tooltip>
        <el-select v-model="HeadValue.FramebufferFactor" style="width: 150px">
            <el-option
            v-for="item in optionFramebufferFactor"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
    </div>
    

</template>

<style scoped>
.factor-container{
    display: flex;
    align-items: center;
    margin: 10px;
    span{
        margin-right: 10px;
        font-size: 16px;
    }
}
</style>
