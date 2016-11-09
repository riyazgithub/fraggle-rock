const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const morgan = require('morgan'); // middleware for logging request details
const bodyParser = require('body-parser'); // middleware supports unicode encoding of the body
const compression = require('compression'); // middleware for gzip compression
const matchController = require('./controllers/matchController.js');

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

server.listen(process.env.PORT || 9999, () => {
  console.log(`listening on port ${process.env.PORT || 9999}`);
});

io.on('connection', (socket) => {

  socket.on('addMeToNewMatch', function () {
    const match = matchController.getNewMatch();
    socket.join(match.guid);
    socket.on('clientUpdate', function (clientPosition) {
      io.to(match.guid).emit('clientUpdate', clientPosition);
      match.loadClientUpdate(clientPosition);
    });
  });

  socket.on('addMeToMatch', function (matchId) {
    const match = matchController.getMatch(matchId);
    socket.join(match.guid);
    socket.on('clientUpdate', function (clientPosition) {
      io.to(match.guid).emit('clientUpdate', clientPosition);
      match.loadClientUpdate(clientPosition);
    });
    io.to(match.guid).emit('initMatch', match);
  });
});

module.exports = app;
