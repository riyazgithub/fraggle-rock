const getGuid = function getGuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  return [0, 0, 0, 0].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

module.exports = function Match() {
  this.guid = getGuid;
  this.clients = {};
  this.loadClientUpdate = loadClientUpdate.bind(this);
};

const loadClientUpdate = function loadClientUpdate(clientPosition) {
  this.clients[clientPosition.guid] = clientPosition;
};