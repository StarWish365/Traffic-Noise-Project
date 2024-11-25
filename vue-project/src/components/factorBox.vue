<script setup>
import { useValueStore } from "@/stores/HeadValue";
const HeadValue = useValueStore()
// 按需引入 Element Plus 组件
import {ElTooltip,ElSlider} from 'element-plus';
// 按需引入样式
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/slider/style/css';
import 'element-plus/theme-chalk/el-tooltip.css'; 
</script>

<template>
    
    <h3>Heatmap Factor</h3>

    <div class = "factor-container">
        <el-tooltip placement="top-start">
            <template #content> Number affecting the computation of the color. <br /> A high value makes the color uniform around each point.</template>
            <span>P:</span>
        </el-tooltip>
        <el-slider v-model="HeadValue.heatP" :step="1" :max=10 style="margin-left: 10px;" />
    </div>

    <div class = "factor-container">
        <el-tooltip placement="top-start">
            <template #content> If the framebuffer factor is around 0, <br /> the computation of the IDW algorithm will be faster<br/>but with a lower resolution.</template>
            <span>FramebufferFactor:</span>
        </el-tooltip>
        <el-slider v-model="HeadValue.FramebufferFactor" :step="0.1" :max=1 style="margin-left: 10px;" />
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
