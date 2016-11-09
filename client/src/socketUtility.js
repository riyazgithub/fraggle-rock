let socket;

const addClientUpdateListener = function addClientUpdateListener(socket) {
  socket.on('clientUpdate', function (clientPosition) {
    console.log(clientPosition);
  });
};

module.exports = {
  requestNewMatch: function requestNewMatch() {
    socket = io();
    socket.emit('addMeToNewMatch', null);
    addClientUpdateListener(socket);    
  },
  emitClientPosition: function emitClientPositon(camera) {
    const clientPosition = {};
    clientPosition.x = camera.position.x;
    clientPosition.y = camera.position.y;
    clientPosition.z = camera.position.z;
    clientPosition.color = 'red';
    clientPosition.guid = camera.uuid;

    socket.emit('clientUpdate', clientPosition);
  },
};
