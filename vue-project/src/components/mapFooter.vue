<script setup>
</script>

<template>
    <div class="footer">
        <div class="row">
            <h2>About The Project</h2>
        </div>
        <div class="column2">
            <p>This web application consists of a map with geo-based multi-layer environmental modelling of urban
                traffic. The simulated noise data and traffic data are provided by the GEOMETRIC project.</p>
        </div>
        <div class="row">
            <h2>Meet The Team</h2>
        </div>
        <div class="column">
            <img src="../public/yu.png" style="width:50px;height:50px;border-radius:50%;" alt="Team member">
            <p>Yu Gao, 22, China. </p>
        </div>
        <div class="column">
            <img src="../public/alba.png" style="width:50px;height:50px;border-radius:50%;" alt="Team member">
            <p>Alba Lunner, 23, Sweden. </p>
        </div>
        <div class="column">
            <img src="../public/pelle.jpg" style="width:50px;height:50px;border-radius:50%;" alt="Team member">
            <p>Pelle Rauch, 25, Germany. </p>
        </div>
        <div class="column">
            <img src="../public/lola.jpg" style="width:50px;height:50px;border-radius:50%;" alt="Team member">
            <p>Lola Voignier-Simon, 22, France. </p>
        </div>

        
    </div>
</template>

<style scoped>
.footer {
    display: inline-grid;
    grid-template-columns: 25% 25% 25% 25%;
    position:relative;
    width: 100%;
    height: 30vh;
    padding: 10px;
    text-align: center;
    background: #ddd;
    overflow: auto;
  }
  
  .column2 {
    grid-column: 2 / span 2;
  }
  
  .column {
    display: flex;
    flex: 20%;
    align-items: center;
    justify-content: center;
    p{
        margin-left: 10px;
    }
  }
  
  .row {
    grid-column: 1 / 5;
    padding: 5px;
    font-family: 'Noto Serif'
  }
</style>
