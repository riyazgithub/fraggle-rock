const THREE = require('three');
const sceneUtility = require('./sceneUtility');
const socketUtility = require('./socketUtility');
let serverUpdateTick;

const init = function init() {
  // camera setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far)
  camera.position.y = 2;
  const scene = new THREE.Scene();

  // Ambient Light
  scene.add(new THREE.AmbientLight(0x111111));

  // Green Square
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshBasicMaterial({ color: 'green' });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 5;
  scene.add(mesh);

  // Red Square
  material = new THREE.MeshBasicMaterial({ color: 'red' });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -5;
  scene.add(mesh);

  // Blue Square
  material = new THREE.MeshBasicMaterial({ color: 'blue' });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 5;
  scene.add(mesh);

  // Yellow Square
  material = new THREE.MeshBasicMaterial({ color: 'yellow' });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = -5;
  scene.add(mesh);

  // FLOOR
  geometry = new THREE.BoxGeometry(100, 0.1, 100);
  material = new THREE.MeshBasicMaterial({ color: 'white' });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.querySelector('body').appendChild(renderer.domElement);
  renderer.render(scene, camera);
  return { camera, renderer, scene };
};

const startUpdateTick = function startUpdateTick(camera) {
  serverUpdateTick = setInterval(() => {
    socketUtility.emitClientPosition(camera);
  }, 250);
};

const startGame = function startGame() {
  const game = init();
  sceneUtility.addLookControls(game.camera);
  sceneUtility.addMoveControls(game.camera);
  sceneUtility.animate(game);
  socketUtility.requestNewMatch();
  startUpdateTick(game.camera);
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
