// RBush 索引树（存储车辆数据）
async function loadRBush() {
    const { default: RBush } = await import('rbush');
    return RBush;
}
let vehicleTree
loadRBush().then(RBush => {
    vehicleTree = new RBush();
});


const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { pool } = require('../database/db')

// 🚀 **1. 服务器启动时加载 Receiver 数据**
async function loadReceivers() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT idreceive, ST_X(geom) AS lon, ST_Y(geom) AS lat, bg_pk FROM filtered_receivers");
        client.release();
        return result.rows
    } catch (error) {
        console.error("Error loading receivers:", error);
    }
}

// 🚀 **2. 查询 `timestep` 对应的车辆数据**
async function getVehicleData(timestep) {
    try {
        const client = await pool.connect();
        const result = await client.query(
            "SELECT x, y, speed, veh_type FROM vehicle_data_filtered WHERE timestep = $1",
            [timestep]
        );
        client.release();
        return result.rows;
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        return [];
    }
}

// 🚀 **3. 使用 RBush 加速查询**
function loadVehiclesIntoRBush(vehicles) {
    const items = vehicles.map(v => ({
        minX: v.x, maxX: v.x,
        minY: v.y, maxY: v.y,
        vehicle: v
    }));
    vehicleTree.clear();
    vehicleTree.load(items);
}

// 🚀 **4. 查找 receiver 100m 内的车辆**
function findNearbyVehicles(rx, ry, radius) {
    const bbox = {
        minX: rx - radius,
        maxX: rx + radius,
        minY: ry - radius,
        maxY: ry + radius
    };
    let candidates = vehicleTree.search(bbox);
    return candidates
        .map(item => {
            let vehicle = item.vehicle;
            let distance = euclideanDistance(rx, ry, vehicle.x, vehicle.y); // 计算距离
            return { ...vehicle, distance }; // 添加 `distance` 字段
        })
}
// 欧几里得距离计算
function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// 🚀 **5. 组织特征向量**
function formatFeatures(vehicles) {
    const maxVehicles = 10;
    let speeds = [];
    let distances = [];
    let vehicleTypes = [];

    for (let v of vehicles) {
        speeds.push(v.speed);
        distances.push(v.distance);
        vehicleTypes.push(v.veh_type);
        if (speeds.length === maxVehicles) break
    }

    while (speeds.length < maxVehicles) {
        speeds.push(0);
        distances.push(1);
        vehicleTypes.push(0);
    }

    return [...speeds, ...distances, ...vehicleTypes];
}

// 6. 处理 Receiver 并调用 Python API
async function processReceiversForTimestep(timestep, receivers) {
    let vehicles = await getVehicleData(timestep);
    loadVehiclesIntoRBush(vehicles);

    // 批量处理所有 receivers，生成 feature vectors
    let featureVectors = receivers.map(receiver => {
        let nearbyVehicles = findNearbyVehicles(receiver.lon, receiver.lat, 0.001);
        return formatFeatures(nearbyVehicles);
    });

    // 一次性调用 Python API 预测所有 receivers
    let response = await fetch("http://127.0.0.1:5000/predict_inside", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: featureVectors })  // 发送所有 receiver 的数据
    });

    let result = await response.json();

    // 解析返回的 predictions，并匹配 receiver_id
    return receivers.map((receiver, index) => ({
        receiver_id: receiver.idreceive,
        lon: receiver.lon,
        lat: receiver.lat,
        bg_pk: receiver.bg_pk,
        predicted_laeq: result.predictions[index][0]  // 取对应的预测值
    }));
}



module.exports = { loadReceivers, processReceiversForTimestep };