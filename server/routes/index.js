var express = require('express');
var router = express.Router();
const { pool } = require('../database/db');

/* GET home page. */
router.get('/trydata', function (req, res, next) {
  pool.query('SELECT * FROM data', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.get('/api/get_noice_time', (req, res) => {
  var time = req.query.time;
  const authHeader = req.headers.authorization;
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.split(" ")[1]; // 提取 Bearer token
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const userTable_laeq = `predicted_laeq_${userId}`;
  let q = `SELECT row_to_json(fc)
FROM (
    SELECT 'FeatureCollection' As type,
           array_to_json(array_agg(f)) As features
    FROM (
        SELECT 'Feature' As type,
               ST_AsGeoJSON(ST_Transform(lg.geom, 4326))::json As geometry,  -- 转换为WGS84坐标系
               row_to_json((SELECT l FROM (SELECT idreceive, timestep, laeq, bg_pk) As l)) As properties
        FROM ${userTable_laeq} As lg
        WHERE timestep = ${time}
    ) As f
) As fc;
`

  pool.query(q, (err, dbResponse) => {
    if (err) console.log(err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dbResponse.rows);
  }
  );
});

router.get('/api/get_cars_time', (req, res) => {
  var time = req.query.time;
  const authHeader = req.headers.authorization;
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.split(" ")[1]; // 提取 Bearer token
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const userTable_vehicle = `vehicle_moving_data_${userId}`;
  let q = `SELECT row_to_json(fc) 
FROM (
    SELECT 'FeatureCollection' As type, 
           array_to_json(array_agg(f)) As features 
    FROM (
        SELECT 'Feature' As type, 
               ST_AsGeoJSON(lg.geom)::json As geometry, 
               row_to_json((SELECT l FROM (SELECT id,speed,type) As l)) As properties 
        FROM ${userTable_vehicle} As lg 
        WHERE timestep = ${time}
    ) As f
) As fc;
`
  //var q = "SELECT row_to_json (fc) FROM(SELECT 'FeatureCollection' As type , array_to_json ( array_agg (f))As features FROM(SELECT 'Feature' As type , ST_AsGeoJSON (lg.geom):: json As geometry, row_to_json ((SELECT l FROM ( Select uid,id,speed,acceleration, type ) As l)) As properties FROM  ag2417_22_g1.data As lg where time=" + time + ") As f) As fc;"
  pool.query(q, (err, dbResponse) => {
    if (err) console.log(err); //console.log(dbResponse.rows); // here dbResponse is available, your data processing logic goes here
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dbResponse.rows);
  }
  );
});
//${time}
router.get('/api/get_noise_value', (req, res) => {
  const lng = req.query.longitude
  const lat = req.query.latitude
  //console.log(time, lng, lat)
  const authHeader = req.headers.authorization;
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.split(" ")[1]; // 提取 Bearer token
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const userTable_laeq = `predicted_laeq_${userId}`;
  const q = `
    WITH query_point AS (
      -- 创建给定坐标的点几何，确保设置为 EPSG:4326
      SELECT ST_SetSRID(ST_GeomFromText('POINT(${lng} ${lat})'), 4326) AS geom
    ),
    closest_point AS (
      -- 找出离给定坐标最近的点，确保使用 EPSG:4326 坐标系
      SELECT 
          m.idreceive
      FROM 
          ${userTable_laeq} m, 
          query_point qp
      -- 按地理距离排序，取出最近的点
      ORDER BY 
          ST_DistanceSphere(m.geom, qp.geom) -- 使用正确的坐标系进行距离计算
      LIMIT 1
    ),
    aggregated_data AS (
      -- 找出最近点的所有 timestep 数据，并合并 laeq
      SELECT 
          m.idreceive,
          array_agg(m.laeq ORDER BY m.timestep) AS laeq_list,
          ST_SetSRID(ST_Force2D(min(m.geom)), 4326) AS geom -- 这里去掉了额外的逗号
      FROM 
          predicted_laeq m
      JOIN 
          closest_point cp ON m.idreceive = cp.idreceive
      GROUP BY 
          m.idreceive
    )
    -- 构建 GeoJSON 输出
    SELECT 
        json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json, -- 确保输出为标准经纬度坐标
            'properties', json_build_object(
                'idreceiver', idreceive,
                'laeq', laeq_list 
            )
        ) AS result
    FROM 
        aggregated_data;
  `
  pool.query(q, (err, results) => {
    if (err) {
      console.error('Database query error:', err); // 使用标准的错误输出
      res.status(500).json({ error: 'Internal Server Error' }); // 返回错误响应
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(results.rows);
  });
})


router.get('/api/get_building_id', (req, res) => {
  const polygon = req.query.polygon;

  if (!polygon) {
    return res.status(400).json({ error: "缺少 polygon 参数" });
  }

  let query = `SELECT pk
  FROM buildings_data
  WHERE ST_Intersects(
      geom,
      ST_Transform(
          ST_GeomFromText('POLYGON(${polygon})', 4326),  
      32633)  
  );`;

  pool.query(query, (err, dbResponse) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "数据库查询失败" });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(dbResponse.rows);
  });
});

