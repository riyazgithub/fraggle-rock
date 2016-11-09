const clientScene = require('./clientScene.js');

document.querySelector('#joinMatch').addEventListener('click', function() {
  clientScene.startGame();
  document.querySelector('#testButtons').remove();
});

document.querySelector('#joinExisting').addEventListener('click', function() {
  clientScene.joinGame(0);
  document.querySelector('#testButtons').remove();
});
