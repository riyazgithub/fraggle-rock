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

  socket.on('fullScene', function (fullScene) {
    const scene = fullScene.scene;
    const player = fullScene.camera;
    const match = matchController.getNewMatch();
    match.loadFullScene(scene, player);
    match.startPhysics(io);
    socket.join(match.guid);
    socket.on('shootBall', function(camera) {
      match.shootBall(camera);
    });
    socket.on('clientUpdate', function (camera) { // listener for client position updates
      match.loadClientUpdate(camera); // update server's copy of client position
    });
    socket.on('disconnect', function (e) {
      matchController.deleteMatch(match.guid);
    })
  });

  socket.on('addMeToMatch', function (newMatchRequest) {
    const matchId = newMatchRequest.matchId;
    const player = newMatchRequest.player;
    const match = matchController.getMatch(matchId);
    if (!match) {
      return;
    }
    match.loadNewClient(player);
    socket.join(match.guid);
    socket.on('shootBall', function(camera) {
      match.shootBall(camera);
    });
    socket.on('clientUpdate', function (clientPosition) { // listener for client position updates
      match.loadClientUpdate(clientPosition); // update server's copy of client position
    });
  });
});

module.exports = app;
