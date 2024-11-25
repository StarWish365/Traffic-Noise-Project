<script setup>
</script>

<template>
<div id="legend" class="map-legend">
  <h4>Cars Legend</h4>
  <div><span style="background-color: #00ff00;"></span> < 20km/h</div>
  <div><span style="background-color: #ffa500;"></span> 20km-40km/h</div>
  <div><span style="background-color: #ff0000;"></span> >40km/h</div>
</div>
</template>

<style scoped>
.map-legend {
  background-color: white;
  padding: 10px;
  font-family: Arial, sans-serif;
  position: absolute;
  bottom: 30px;  /* 让图例固定在地图的底部 */
  left: 10px;
  z-index: 1;
  border-radius: 3px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  line-height: 18px;
  color: #333;
}

.map-legend h4 {
  margin: 0 0 10px;
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
</style>
