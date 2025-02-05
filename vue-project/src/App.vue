<script setup>
import mapHeader from './components/mapHeader.vue';
import mapFooter from './components/mapFooter.vue';
</script>

<template>
  <mapHeader></mapHeader>
  <router-view></router-view>
  <mapFooter></mapFooter>
</template>

<style scoped></style>
