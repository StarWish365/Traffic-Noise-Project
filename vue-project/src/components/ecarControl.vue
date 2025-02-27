<script setup>
// 按需引入 Element Plus 组件
import { ElTooltip, ElSlider, ElButton } from 'element-plus';
// 按需引入样式
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/slider/style/css';
import 'element-plus/es/components/button/style/css';
import 'element-plus/theme-chalk/el-tooltip.css';
import request from '@/utils/request';
import { ref } from "vue";

const ecarRatio = ref(0);
const response = ref('');
const showResponse = ref(false); // 控制淡入淡出

const changeECarRatio = async () => {
    try {
        const res = await request.get(`change_ecar_ratio?ratio=${ecarRatio.value}`);
        response.value = res.data.success ? 'Success' : 'Failed';

        // 触发淡入效果
        showResponse.value = true;

        // 2秒后淡出
        setTimeout(() => {
            showResponse.value = false;
        }, 2000);
    } catch (e) {
        response.value = 'Failed';
        showResponse.value = true;
        console.error(e);

        setTimeout(() => {
            showResponse.value = false;
        }, 2000);
    }
};
</script>

<template>
    <h3>Control e-Car Ratio</h3>

    <div class="factor-container">
        <div class = 'slider-container'>
            <el-tooltip placement="top-start">
            <template #content>
                Number affecting the computation of the color. <br /> A high value makes the color uniform around each point.
            </template>
            <span>Ratio</span>
            </el-tooltip>

            <el-slider v-model="ecarRatio" :step="0.1" :max="1" class="slider" />

            <div class="button-container">
                <el-button type="primary" @click="changeECarRatio">Confirm</el-button>
            </div>
        </div>
        <transition name="fade">
            <p v-if="showResponse" class="response-text">{{ response }}</p>
        </transition>
    </div>
</template>

<style scoped>
/* 容器整体美化 */
.factor-container {
    display: flex;
    flex-direction: column;
    margin: 20px auto;
}

.slider-container {
    display: flex;
    flex-direction: row;
    align-items:center;
    gap: 10px;
}

/* 提示文本美化 */
span {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.el-button {
    width: 100%;
}

/* response 的淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.8s;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

/* response 文字样式 */
.response-text {
    margin-top: 10px;
    padding: 10px;
    font-size: 16px;
    color: black;
    border-radius: 5px;
    text-align: center;
    width: 100%;
    transition: all 0.3s ease;
}
</style>
