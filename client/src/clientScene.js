const sceneUtility = require('./sceneUtility');
const socketUtility = require('./socketUtility');
const levelBuilder = require('./levelBuilder');
const rendererBuilder = require('./rendererBuilder');
const cameraBuilder = require('./cameraBuilder');
let serverUpdateTick;
const serverUpdateInterval = 30;

const init = function init() {
  const camera = cameraBuilder.buildCamera();
  const scene = levelBuilder.buildLevelOne();
  const renderer = rendererBuilder.buildRenderer();

  document.querySelector('body').appendChild(renderer.domElement);
  document.body.requestPointerLock()
  return { camera, renderer, scene };
};

const startUpdateTick = function startUpdateTick(camera) {
  serverUpdateTick = setInterval(() => {
    socketUtility.emitClientPosition(camera);
  }, serverUpdateInterval);
};

const startGame = function startGame() {
  const game = init(); //creates camera, renderer and scene data
  sceneUtility.addLookControls(game.camera);
  sceneUtility.addMoveControls(game.camera);
  // sceneUtility.initCannon(game.scene);
  sceneUtility.addClickControls(socketUtility);
  sceneUtility.animate(game); //Renders screen to page and requests re-render at next animation frame
  socketUtility.requestNewMatch(game.scene); //Request to the server to create a new match
  startUpdateTick(game.camera); //This starts an interval to emit player position to server on timer
};

const joinGame = function joinGame(matchNumber) {
  const game = init();
  sceneUtility.addLookControls(game.camera);
  sceneUtility.addMoveControls(game.camera);
  sceneUtility.animate(game);
  socketUtility.joinMatch(matchNumber);
  startUpdateTick(game.camera);
};

module.exports = { startGame, joinGame };
