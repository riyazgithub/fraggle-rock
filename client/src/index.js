const clientScene = require('./clientScene.js');

document.querySelector('#joinMatch').addEventListener('click', function() {
  clientScene.startGame();
  document.querySelector('#joinMatch').remove();
});
