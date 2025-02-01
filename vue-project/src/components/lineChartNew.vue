<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useValueStore } from '@/stores/HeadValue';

const HeadValue = useValueStore();

const chartRef = ref(null); // 获取 DOM 容器引用
let chartInstance = null; // 声明 ECharts 实例

// 初始化空数据
const emptyData = {
  laeq: [],
  timestepStart: 500, // 横坐标起始值 (timestep)
};

// 初始化图表函数
const initChart = (laeqData = emptyData.laeq) => {
  if (chartRef.value) {
    // 初始化 ECharts 实例
    chartInstance = echarts.init(chartRef.value);

    // 准备横坐标数据
    const timesteps = Array.from(
      { length: laeqData.length },
      (_, i) => emptyData.timestepStart + i // 生成横坐标的 timestep 数据
    );

    // 配置图表选项
    const option = {
        animation:false,
      title: {
        text: 'Noise History',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        nameLocation: 'middle',
        nameGap: 25,
        data: timesteps,
        axisTick: { show: false },
        axisLabel: { show: false }, // 隐藏刻度值
      },
      yAxis: {
        type: 'value',
        name: 'LAeq',
        nameLocation: 'middle',
        nameGap: 35,
        min:'dataMin',
        max:'dataMax',
        axisLabel: {
          formatter: '{value}',
        },
      },
      visualMap:{
        top:50,
        right:10,
        pieces: [
          {
            gt: 59,
            lte: 62,
            color: '#FD0100'
          },
          {
            gt: 62,
            lte: 65,
            color: '#AA069F'
          },
          {
            gt: 65,
            color: '#AC3B2A'
          }
        ],
        outOfRange: {
          color: '#999'
        }
      },
      dataZoom: [
            {
            type: 'slider', // 滑动条
            show: true,
            xAxisIndex: 0, // 针对 x 轴
            start: 0, 
            end: 100, 
            },
            {
            type: 'inside', // 内置缩放（鼠标滚轮等方式控制）
            xAxisIndex: 0,
            start: 0,
            end: 100,
            },
        ],
      series: [
        {
          name: 'LAeq Value',
          type: 'line',
          data: laeqData,
          smooth: true,
        },
      ],
    };

    // 设置图表选项
    chartInstance.setOption(option);

  }
};

// 更新图表
const updateChart = (laeqData) => {
  if (chartInstance) {
    // 准备横坐标数据
    const timesteps = Array.from(
      { length: laeqData.length },
      (_, i) => emptyData.timestepStart + i
    );

    // 更新图表数据
    chartInstance.setOption({
      xAxis: {
        data: timesteps,
      },
      series: [
        {
          data: laeqData,
        },
      ],
    });
  }
};

// 监听 `HeadValue.history` 数据的变化
watch(
  () => HeadValue.history, // 监听的数据
  (newHistory) => {
    if (newHistory && newHistory.length > 0) {
      updateChart(newHistory); // 有效数据时更新图表
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
    chartInstance.dispose(); // 销毁图表实例
    console.log('destroy chart');
  }
});

</script>

<template>
  <div class="chartBox">
    <div ref="chartRef" style="width:500px;height:400px;"></div>
  </div>
</template>

<style scoped>
.chartBox {
    width: 500px;
    height: 400px;
}
</style>
