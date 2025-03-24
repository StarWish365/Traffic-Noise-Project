var express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const axios = require("axios");
var app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json()); // for parsing post data that has json format
// 启用 Brotli 或 Gzip 压缩
app.use(compression({
  threshold: 0,
  filter: shouldCompress,
  brotli: true,
  zlib: {
    brotli: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 6  // 设置 Brotli 压缩级别
      }
    }
  }
}));

const { loadReceivers, processReceiversForTimestep } = require('./composables/index');
const { pool, client } = require('./database/db')

/* const pool = require('./database/db');
function runScheduledQuery() {
  let query = `INSERT INTO test_table DEFAULT VALUES;`;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('SQL 执行失败:', err);
    } else {
      console.log('每秒执行 SQL 成功');
    }
  });
}
// 每秒执行一次
setInterval(runScheduledQuery, 2000); */


// 自定义压缩条件
function shouldCompress(req, res) {
  // 自定义不压缩逻辑，例如如果响应是图像，则不进行压缩
  if (req.headers['x-no-compression']) {
    // 如果请求头包含 'x-no-compression'，则不压缩
    return false;
  }
  // 否则，使用 compression 中间件默认的压缩过滤规则
  return compression.filter(req, res);
}

// 监听 PostgreSQL 的 "timestep_update" 事件
client.query("LISTEN timestep_update");

// 监听数据库通知
client.on("notification", async (msg) => {
  const latestTimestep = msg.payload; // 获取 PostgreSQL 触发器发送的 timestep
  console.log(`Received updated timestep: ${latestTimestep}`);

  /* try {
    // 触发 /predict 端点
    const response = await axios.post("http://localhost:3000/predict", {
      timestep: latestTimestep,
    });
    console.log("Predict API response:", response.data);
  } catch (error) {
    console.error("Error calling /predict:", error.message);
  } */
});




let receivers
app.post("/predict", async (req, res) => {
  try {
    let { timestep, userId } = req.body;
    if (timestep === undefined) {
      return res.status(400).json({ error: "Missing timestep" });
    }

    let predictions = await processReceiversForTimestep(timestep, receivers, userId);
    //创建sql插入数据语句
    const values = predictions.map(pred => `(
      ${timestep}, 
      ${pred.receiver_id}, 
      ${pred.predicted_laeq}, 
      ST_SetSRID(ST_MakePoint(${pred.lon}, ${pred.lat}), 4326), 
      ${pred.bg_pk}
    )`).join(",");
    const laeqTable = `predicted_laeq_${userId}`
    const insertQuery = `
      INSERT INTO ${laeqTable} (timestep, idreceive, laeq, geom, bg_pk) 
      VALUES ${values};
    `;
    const client = await pool.connect()
    await client.query("BEGIN");
    await client.query(insertQuery);
    await client.query("COMMIT");
    client.release();
    res.json(predictions);
    /* console.log('Success', timestep); */
  } catch (error) {
    /* console.error(error); */
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT, DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'application/json');
  next();
});

const router = require('./routes/index');
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(3000, async () => {
  console.log('Server running on port 3000')
  receivers = await loadReceivers();
  console.log('Receiver data loaded successfully')
});
