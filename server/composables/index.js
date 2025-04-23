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
        const result = await client.query("SELECT idreceive, ST_X(geom) AS lon, ST_Y(geom) AS lat, bg_pk, is_blocked FROM filtered_receivers");
        client.release();
        return result.rows
    } catch (error) {
        console.error("Error loading receivers:", error);
    }
}

// 🚀 **2. 查询 `timestep` 对应的车辆数据**
async function getVehicleData(timestep, userId) {
    try {
        const client = await pool.connect();
        const vehTable = `vehicle_moving_data_${userId}`
        const result = await client.query(
            `SELECT x, y, speed, type FROM ${vehTable} WHERE timestep = ${timestep}`
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
    if (vehicles.length === 0) {
        return [0, 1, 1, 0];  // 没有车辆，返回默认值
    }

    const vehicleNum = vehicles.length;
    const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicleNum;
    const avgDistance = vehicles.reduce((sum, v) => sum + v.distance, 0) / vehicleNum;
    const avgType = vehicles.reduce((sum, v) => sum + v.type, 0) / vehicleNum;

    return [avgSpeed, avgType, avgDistance, vehicleNum];
}


// 6. 处理 Receiver 并调用 Python API
async function processReceiversForTimestep(timestep, receivers, userId) {
    if (!activeUsers.has(userId)) {  // 🔥 关键点：检测是否被取消
        return;  // 退出任务
    }
    let vehicles = await getVehicleData(timestep, userId);
    loadVehiclesIntoRBush(vehicles);

    // **按照 if_inside 分组**
    let insideReceivers = [];
    let outsideReceivers = [];
    let insideFeatures = [];
    let outsideFeatures = [];

    for (let receiver of receivers) {
        let nearbyVehicles = findNearbyVehicles(receiver.lon, receiver.lat, 0.001);
        let featureVector = formatFeatures(nearbyVehicles);

        if (receiver.is_blocked === 1) {
            insideReceivers.push(receiver);
            insideFeatures.push(featureVector);
        } else {
            outsideReceivers.push(receiver);
            outsideFeatures.push(featureVector);
        }
    }

    // **调用不同的 Python API**
    let insideResults = [];
    let outsideResults = [];

    if (insideFeatures.length > 0) {
        let response = await fetch("http://127.0.0.1:5000/predict_inside", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features: insideFeatures })
        });

        let result = await response.json();

        insideResults = insideReceivers.map((receiver, index) => ({
            receiver_id: receiver.idreceive,
            lon: receiver.lon,
            lat: receiver.lat,
            bg_pk: receiver.bg_pk,
            predicted_laeq: result.predictions[index]
        }));
    }


    if (outsideFeatures.length > 0) {
        let response = await fetch("http://127.0.0.1:5000/predict_outside", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features: outsideFeatures })
        });
        let result = await response.json();
        outsideResults = outsideReceivers.map((receiver, index) => ({
            receiver_id: receiver.idreceive,
            lon: receiver.lon,
            lat: receiver.lat,
            bg_pk: receiver.bg_pk,
            predicted_laeq: result.predictions[index]
        }));
    }

    // **合并两部分的结果**
    return [...insideResults, ...outsideResults];
}


//ecar ratio更新函数
async function updateVehicleTypes(ecarRatio, userId) {
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

        // **4. 更新 vehicle_data 表**

        const vehTable = `vehicle_moving_data_${userId}`

        await client.query(`
            UPDATE ${vehTable} AS vdf
            SET type = vt.type
            FROM vehicle_types AS vt
            WHERE vdf.id = vt.id
        `);
        //先删除原laeq数据
        const laeqTable = `predicted_laeq_${userId}`
        await client.query(`
            TRUNCATE TABLE ${laeqTable};
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
    return pLimit(10);  // 限制最大 50 个并发
}

// 记录当前正在运行的用户任务
let activeUsers = new Set();
async function processEcarRatioAndPredict(ecarRatio, userId) {
    if (activeUsers.has(userId)) return;  // 避免重复执行
    activeUsers.add(userId);
    // **等待 SQL 执行完**
    await updateVehicleTypes(ecarRatio, userId);

    console.log("车辆数据已更新，开始预测...");
    const limit = await loadPLimit()
    let promises = []
    // **循环执行 `/predict`**
    for (let timestep = 500; timestep < 800; timestep++) {
        let promise = limit(() => fetch("http://127.0.0.1:3000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestep, userId })
        }).then(res => res.text()));
        promises.push(promise);
    }
    let results = await Promise.allSettled(promises);
    activeUsers.delete(userId);
    console.log("成功预测数量", promises.length);
}

processEcarRatioAndPredict.cancel = function (userId) {
    console.log(`🛑 终止用户 ${userId} 的预测任务`);
    activeUsers.delete(userId);  // 从 activeUsers 中删除，表示任务被终止
};




module.exports = { loadReceivers, processReceiversForTimestep, processEcarRatioAndPredict };