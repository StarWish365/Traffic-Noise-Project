<script setup>
</script>

<template>
  <div id="legend" class="map-legend">
    <h4>Cars Legend</h4>
    <div>
      <span style="background-color: #00ff00;"></span> &lt; 20km/h
    </div>
    <div>
      <span style="background-color: #ffa500;"></span> 20km-40km/h
    </div>
    <div>
      <span style="background-color: #ff0000;"></span> &gt; 40km/h
    </div>
    <div>
      <span style="background-color: #1938a4; width: 18px; height: 18px;"></span> e-cars
    </div>

    <!-- 热力图色条 -->
    <h4>Heatmap Legend</h4>
    <div class="heatmap-bar-container">
      <div class="heatmap-bar"></div>
      <div class="heatmap-labels">
        <span>30db</span>
        <span>70db</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-legend {
  background-color: white;
  padding: 10px;
  font-family: Arial, sans-serif;
  position: absolute;
  bottom: 30px; /* 让图例固定在地图的底部 */
  left: 10px;
  z-index: 1;
  border-radius: 3px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  line-height: 18px;
  color: #333;
}

.map-legend h4 {
  margin: 10px 0;
  font-size: 16px;
}

.map-legend div {
  display: flex;
  align-items: center;
}

.map-legend span {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 10px;
  border-radius: 50%;
}

/* 热力图渐变色条 */
.heatmap-bar-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heatmap-bar {
  width: 100%;
  height: 15px;
  border-radius: 5px;
  background: linear-gradient(to right, #5c68c4, #c15f4f);
  border: 1px solid #ccc;
}

.heatmap-labels {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 5px;
  color: #333;
}
</style>
