let socket;
const sceneUtility = require('./sceneUtility');

const addClientUpdateListener = function addClientUpdateListener(socket) {
  socket.on('clientUpdate', function (clientPosition) {
    console.log(clientPosition);
    sceneUtility.loadClientUpdate(clientPosition);
  });
};

const addInitialLoadListener = function addInitialLoadListener(socket) {
  socket.on('initMatch', function(match) {
    console.log(match);
    addClientUpdateListener(socket);
  });
};

module.exports = {
  requestNewMatch: function requestNewMatch() {
    socket = socket || io();
    socket.emit('addMeToNewMatch', null);
    addClientUpdateListener(socket);    
  },
  joinMatch: function joinMatch(matchNumber) {
    socket = socket || io();
    socket.emit('addMeToMatch', matchNumber);
    addInitialLoadListener(socket);
  },
  emitClientPosition: function emitClientPositon(camera) {
    const clientPosition = {};
    clientPosition.x = camera.position.x;
    clientPosition.y = camera.position.y;
    clientPosition.z = camera.position.z;
    clientPosition.color = 'red';
    clientPosition.uuid = camera.uuid;

    socket.emit('clientUpdate', clientPosition);
  },
};
