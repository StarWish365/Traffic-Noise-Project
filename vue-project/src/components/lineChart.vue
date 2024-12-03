<template>
  <h3>Noise History</h3>
  <div class="container">
    <canvas ref="chartCanvas" class="linechart"></canvas>
    <div class="factor-box">
      <div class="noise-factor">
        <span>max noise</span> <br/>
        <span>{{ Math.max(...HeadValue.history) }}dB</span>
      </div>
      <div class="noise-factor">
        <span>min noise</span> <br/>
        <span>{{ Math.min(...HeadValue.history) }}dB</span>
      </div>
    </div>
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


const chartCanvas = ref(null); // 获取 Canvas 的引用

let chartInstance; // 声明 Chart.js 实例

// 初始化空数据
const emptyData = {
  laeq: [],
  timestepStart: 500, // 横坐标起始值 (timestep)
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
    chartInstance = new Chart(ctx, {
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
          duration: 0// 禁用动画
        },
        scales:{
          x:{
            title:{
              display:true,
              text:'timestep'
            },
            ticks:{
              display:false,
              maxTicksLimit: 5 // 限制 X 轴刻度数量
            }
          },
          y:{
            title:{
              display:true,
              text:'laeq'
            },
            ticks:{
              display:true
            }
          }
        }
      }
    });
  }
};


const updateChart = (laeqData) => {
  if (chartInstance) {
    chartInstance.data.labels = Array.from(
      { length: laeqData.length },
      (_, i) => emptyData.timestepStart + i // 重新生成 timestep 数据
    );
    chartInstance.data.datasets[0].data = laeqData; // 重新设置 laeq 值
    chartInstance.update(); // 重新绘制图表
  }
}


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
  if (chartInstance) {
    chartInstance.destroy();
    console.log("destroy chart")
  }
});
</script>

<style scoped>
h3 {
  text-align: center;
}

.container {
  width: 510px; /* 固定宽度 */
  height: 250px;
  display: flex;
  flex-wrap: nowrap; /* 避免子项换行 */
  overflow: hidden; /* 防止子项溢出 */
}

.linechart{
  max-width: 400px;
  height: 250px;
}
.factor-box {
  flex: 0 0 100px; /* 固定宽度 */
  background-color: pink;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
