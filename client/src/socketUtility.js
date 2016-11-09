let socket;

module.exports = {
  requestNewMatch: function requestNewMatch(matchNumber) {
    socket = io();
    socket.emit('addMeToMatch', matchNumber);
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
