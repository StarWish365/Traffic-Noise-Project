<script setup>
</script>

<template>
    <div class="header">
        <RouterLink :to="{name:'main'}">
            Traffic Noise Explorer
        </RouterLink>
    </div>
</template>

<style scoped>
   .header {
    background-color: #333;
    color: #fff;
    padding: 10px;
    text-align: center;
    text-decoration: none;
   }
   a {
    display: inline-block;;
    color: #fff;
    text-decoration: none;
    font-size: 35px;
    font-weight: bold;
    margin: 5px;
    padding: 5px;
    transition: .5s;
   }
   a:hover{
    color: #23e4ca;
   }
</style>
