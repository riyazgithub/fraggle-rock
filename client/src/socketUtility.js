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

const roundToDec = function round(num, decimals) {
  decimals = decimals || 3;
  const mult = Math.pow(10, decimals);
  return Math.round(num * mult) / mult;
}
const roundPosition = function roundPosition (position, decimals) {
  const newPosition = {};
  newPosition.x = roundToDec(position.x, decimals);
  newPosition.y = roundToDec(position.y, decimals);
  newPosition.z = roundToDec(position.z, decimals);
  return newPosition;
};
const roundQuaternion = function roundQuaternion (quaternion, decimals) {
  const newQuaternion = {};
  newQuaternion._w = roundToDec(quaternion.w, decimals);
  newQuaternion._x = roundToDec(quaternion.x, decimals);
  newQuaternion._y = roundToDec(quaternion.y, decimals);
  newQuaternion._z = roundToDec(quaternion.z, decimals);
  return newQuaternion;
};


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
    clientPosition.position = roundPosition(camera.position);
    clientPosition.quaternion = roundQuaternion(camera.quaternion);
    clientPosition.uuid = camera.uuid;
    socket.emit('clientUpdate', JSON.stringify(clientPosition));
  },
  emitShootBall: function emitShootBall(camera) {
    socket.emit('shootBall', camera);
  }
};
