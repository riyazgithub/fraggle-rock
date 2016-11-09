var THREE = require('Three');
var camera, scene, renderer, mesh, light;
const init = function init() {
  //camera setup
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //(fov, aspect, near, far)
  camera.position.y = 2;
  
  scene = new THREE.Scene();

  //Ambient Light
  scene.add( new THREE.AmbientLight(0x111111) );

  
  //Green Square
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 'green' } );
  mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = 5;
  scene.add( mesh );

  //Red Square
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( { color: 'red' } );
  mesh = new THREE.Mesh( geometry, material );
  mesh.position.z = -5;
  scene.add( mesh );

  //Blue Square
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( { color: 'blue' } );
  mesh = new THREE.Mesh( geometry, material );
  mesh.position.z = 5;
  scene.add( mesh );

  //Yellow Square
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( { color: 'yellow' } );
  mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = -5;
  scene.add( mesh );

  //FLOOR
  geometry = new THREE.BoxGeometry( 100, .1, 100 );
  material = new THREE.MeshBasicMaterial( { color: 'white' } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );


  //Renderer setup
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.querySelector('body').appendChild( renderer.domElement );
  renderer.render(scene, camera);
}

const addLookControls = function addLookControls(camera) {
  const onMouseMove = function ( event ) {
      var movementX = event.movementX;
      var movementY = event.movementY;
      var thetaY = camera.rotation.y;
      //TODO - FIX THIS
      camera.rotation.y -= movementX * 0.002;
      camera.rotation.x -= movementY * 0.002 * Math.cos(thetaY);
      camera.rotation.z -= movementY * 0.002 * Math.sin(thetaY);
  };

 document.addEventListener( 'mousemove', onMouseMove, false );
}

const addMoveControls = function addMoveControls(camera) {
  var moveForward, moveLeft, moveBackward, moveRight;
  var onKeyDown = function ( event ) {
      switch ( event.keyCode ) {
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

  var onKeyUp = function ( event ) {
      switch( event.keyCode ) {
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
    const movePerTick = .1;
    if(moveForward) {
      camera.position.x -= movePerTick * Math.sin(thetaY);
      camera.position.z += movePerTick * (-Math.cos(thetaY));
    }
  }, 10)

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
}

const animate = function animate() {
   renderer.render(scene, camera);
   requestAnimationFrame(animate);
}

init();
addLookControls(camera);
addMoveControls(camera);
animate();

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
// scene.add( cube )
// camera.position.z = 5;
// var render = function () {
//     requestAnimationFrame( render );
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     renderer.render(scene, camera);
// };

// render();