<script setup>
</script>

<template>
  <div id="legend" class="map-legend">
    <h4>Cars Legend</h4>
    <div class="seperate-icon">
      <div class="car-legend">
        <div>
          <span style="background-color: #00ff00;"></span> &lt; 20km/h
        </div>
        <div>
          <span style="background-color: #ffa500;"></span> 20km-40km/h
        </div>
        <div>
          <span style="background-color: #ff0000;"></span> &gt; 40km/h
        </div>
      </div>
      <div class="car-legend">
        <div>
          <span style="background-color: #012fff; width: 18px; height: 18px;"></span> EV &lt; 20km/h
        </div>
        <div>
          <span style="background-color: #0824a1; width: 18px; height: 18px;"></span> EV 20km-40km/h
        </div>
        <div>
          <span style="background-color: #04135b; width: 18px; height: 18px;"></span> EV&gt; 40km/h
        </div>
      </div>
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
    <h4>Building Legend</h4>
    <div class="seperate-icon">
      <div class="car-legend">
        <div>
          <span style="background-color: #aaa;border-radius: 0%;"></span>No one lives or little noise exposure
        </div>
        <div>
          <span style="background-color: #Ffff00;border-radius: 0%;"></span> Low noise exposure
        </div>
        <div>
          <span style="background-color: #ffa500;border-radius: 0%;"></span> Medium noise exposure
        </div>
        <div>
          <span style="background-color: #ff0000;border-radius: 0%;"></span> High noise exposure
        </div>
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
.map-legend .seperate-icon {
  display: flex;
  flex-direction: row;
  gap: 3px;
}
.map-legend .seperate-icon .car-legend {
  margin: 5px;
}
.map-legend .seperate-icon .car-legend div {
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
  background: linear-gradient(to right, #5c68c4,#5fdc5f,#c15f4f);
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
