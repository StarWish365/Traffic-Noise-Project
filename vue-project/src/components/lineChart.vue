<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale} from 'chart.js';
import { useValueStore } from '@/stores/HeadValue';

// 使用 Pinia store
const HeadValue = useValueStore();

// 注册必要的 Chart.js 组件
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const chartInstance = ref(null); // 保存 Chart.js 实例
const chartCanvas = ref(null); // 获取 Canvas 的引用

// 初始化空数据
const emptyData = {
  laeq: [],
  timestepStart: 20001, // 横坐标起始值 (timestep)
};

// 初始化图表函数
const initChart = (laeqData = emptyData.laeq) => {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d'); // 确保 canvas 渲染后获取上下文
    const timesteps = Array.from(
      { length: laeqData.length },
      (_, i) => emptyData.timestepStart + i // 生成横坐标的 timestep 数据
    );

    // 创建 Chart.js 折线图
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timesteps, // 横坐标数据
        datasets: [{
          label: 'LAeq Values',
          data: laeqData, // 纵坐标 laeq 值
          fill: false,
          borderColor: 'rgb(75, 192, 192)', // 线条颜色
          tension: 0.1 // 曲线的张力
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 0 // 禁用动画
        }
      }
    });
  }
};

// 重新绘制图表
const updateChart = (laeqData) => {
  if (chartInstance.value) {
    chartInstance.value.destroy(); // 销毁旧的图表实例
  }
  initChart(laeqData); // 使用新数据重新创建图表
};
// 重新更新图表
/* const updateChart = (laeqData) => {
  if (chartInstance.value) {
    // 更新图表的数据
    const timesteps = Array.from(
      { length: laeqData.length },
      (_, i) => emptyData.timestepStart + i // 生成新的time数据
    );
    // 更新图表的 labels 和 data
    chartInstance.value.data.labels = timesteps; // 更新横坐标（time）
    chartInstance.value.data.datasets[0].data = laeqData; // 更新纵坐标（laeq）
    console.log(chartInstance.value.data.labels,chartInstance.value.data.datasets[0].data)
  }
  if (chartInstance.value) {
      chartInstance.value.update(); // 仅更新图表而不销毁
    }
}; */


// 监听 `HeadValue.history` 数据的变化
watch(
  () => HeadValue.history, // 监听的数据
  (newHistory) => {
    if (newHistory && newHistory.length > 0) {
      updateChart(newHistory); // 有效数据时重新绘制图表
    } else {
      updateChart(emptyData.laeq); // 没有数据时显示空图表
    }
  },
  { immediate: true } // 初始时立即执行一次
);


// 初始化和销毁图表
onMounted(async () => {
  // 等待 DOM 渲染完成
  await nextTick();
  initChart(); // 初始化空图表
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
