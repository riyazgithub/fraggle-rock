const express = require('express');
const path = require('path');

const app = express();
const morgan = require('morgan'); // middleware for logging request details
const bodyParser = require('body-parser'); // middleware supports unicode encoding of the body
const compression = require('compression'); // middleware for gzip compression

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(allowCrossDomain);
app.use(compression());

app.use(express.static(path.join(__dirname, './../client')));

app.listen(process.env.PORT || 9999, () => {
  console.log(`listening on port ${process.env.PORT || 9999}`);
});


module.exports = app;