router.get('/api/get_receivers_to_building', (req, res) => {
  let query = `
    SELECT idreceive, bg_pk, pop 
    FROM filtered_receivers;
  `;

  pool.query(query, (err, dbResponse) => {
    if (err) {
      console.error("数据库查询失败:", err);
      return res.status(500).json({ error: "数据库查询失败" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(dbResponse.rows);
  });
});

router.get('/api/load_building', (req, res) => {
  let query = `
    SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(
        json_build_object(
            'type', 'Feature',
            'id', pk,
            'properties', json_build_object('color', '#7a7a7a'), -- 这里默认给个颜色
            'geometry', ST_AsGeoJSON(ST_Transform(geom, 4326))::json
        )
    )
) AS geojson
FROM buildings_data;
  `;

  pool.query(query, (err, dbResponse) => {
    if (err) {
      console.error("数据库查询失败:", err);
      return res.status(500).json({ error: "数据库查询失败" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(dbResponse.rows);
  });
});
const { processEcarRatioAndPredict } = require('../composables/index')
router.get('/api/change_ecar_ratio', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.split(" ")[1]; // 提取 Bearer token
    }
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const ratio = parseFloat(req.query.ratio); // 获取 `ratio`，转换为浮点数

    if (isNaN(ratio) || ratio < 0 || ratio > 1) {
      return res.status(400).json({ error: "Invalid ecar_ratio, must be between 0 and 1" });
    }

    console.log(`Received ecar_ratio: ${ratio}`);

    console.log('userId:', userId)

    await processEcarRatioAndPredict(ratio, userId)

    console.log("所有时间步预测完成！");
    res.json({ success: true });

  } catch (error) {
    console.error("处理失败:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/api/get_receivers_to_building_time', (req, res) => {
  const time = req.query.time;
  const authHeader = req.headers.authorization;
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.split(" ")[1]; // 提取 Bearer token
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const userTable_laeq = `predicted_laeq_${userId}`;
  let q = `WITH receiver_over_noises AS (
    SELECT
        sr.bg_pk AS building_id,
        sr.pop AS population,
        sr.idreceive AS receiver_id,
        COUNT(CASE WHEN ldf.laeq > 65 THEN 1 END) AS over_noisecount
    FROM
        filtered_receivers sr
    LEFT JOIN
        ${userTable_laeq} ldf
    ON
        sr.idreceive = ldf.idreceive
    AND
        ldf.timestep <= ${time}  -- 在输入的 timestep 之前
    GROUP BY
        sr.bg_pk, sr.pop, sr.idreceive
)
SELECT
    ron.building_id,
    ron.population,
    ron.receiver_id,
    ron.over_noisecount,
    SUM(ron.over_noisecount) OVER (PARTITION BY ron.building_id) * ron.population AS building_sum
FROM
    receiver_over_noises ron
ORDER BY
    ron.building_id, ron.receiver_id;

`
  pool.query(q, (err, dbResponse) => {
    if (err) console.log(err); //console.log(dbResponse.rows); // here dbResponse is available, your data processing logic goes here
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dbResponse.rows);
  }
  );
});

router.get("/api/connect", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.split(" ")[1]; // 提取 Bearer token
    }
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    console.log(`用户 ${userId} 连接，创建临时表`);

    // 创建用户专属临时表
    const userTable_laeq = `predicted_laeq_${userId}`;
    const userTable_vehicle = `vehicle_moving_data_${userId}`;
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${userTable_laeq} (
          timestep INT,
          idreceive INT,
          laeq FLOAT,
          geom GEOMETRY,
          bg_pk INT
      );
      CREATE TABLE ${userTable_vehicle} AS TABLE vehicle_moving_data;
    `;
    const createIndexQuery = `
      CREATE INDEX idx_${userTable_laeq}_timestep ON ${userTable_laeq} (timestep);
      CREATE INDEX idx_${userTable_vehicle}_vehicle ON ${userTable_vehicle} (timestep);
    `;

    const client = await pool.connect();
    await client.query("BEGIN");  // 开启事务
    await client.query(createTableQuery);
    await client.query(createIndexQuery);
    await client.query("COMMIT"); // 提交事务
    client.release();
    console.log(`临时表已创建`);

    res.json({ success: true, message: "临时表已创建" });

  } catch (error) {
    console.error("❌ 创建临时表失败:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/logout", express.text(), async (req, res) => {
  try {
    /* const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.split(" ")[1]; // 提取 Bearer token
    } */

    const data = JSON.parse(req.body);
    const userId = data.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // **先终止用户的预测任务**
    processEcarRatioAndPredict.cancel(userId);

    console.log(`🔴 用户 ${userId} 退出，清理临时表`);

    const userTable_laeq = `predicted_laeq_${userId}`;
    const userTable_vehicle = `vehicle_moving_data_${userId}`;
    const dropTableQuery = `DROP TABLE IF EXISTS ${userTable_laeq};DROP TABLE IF EXISTS ${userTable_vehicle};`;

    const client = await pool.connect();
    await client.query(dropTableQuery);
    client.release();

    res.json({ success: true, message: "登出成功，临时表已删除" });

  } catch (error) {
    console.error("❌ 清理临时表失败:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
