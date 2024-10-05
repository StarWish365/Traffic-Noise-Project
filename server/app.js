
var express = require('express');

var app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json()); // for parsing post data that has json format//

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT, DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); next();
});
const router = require('./routes/index');

app.use('/', router);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.listen(3000, () => console.log('Server running on port 3000'))
