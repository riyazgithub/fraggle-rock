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
      console.log('Deleted out of bounds ball!');
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
    }

  }, this.physicsTick)

  this.physicsEmitClock = setInterval(function() {
    const ballMeshes = [];
    context.ballMeshes.forEach(function(mesh) {
      ballMeshes.push({uuid: mesh.uuid, position: mesh.position, quaternion: mesh.quaternion})
    })
    io.to(context.guid).emit('physicsUpdate', {boxMeshes: context.boxMeshes, ballMeshes: ballMeshes})
  }, this.physicsEmitTick)
};

const shootBall = function shootBall(camera) {

  let x = camera.position.x;
  let y = camera.position.y;
  let z = camera.position.z;
  const geometry = new THREE.SphereGeometry( .2, 32, 32 );
  const material = new THREE.MeshBasicMaterial( {color: 'red'} );
  const ballMesh = new THREE.Mesh( geometry, material );

  // currentGame.scene.add(ballMesh);
  this.ballMeshes.push(ballMesh);
  
  const ballBody = new CANNON.Body({ mass: 10 });
  const ballShape = new CANNON.Sphere(0.2);
  ballBody.addShape(ballShape);
  this.world.add(ballBody);
  this.balls.push(ballBody);

  const shootDirection = camera.direction;
  ballBody.velocity.set(  shootDirection.x * 100, shootDirection.y * 100, shootDirection.z * 100);
  x += shootDirection.x * 2;
  y += shootDirection.y * 2;
  z += shootDirection.z * 2;
  ballBody.position.set(x,y,z);
  ballMesh.position.set(x,y,z);
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

  world.gravity.set(0,-20,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a slippery material (friction coefficient = 0.0)
  const physicsMaterial = new CANNON.Material("slipperyMaterial");
  const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3);
  // We must add the contact materials to the world
  world.addContactMaterial(physicsContactMaterial);
  
  // Loop through objects in scene and create copy in CANNON world
  scene.object.children.forEach(function(mesh) {
    let meshGeometry;
    let meshMaterial;
    scene.geometries.forEach(function(geometry) {
      if (mesh.geometry === geometry.uuid) {
        meshGeometry = geometry;
      }
    })
    scene.materials.forEach(function(material) {
      if (mesh.material === material.uuid) {
        meshMaterial = material;
      }
    })
    if (meshGeometry && meshGeometry.type === 'BoxGeometry') {
      let position = new THREE.Vector3();
      let quaternion = new THREE.Quaternion();
      let matrix = new THREE.Matrix4();
      matrix.fromArray(mesh.matrix);
      position.setFromMatrixPosition(matrix);
      quaternion.fromArray(mesh.matrix);
      let width = meshGeometry.width;
      let height = meshGeometry.height;
      let depth = meshGeometry.depth;

      let cannonPosition = new CANNON.Vec3(position.x, position.y, position.z);
      let cannonQuat = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      let cannonSize = new CANNON.Vec3(width/2, height/2, depth/2); 

      let cannonBox = new CANNON.Box(cannonSize);
      let mass;
      if (width === 100) {
        mass = 0;
      } else {
        mass = height*width*depth;
      }
      let cannonBody = new CANNON.Body({mass: mass});
      cannonBody.addShape(cannonBox);
      cannonBody.position = cannonPosition;
      cannonBody.quaternion = cannonQuat;
      cannonBody.linearDamping = 0.01;
      cannonBody.angularDamping = 0.01;

      context.boxMeshes.push({uuid: mesh.uuid, position, quaternion, geometry: {width, height, depth}, color: meshMaterial.color});
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