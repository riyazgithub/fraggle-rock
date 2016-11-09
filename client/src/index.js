const clientScene = require('./clientScene.js');

document.querySelector('#joinMatch').addEventListener('click', function() {
  clientScene.startGame(1);
  document.querySelector('#joinMatch').remove();
});
