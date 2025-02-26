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

const { text } = require('express');
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
            "SELECT x, y, speed, type FROM vehicle_data_filtered_copy WHERE timestep = $1",
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

//ecar ratio更新函数
async function updateVehicleTypes(ecarRatio) {
    const client = await pool.connect();
    try {
        // **1. 获取总车辆数**
        const result = await client.query("SELECT COUNT(*) FROM vehicle_types");
        const totalVehicles = parseInt(result.rows[0].count);
        const ecarCount = Math.floor(ecarRatio * totalVehicles);

        // **2. 先将所有 type 设为 0（燃油车）**
        await client.query("UPDATE vehicle_types SET type = 0");

        // **3. 随机选择 ecarCount 个车辆，设置为 1（电动车）**
        await client.query(`
            UPDATE vehicle_types
            SET type = 1
            WHERE id IN (
                SELECT id FROM vehicle_types ORDER BY RANDOM() LIMIT $1
            )
        `, [ecarCount]);

        // **4. 更新 vehicle_data_filtered 表**
        await client.query(`
            UPDATE vehicle_data_filtered_copy AS vdf
            SET type = vt.type
            FROM vehicle_types AS vt
            WHERE vdf.id = vt.id
        `);

        console.log(`已更新 ${ecarCount} 辆电动车`);

    } catch (error) {
        console.error("更新车辆类型失败:", error);
    } finally {
        client.release();
    }
}
async function loadPLimit() {
    const { default: pLimit } = await import("p-limit");
    return pLimit(50);  // 限制最大 10 个并发
}
async function processEcarRatioAndPredict(ecarRatio) {
    // **等待 SQL 执行完**
    await updateVehicleTypes(ecarRatio);

    console.log("车辆数据已更新，开始预测...");
    const limit = await loadPLimit()
    let promises = []
    // **循环执行 `/predict`**
    for (let timestep = 500; timestep < 800; timestep++) {
        console.log(`预测 timestep: ${timestep}`);
        let promise = limit(() => fetch("http://127.0.0.1:3000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestep })
        }).then(res => res.text()));
        promises.push(promise);
    }
    let results = await Promise.allSettled(promises);
    console.log("成功预测数量", promises.length);
}




module.exports = { loadReceivers, processReceiversForTimestep, processEcarRatioAndPredict };