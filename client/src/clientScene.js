const THREE = require('three');
const sceneUtility = require('./sceneUtility');
let camera;
let scene;
let renderer;

const init = function init() {
  // camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far)
  camera.position.y = 2;
  scene = new THREE.Scene();

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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.querySelector('body').appendChild(renderer.domElement);
  renderer.render(scene, camera);
};

const addLookControls = function addLookControls(camera) {
  const onMouseMove = function onMouseMove(event) {
    const movementX = event.movementX;
    const movementY = event.movementY;
    const thetaY = camera.rotation.y;
    // TODO - FIX THIS
    camera.rotation.y -= movementX * 0.002;
    camera.rotation.x -= movementY * 0.002 * Math.cos(thetaY);
    camera.rotation.z -= movementY * 0.002 * Math.sin(thetaY);
  };

 document.addEventListener( 'mousemove', onMouseMove, false );
};

const addMoveControls = function addMoveControls(camera) {
  let moveForward;
  let moveLeft;
  let moveBackward;
  let moveRight;
  const onKeyDown = function onKeyDown(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true; break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
    }
  };

  const onKeyUp = function onKeyUp(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // a
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }
  };
  const updateCamera = setInterval(function() {
    const thetaX = camera.rotation.x;
    const thetaY = camera.rotation.y;
    const thetaZ = camera.rotation.z;
    const movePerTick = 0.1;
    if (moveForward) {
      camera.position.x -= movePerTick * Math.sin(thetaY);
      camera.position.z += movePerTick * (-Math.cos(thetaY));
    }
  }, 10);

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
};

const animate = function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

init();
addLookControls(camera);
addMoveControls(camera);
animate();
