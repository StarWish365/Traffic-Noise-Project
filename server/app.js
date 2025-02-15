var express = require('express');
const compression = require('compression');
const zlib = require('zlib');

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
let receivers
app.post("/predict", async (req, res) => {
  try {
    let { timestep } = req.body;
    if (timestep === undefined) {
      return res.status(400).json({ error: "Missing timestep" });
    }

    let predictions = await processReceiversForTimestep(timestep,receivers);
    res.json(predictions);
    console.log('Success');
  } catch (error) {
    console.error(error);
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
