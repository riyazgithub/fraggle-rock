'use strict';
const CANNON = require('cannon');
const THREE = require('three');

const getGuid = function getGuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  return [0, 0, 0, 0].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

module.exports = function Match() {
  this.guid = getGuid();
  this.clients = {};
  this.boxMeshes = [];
  this.boxes = [];
  this.ballMeshes = [];
  this.balls = [];
  this.world;
  this.loadClientUpdate = loadClientUpdate.bind(this);
  this.loadFullScene = loadFullScene.bind(this);
  this.startPhysics = startPhysics.bind(this);
  this.shootBall = shootBall.bind(this);
  this.shutdown = shutdown.bind(this);
  this.physicsEmitClock;
  this.physicsEmitTick = 20; //period between physics emits
  this.physicsClock;
  this.physicsTick = 1/150*1000;
};

const loadClientUpdate = function loadClientUpdate(clientPosition) {
  this.clients[clientPosition.guid] = clientPosition;
};

const startPhysics = function startPhysics(io) {
  const context = this;

  this.physicsClock = setInterval(function() {
    const expiredBoxIndices = [];
    const expiredBallIndices = [];
    context.world.step(context.physicsTick/1000);

    // Update ball positions
    for(var i=0; i<context.balls.length; i++){
      const ballMesh = context.ballMeshes[i];
      const ball = context.balls[i];

      ballMesh.position.copy(ball.position);
      ballMesh.quaternion.copy(ball.quaternion);
      if (ballMesh.position.x > 200 || ballMesh.position.y > 200 || ballMesh.position.z > 200) {
        expiredBallIndices.push(i);
      }
    }
    if (expiredBallIndices.length > 0) {
//      console.log('Deleted out of bounds ball!');
      let offset = 0;
      expiredBallIndices.forEach(function(index) {
        context.ballMeshes.splice(index - offset, 1);
        context.balls.splice(index - offset, 1);
        offset--;
      });
    }

    // Update box positions
    for(var i=0; i<context.boxes.length; i++){
      const boxMesh = context.boxMeshes[i];
      const box = context.boxes[i];

      boxMesh.position.copy(box.position);
      boxMesh.quaternion.copy(box.quaternion);
      if (boxMesh.position.x > 200 || boxMesh.position.y > 200 || boxMesh.position.z > 200) {
        expiredBoxIndices.push(i);
      }
    }
    if (expiredBoxIndices.length > 0) {
      console.log('Deleted out of bounds box!');
      let offset = 0;
      expiredBoxIndices.forEach(function(index) {
        context.boxMeshes.splice(index - offset, 1);
        context.boxes.splice(index - offset, 1);
        offset--;
      });
    }

  }, this.physicsTick)

  this.physicsEmitClock = setInterval(function() {
    const ballMeshes = [];
    context.ballMeshes.forEach(function(mesh) {
      ballMeshes.push({uuid: mesh.uuid, position: mesh.position, quaternion: mesh.quaternion, mass: mesh.userData.mass})
    })
    io.to(context.guid).emit('physicsUpdate', {boxMeshes: context.boxMeshes, ballMeshes: ballMeshes, players: context.clients})
  }, this.physicsEmitTick)
};

const shootBall = function shootBall(camera) {

  let x = camera.position.x;
  let y = camera.position.y;
  let z = camera.position.z;
  const geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
  const material = new THREE.MeshBasicMaterial( {color: 'red'} );
  const ballMesh = new THREE.Mesh( geometry, material );

  this.ballMeshes.push(ballMesh);


  const ballBody = new CANNON.Body({ mass: 30 });

  const ballShape = new CANNON.Sphere(0.5);
  ballBody.addShape(ballShape);
  this.world.add(ballBody);
  this.balls.push(ballBody);

  const shootDirection = camera.direction;
  ballBody.velocity.set(shootDirection.x * 125, shootDirection.y * 125, shootDirection.z * 125);
  x += shootDirection.x * 2;
  y += shootDirection.y * 2;
  z += shootDirection.z * 2;
  ballBody.position.set(x,y,z);
  ballMesh.position.set(x,y,z);
  ballMesh.userData.mass = 10;
};

const loadFullScene = function loadFullScene(scene) {
  // Setup our world
  const context = this;
  let world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  const solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);

  world.gravity.set(0,-98,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a slippery material (friction coefficient = 0.0)
  const physicsMaterial = new CANNON.Material("slipperyMaterial");
  const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3);
  // We must add the contact materials to the world
  world.addContactMaterial(physicsContactMaterial);

  // Loop through objects in scene and create copy in CANNON world
  scene.object.children.forEach(function(mesh) {
    if (!mesh.userData || mesh.userData.mass === undefined || mesh.userData.mass < 0) {
      return;
    }
    let meshGeometry;
    scene.geometries.forEach(function(geometry) {
      if (geometry.uuid === mesh.geometry) {
        meshGeometry = geometry;
      }
    });
    if (meshGeometry && meshGeometry.type === 'BoxGeometry') {
      let position = new THREE.Vector3();
      let quaternion = new THREE.Quaternion();
      let matrix = new THREE.Matrix4();
      matrix.fromArray(mesh.matrix);
      position.setFromMatrixPosition(matrix);
      quaternion.fromArray(mesh.matrix);
      const width = meshGeometry.width;
      const height = meshGeometry.height;
      const depth = meshGeometry.depth;
      const cannonPosition = new CANNON.Vec3(position.x, position.y, position.z);
      const cannonQuat = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      const cannonSize = new CANNON.Vec3(width / 2 + .065, height / 2 + .065, depth / 2 + .065);
      const cannonBox = new CANNON.Box(cannonSize);
      const cannonBody = new CANNON.Body({mass: mesh.userData.mass});
      cannonBody.addShape(cannonBox);
      cannonBody.position = cannonPosition;
      cannonBody.quaternion = cannonQuat;
      cannonBody.linearDamping = 0.01;
      cannonBody.angularDamping = 0.01;

      context.boxMeshes.push({uuid: mesh.uuid, position, quaternion, geometry: {width, height, depth}, type: mesh.userData.name, mass: mesh.userData.mass});
      context.boxes.push(cannonBody);
      world.add(cannonBody);
    }
  });
  this.world = world;
};

const shutdown = function shutdown() {
  clearInterval(this.physicsClock);
  clearInterval(this.physicsEmitClock);
}
