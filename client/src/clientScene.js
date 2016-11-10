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

  // load a texture, set wrap mode to repeat
  var texture = new THREE.TextureLoader().load( "textures/woodcrate.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1, 1 );

  var grass = new THREE.TextureLoader().load( "textures/grass-repeating.jpg" );
  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set( 40, 40 );

  //loader test
  var mesh1 = null;
  var loader = new THREE.BufferGeometryLoader();
  loader.load('../../model.json', function(geometry) {
    var material = new THREE.MeshLambertMaterial( { color: 0xF5F5F5, map: texture } );
    mesh1 = new THREE.Mesh(geometry, material);
    console.log('loaded', mesh1)
    scene.add(mesh1);

  }, function() {
    console.log('what does this do?')
  });

  // Ambient Light
  scene.add(new THREE.AmbientLight(0x111111));

  // Green Square
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshBasicMaterial({ color: 'green', map: texture });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 5;
  mesh.position.y = .5;
  scene.add(mesh);

  // Red Square
  material = new THREE.MeshBasicMaterial({ color: 'red', map: texture });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -5;
  mesh.position.y = .5;
  scene.add(mesh);

  // Blue Square
  material = new THREE.MeshBasicMaterial({ color: 'blue', map: texture });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 5;
  mesh.position.y = .5;
  scene.add(mesh);

  // Yellow Square
  material = new THREE.MeshBasicMaterial({ color: 'yellow', map: texture });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = -5;
  mesh.position.y = .5;
  scene.add(mesh);

  // FLOOR
  geometry = new THREE.BoxGeometry(100, 0.1, 100);
  material = new THREE.MeshBasicMaterial({ color: 'white', map: grass });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -.05;
  scene.add(mesh);

const startGame = function startGame() {
  const game = init(); //creates camera, renderer and scene data
  sceneUtility.addLookControls(game.camera);
  sceneUtility.addMoveControls(game.camera);
  sceneUtility.initCannon(game.scene);
  sceneUtility.addClickControls();
  sceneUtility.animate(game); //Renders screen to page and requests re-render at next animation frame
  socketUtility.requestNewMatch(); //Request to the server to create a new match
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
