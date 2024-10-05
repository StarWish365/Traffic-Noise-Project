<script setup>
import { onMounted,ref} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import axios from 'axios';
import { useValueStore } from '@/stores/HeadValue';
const HeadValue = useValueStore();
const noice = ref(null);
const map = ref(null);
const currentTime = ref(20001)
onMounted(() => {
    map.value = L.map('mapid').setView([59.31681882851151, 18.081889381459572], 15);
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' })
    osm.addTo(map.value);
    //console.log(map)
})

const greenCar = new L.Icon({
  iconUrl: './src/public/greencar.png', 
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const redCar = new L.Icon({
  iconUrl: './src/public/redcar.png', 
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const orangeCar = new L.Icon({
  iconUrl: './src/public/orangecar.png', 
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const elecCar = new L.Icon({
  iconUrl: './src/public/ecar.png', 
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});


function getCarsLayerSize() {
  let count = 0;
  if (cars) {
    cars.eachLayer(() => {
      count++;
    });
  }
  return count;
}
    var cars;
//get Cars from DB
function load_cars(time) {
    axios.get('http://localhost:3000/api/get_cars_time?time=' + time).then( response => {
    if (cars) {
        console.log('Before clear, cars size:', getCarsLayerSize());
        cars.clearLayers();
        map.value.removeLayer(cars);
        console.log('after clear, cars size:', getCarsLayerSize());
    } 
        // 请求成功，处理响应
        cars = L.geoJSON(response.data[0].row_to_json, {
        pointToLayer: function (feature, latlng) {
            if (feature.properties.type === 'veh_passenger') {
            if (HeadValue.sel === "Speed") {
                if (feature.properties.speed < 5.55) {
                return L.marker(latlng, { icon: greenCar });
                } else if (feature.properties.speed < 11.11) {
                return L.marker(latlng, { icon: orangeCar });
                } else {
                return L.marker(latlng, { icon: redCar });
                }
            } else if (HeadValue.sel === "Acceleration") {
                if (feature.properties.acceleration > 0) {
                return L.marker(latlng, { icon: greenCar });
                } else {
                return L.marker(latlng, { icon: redCar });
                }
            }
            } else if (feature.properties.type === 'veh_passenger_e') {
            return L.marker(latlng, { icon: elecCar });
            }
        }
        });

        if (cars) {
        cars.addTo(map.value).on('click', function (e) {
            open_carpopup(e);
        });
        }
    }).catch(error => {
        console.log('Error fetching cars:', error);
    }) 
}

function open_carpopup(e) {
      var popupLocation = new L.LatLng(e.latlng.lat, e.latlng.lng);
      var popupContent =
        " <div id='report'>" +
        "<h1 class= ' report-title '>" + "Information" + " </h1>" +
        "<p id= 'report-field-id'>" +
        " <span class= 'report-field-label'> ID: </ span >" +
        " <span class= 'report-field-value'>" + e.layer.feature.properties.id + "</span>" +
        "</p>" +
        "<p id= 'report-field-speed'>" +
        "<span class= ' report-field-label '> Speed: </span>" +
        "<span class= ' report-field-value '>" + e.layer.feature.properties.speed + "</span>" +
        "</p>" +
        "<p id= 'report-field-acceleration'>" +
        " <span class= 'report-field-label'> Acceleration: </ span >" +
        " <span class= 'report-field-value'>" + e.layer.feature.properties.acceleration + "</span>" +
        "</p>" +
        "<p id= 'report-field-type'>" +
        " <span class= 'report-field-label'> Type of Vehicle: </ span >" +
        " <span class= 'report-field-value'>" + e.layer.feature.properties.type + "</span>" +
        "</p>" +
        " <div class= 'report-btns'>" +
        " <button id= 'change-button'>Change Type of Car</button><br>" +
        " </div>" +
        " <div class= 'report-btns'>" +
        " <button id= 'noice-button'>Select Car</button>" +
        " </div>" +
        " </div>";
      let popup = new L.Popup();
      popup.setLatLng(popupLocation);
      popup.setContent(popupContent);
      popup.openOn(map.value);
    }
function style(feature) {  // style function for each grid color and its border
    return {
        fillColor: color(feature),
        weight: 1,
        opacity: 0.2,
        color: color(feature),
        fillOpacity: 0.8,
        stroke: true,
        fill: true,
    };
}

function color(feature) { // 9 color classes
    let value = feature.properties.laeq.toFixed(3);
    if (value <= 25) {
        return "#ffffcc";
    } else if (value > 25 && value <= 30) {
        return "#ffeda0";
    } else if (value > 30 && value <= 35) {
        return "#fed976";
    } else if (value > 35 && value <= 40) {
        return "#feb24c";
    } else if (value > 40 && value <= 45) {
        return "#fd8d3c";
    } else if (value > 45 && value <= 50) {
        return "#fc4e2a";
    } else if (value > 50 && value <= 55) {
        return "#e31a1c";
    } else if (value > 55 && value <= 60) {
        return "#bd0026";
    } else if (value > 60) {
        return "#800026";
    }
}
let options = { gridType: 'hex', property: 'laeq', units: 'meters', weight: 3 };
//noise from DB for the whole are
function load_noice(time) {
    axios.get('http://localhost:3000/api/get_noice_time?time=' + time).then(res => {
        const data = res.data;
        console.log(data)
        const n = L.geoJSON(data[0].row_to_json)
        if (noice.value) {
            map.value.removeLayer(noice.value)
        }
        if (n) {
            const n1 = turf.interpolate(n.toGeoJSON(), HeadValue.cellsize, options)
            noice.value = L.geoJSON(n1, { style: style }).addTo(map.value);
        }
    }).catch(error => {
        console.error('Error fetching data:', error);
    })
}

let timeout;
let timer_on = 0;
const show_car_noice = HeadValue.show_car_noice
//console.log(map)
function cars_move() {
    load_cars(currentTime.value);
    if (show_car_noice == false) {
        load_noice(currentTime.value);
    }
    currentTime.value++;
    timeout = setTimeout(cars_move, 1000);
}

function startCount() {
      if (!timer_on) {
        timer_on = 1;
        cars_move();
      }
}
function stopCount() {
    clearTimeout(timeout);
    timer_on = 0;
}
function refreshCount() {
    currentTime.value = 20001;
    map.value.removeLayer(noice.value)
}
</script>

<template>
    <button @click="startCount">Start</button>
    <button @click="stopCount">Stop</button>
    <button @click="refreshCount(map)">Refresh</button>
    <p>timestep:{{ currentTime }}</p>
    <div id="mapid" style="width: 100%; height: 700px;margin:auto;padding: 20px;">
    </div>
</template>

<style scoped></style>
