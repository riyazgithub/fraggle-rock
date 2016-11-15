const sceneUtility = require('./sceneUtility');
const socketUtility = require('./socketUtility');
const LevelBuilder = require('./levelBuilder');
const levelBuilder = new LevelBuilder();
const rendererBuilder = require('./rendererBuilder');
const cameraBuilder = require('./cameraBuilder');
let serverUpdateTick;
const serverUpdateInterval = 1/60*1000;

const appendRenderer = function appendRenderer(renderer) {
  document.querySelector('body').appendChild(renderer.domElement);
  document.body.requestPointerLock();
}

const init = function init() {
  const camera = cameraBuilder.buildCamera();
  const renderer = rendererBuilder.buildRenderer();
  appendRenderer(renderer);
  const scene = levelBuilder.buildLevelOne();
  return { camera, renderer, scene };
};

const join = function join() {
  const camera = cameraBuilder.buildCamera();
  const renderer = rendererBuilder.buildRenderer();
  appendRenderer(renderer);
  const scene = levelBuilder.buildBlankLevelOne();
  return { camera, renderer, scene };
}

const startUpdateTick = function startUpdateTick(camera, playerInput) {
  serverUpdateTick = setInterval(() => {
    socketUtility.emitClientPosition(camera, playerInput);
  }, serverUpdateInterval);
};

const startGame = function startGame() {
  const game = init(); //creates camera, renderer and scene data
  sceneUtility.addLookControls(game.camera);
  const playerInput = sceneUtility.addMoveControls(game.camera);
  sceneUtility.addClickControls(socketUtility);
  sceneUtility.animate(game); //Renders screen to page and requests re-render at next animation frame
  socketUtility.requestNewMatch(game); //Request to the server to create a new match
  startUpdateTick(game.camera, playerInput); //This starts an interval to emit player position to server on timer
};

const joinGame = function joinGame(matchNumber) {
  // load game of this matchNumber
  const game = join(matchNumber);
  sceneUtility.addLookControls(game.camera);
  sceneUtility.addMoveControls(game.camera);
  sceneUtility.addClickControls(socketUtility);
  sceneUtility.animate(game);
  socketUtility.joinMatch(matchNumber);
  startUpdateTick(game.camera);
};

module.exports = { startGame, joinGame };
