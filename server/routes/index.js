var express = require('express');
var router = express.Router();
const pool = require('../database/db');

/* GET home page. */
router.get('/trydata', function (req, res, next) {
  pool.query('SELECT * FROM data', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.get('/api/get_noice_time', (req, res) => {
  var time = req.query.time;
  let q = `SELECT row_to_json(fc)
FROM (
    SELECT 'FeatureCollection' As type,
           array_to_json(array_agg(f)) As features
    FROM (
        SELECT 'Feature' As type,
               ST_AsGeoJSON(ST_Transform(lg.geom, 4326))::json As geometry,  -- 转换为WGS84坐标系
               row_to_json((SELECT l FROM (SELECT id, idreceiver, timestep_t, laeq) As l)) As properties
        FROM lday_timestep As lg
        WHERE timestep_t = ${time}
    ) As f
) As fc;
`
  //var q = "SELECT row_to_json (fc) FROM(SELECT 'FeatureCollection' As type , array_to_json ( array_agg (f))As features FROM(SELECT 'Feature' As type , ST_AsGeoJSON (lg.geom):: json As geometry, row_to_json ((SELECT l FROM ( Select id,idreceiver,timestep_t,laeq  ) As l)) As properties FROM  lday_timestep As lg where timestep_t=" + time + ") As f) As fc;"
  pool.query(q, (err, dbResponse) => {
    if (err) console.log(err); //console.log(dbResponse.rows); // here dbResponse is available, your data processing logic goes here
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dbResponse.rows);
  }
  );
});

router.get('/api/get_cars_time', (req, res) => {
  var time = req.query.time;
  let q = `SELECT row_to_json(fc) 
FROM (
    SELECT 'FeatureCollection' As type, 
           array_to_json(array_agg(f)) As features 
    FROM (
        SELECT 'Feature' As type, 
               ST_AsGeoJSON(lg.geom)::json As geometry, 
               row_to_json((SELECT l FROM (SELECT id,speed,acceleration,type) As l)) As properties 
        FROM vehicle_data As lg 
        WHERE time = ${time}
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
  const time = req.query.time
  const lng = req.query.longitude
  const lat = req.query.latitude
  console.log(time, lng, lat)
  const q = `WITH query_point AS (
  -- 创建给定坐标的点几何，确保设置为 EPSG:4326
  SELECT ST_SetSRID(ST_GeomFromText('POINT(${lng} ${lat})'), 4326) AS geom
),
closest_point AS (
  -- 找出离给定坐标最近的点，确保使用 EPSG:4326 坐标系
  SELECT 
      m.idreceiver,
      ST_DistanceSphere(m.geom, qp.geom) AS distance -- 使用 ST_DistanceSphere 计算地理距离
  FROM 
      lday_timestep m, 
      query_point qp
  -- 按地理距离排序，取出最近的点
  ORDER BY 
      ST_DistanceSphere(m.geom, qp.geom) -- 使用正确的坐标系进行距离计算
  LIMIT 1
),
aggregated_data AS (
  -- 找出最近点的所有 timestep 数据，并筛选出指定时间步之前的数据，合并 laeq
  SELECT 
      m.idreceiver,
      array_agg(m.laeq ORDER BY m.timestep_t) AS laeq_list,
      ST_SetSRID(ST_Force2D(min(m.geom)), 4326) AS geom, -- 强制确保几何数据为 EPSG:4326
      min(cp.distance) AS distance, -- 保留最近点的距离（米）
      (${time})::integer AS timestep_t -- 设置为传入的 timestep 值
  FROM 
      lday_timestep m
  JOIN 
      closest_point cp ON m.idreceiver = cp.idreceiver
  WHERE 
      m.timestep_t <= ${time} -- 筛选出在指定时间步之前的数据
  GROUP BY 
      m.idreceiver
)
-- 构建 GeoJSON 输出
SELECT 
    json_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(geom)::json, -- 确保输出为标准经纬度坐标
        'properties', json_build_object(
            'idreceiver', idreceiver,
            'laeq', laeq_list,
            'timestep_t', timestep_t,
            'distance', distance -- 返回点与查询点之间的距离
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

router.get('/api/get_next_noise', (req, res) => {
  var time = req.query.time;
  var idreceiver = req.query.idreceiver;
  let q = `SELECT laeq from lday_timestep where idreceiver = ${idreceiver} and timestep_t = ${time}`
  pool.query(q, (err, dbResponse) => {
    if (err) console.log(err); 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dbResponse);
  }
  );
});



module.exports = router;
