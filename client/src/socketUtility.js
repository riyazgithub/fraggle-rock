const THREE = require('three');
let socket;
const sceneUtility = require('./sceneUtility');

const addClientUpdateListener = function addClientUpdateListener(socket) {
  socket.on('clientUpdate', function (clientPosition) {
    sceneUtility.loadClientUpdate(clientPosition);
  });
};

const addInitialLoadListener = function addInitialLoadListener(socket) {
  socket.on('initMatch', function(match) {
    console.log(match);
    addClientUpdateListener(socket);
  });
};

const addPhysicsUpdateListener = function addPhysicsUpdateListener(socket) {
  socket.on('physicsUpdate', function(meshesObject) {
    sceneUtility.loadPhysicsUpdate(meshesObject);
  })
}

module.exports = {
  requestNewMatch: function requestNewMatch(scene) {
    socket = socket || io();
    socket.emit('fullScene', scene.toJSON());
    addClientUpdateListener(socket);
    addPhysicsUpdateListener(socket);
  },
  joinMatch: function joinMatch(matchNumber) {
    socket = socket || io();
    socket.emit('addMeToMatch', matchNumber);
    addClientUpdateListener(socket);
    addPhysicsUpdateListener(socket);
  },
  emitClientPosition: function emitClientPositon(camera) {
    const clientPosition = {};
    clientPosition.x = camera.position.x;
    clientPosition.y = camera.position.y;
    clientPosition.z = camera.position.z;
    clientPosition.rx = camera.rotation.x;
    clientPosition.ry = camera.rotation.y;
    clientPosition.rz = camera.rotation.z;
    clientPosition.color = 'red';
    clientPosition.uuid = camera.uuid;
    socket.emit('clientUpdate', clientPosition);
  },
  emitShootBall: function emitShootBall(camera) {
    socket.emit('shootBall', camera);
  }
};
