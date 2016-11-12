const THREE = require('three');
let socket;
const sceneUtility = require('./sceneUtility');

const addInitialLoadListener = function addInitialLoadListener(socket) {
  socket.on('initMatch', function(match) {
    console.log(match);
    addClientUpdateListener(socket);
  });
};

const addPhysicsUpdateListener = function addPhysicsUpdateListener(socket) {
  socket.on('physicsUpdate', function(meshesObject) {
    sceneUtility.savePhysicsUpdate(meshesObject);
  });
}

module.exports = {
  requestNewMatch: function requestNewMatch(scene) {
    socket = socket || io();
    socket.emit('fullScene', scene.toJSON());
    addPhysicsUpdateListener(socket);
  },
  joinMatch: function joinMatch(matchNumber) {
    socket = socket || io();
    socket.emit('addMeToMatch', matchNumber);
    addPhysicsUpdateListener(socket);
  },
  emitClientPosition: function emitClientPositon(camera) {
    const clientPosition = {};
    clientPosition.position = camera.position;
    clientPosition.quaternion = camera.quaternion;
    clientPosition.uuid = camera.uuid;
    socket.emit('clientUpdate', clientPosition);
  },
  emitShootBall: function emitShootBall(camera) {
    socket.emit('shootBall', camera);
  }
};
