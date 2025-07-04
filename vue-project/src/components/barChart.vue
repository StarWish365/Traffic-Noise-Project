<template>
    <div ref="chartRef" style="width: 400px; height:300px;"></div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, onBeforeUnmount, defineProps } from "vue";
  import * as echarts from "echarts";
  import { useValueStore } from "@/stores/HeadValue";
  const HeadValue = useValueStore()
  
  // 定义 props
  const props = defineProps({
    chartData: {
      type: Array,
      required: true,
      validator: (value) => value.length === 3, // 确保数据长度为 3
    },
    buildingName:String
  });
  
  const chartRef = ref(null);
  let myChart = null;
  
  // 初始化图表
  const initChart = () => {
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);
    updateChart();
  };
  
  // 更新图表数据
  const updateChart = () => {
    if (!myChart) return;
  
    const option = {
      title: {
        text: "Building Noise Exposure Population",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: ["1-25", "25-50", "50+"],
        name: "Total duration of exposure above threshold(65db)",
        nameLocation: "middle",
        nameTextStyle: {
        padding: [10, 0, 0, 0], // 调整名称位置
        },
      },
      yAxis: {
        type: "value",
        name: "Effected number of people",
        nameTextStyle: {
        padding: [0, 0, 0, 100], // 调整名称位置
        },
      },
      series: [
        {
          name: "counts",
          type: "bar",
          data: props.chartData,
          barWidth: "50%",
          itemStyle: {
            color: "#409EFF", // 柱状图颜色
          },
        },
      ],
    };
  
    myChart.setOption(option);
  };
  
  // 监听数据变化，动态更新图表
  watch(() => props.chartData, updateChart, { deep: true });
  // 组件挂载时初始化图表
  onMounted(() => {
    initChart();
    window.addEventListener("resize", () => myChart?.resize());
  });
  
  // 组件销毁时清除图表实例
  onBeforeUnmount(() => {
    window.removeEventListener("resize", () => myChart?.resize());
    myChart?.dispose();
  });
  </script>
  
  <style scoped>
  div {
    width: 100%;
    height: 400px;
  }
  </style>
  