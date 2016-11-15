'use strict';
const CANNON = require('cannon');
const THREE = require('three');
let kill;

const getGuid = function getGuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  return [0, 0, 0, 0].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

module.exports = function Match(deleteMatch) {
  this.guid = getGuid();
  this.clients = {}; // key is client UUID, value is current information about client
  this.clientToCannon = {}; // key is client UUID, value is cannon body
  this.boxes = [];
  this.balls = [];
  this.world;
  this.loadClientUpdate = loadClientUpdate.bind(this);
  this.loadNewClient = loadNewClient.bind(this);
  this.loadFullScene = loadFullScene.bind(this);
  this.startPhysics = startPhysics.bind(this);
  this.shootBall = shootBall.bind(this);
  this.shutdown = shutdown.bind(this);
  this.physicsEmitClock;
  this.physicsEmitTick = 1/60*1000; //period between physics emits
  this.physicsClock;
  this.physicsTick = 1/100*1000;
  this.connected = true;
  kill = function() {deleteMatch(this.guid)}.bind(this);
  this.timeoutDelay = 10000;
  this.timeout = setTimeout(kill, this.timeoutDelay);
};

const loadClientUpdate = function loadClientUpdate(clientPosition) {
  clearTimeout(this.timeout);
  clientPosition = JSON.parse(clientPosition);
  const localClient = this.clients[clientPosition.uuid];
  localClient.up = clientPosition.up;
  localClient.left = clientPosition.left;
  localClient.right = clientPosition.right;
  localClient.down = clientPosition.down;
  localClient.direction = clientPosition.direction;
  localClient.jump = clientPosition.jump;
  this.timeout = setTimeout(kill, this.timeoutDelay);
};

const startPhysics = function startPhysics(io) {
  const context = this;

  this.physicsClock = setInterval(function() {
    const expiredBoxIndices = [];
    const expiredBallIndices = [];
    for (var key in context.clients) {
      const client = context.clients[key];
      const clientBody = context.clientToCannon[client.uuid];
      const currVelocity = clientBody.velocity;
      const movePerTick = 1.5;
      if (client.up) {
        clientBody.velocity.set(currVelocity.x + movePerTick * client.direction.x, currVelocity.y, currVelocity.z + movePerTick * client.direction.z);
      } 
      if (client.down) {
        clientBody.velocity.set(currVelocity.x - movePerTick * client.direction.x, currVelocity.y, currVelocity.z - movePerTick * client.direction.z);
      }
      if (client.right) {
        clientBody.velocity.set(currVelocity.x - movePerTick * client.direction.z, currVelocity.y, currVelocity.z + movePerTick * client.direction.x);
      } 
      if (client.left) {
        clientBody.velocity.set(currVelocity.x + movePerTick * client.direction.z, currVelocity.y, currVelocity.z - movePerTick * client.direction.x);
      }
      if (client.jump) {
        if (client.jumps > 0) {
          clientBody.velocity.set(currVelocity.x, currVelocity.y + 50, currVelocity.z);
          client.jumps --;
        }
        const regen = function regen() {
          if (this.jumps < 3) {
            this.jumps++;
          }
          console.log(this.jumps);
          if (this.jumps < 3) {
            setTimeout(regen.bind(this), 3000)
          } else {
            this.jumpRegen = false;
          }
        }.bind(client);
        if (!client.jumpRegen && client.jumps < 3) {
          client.jumpRegen = true;
          setTimeout(function() {
            regen();
          }, 3000)
        }
        client.jump = false; 
      }
    }
    context.world.step(context.physicsTick/1000);

    // Update ball positions
    for(var i=0; i<context.balls.length; i++){
      const ball = context.balls[i];

      if (Math.abs(ball.position.x) > 200 || Math.abs(ball.position.y) > 200 || Math.abs(ball.position.z) > 200) {
        expiredBallIndices.push(i);
      }
    }
    if (expiredBallIndices.length > 0) {
      console.log('Deleted out of bounds ball!');
      let offset = 0;
      expiredBallIndices.forEach(function(index) {
        context.balls.splice(index - offset, 1);
        offset--;
      });
    }

    // Update box positions
    for(var i=0; i<context.boxes.length; i++){
      const box = context.boxes[i];

      if (Math.abs(box.position.x) > 200 || Math.abs(box.position.y) > 200 || Math.abs(box.position.z) > 200) {
        expiredBoxIndices.push(i);
      }
    }
    if (expiredBoxIndices.length > 0) {
      console.log('Deleted out of bounds box!');
      let offset = 0;
      expiredBoxIndices.forEach(function(index) {
        context.boxes.splice(index - offset, 1);
        offset--;
      });
    }

  }, this.physicsTick)



  const roundToDec = function round(num, decimals) {
    decimals = decimals || 3;
    const mult = Math.pow(10, decimals);
    return Math.round(num * mult) / mult;
  }
  const roundPosition = function roundPosition (position, decimals) {
    const newPosition = {};
    newPosition.x = roundToDec(position.x, decimals);
    newPosition.y = roundToDec(position.y, decimals);
    newPosition.z = roundToDec(position.z, decimals);
    return newPosition;
  };
  const roundQuaternion = function roundQuaternion (quaternion, decimals) {
    const newQuaternion = {};
    newQuaternion.w = roundToDec(quaternion.w, decimals);
    newQuaternion.x = roundToDec(quaternion.x, decimals);
    newQuaternion.y = roundToDec(quaternion.y, decimals);
    newQuaternion.z = roundToDec(quaternion.z, decimals);
    return newQuaternion;
  };
  this.physicsEmitClock = setInterval(function() {
    const balls = [];
    const boxes = [];
    context.balls.forEach(function(ball) {
      balls.push({uuid: ball.id, position: roundPosition(ball.position), quaternion: roundQuaternion(ball.quaternion), mass: ball.mass})
    })
    context.boxes.forEach(function(box) {
      boxes.push({uuid: box.uuid, position: roundPosition(box.position), quaternion: roundQuaternion(box.quaternion), geometry: box.userData.geometry, type: box.userData.shapeType, mass: box.mass})
    })
    io.to(context.guid).volatile.emit('physicsUpdate', JSON.stringify({boxMeshes: boxes, ballMeshes: balls, players: context.clients}))
  }, this.physicsEmitTick)
};

const shootBall = function shootBall(camera) {
  let x = camera.position.x;
  let y = camera.position.y;
  let z = camera.position.z;

  const ballBody = new CANNON.Body({ mass: 300 });
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
};

const loadNewClient = function loadNewClient(player) {
  const x = player.position.x;
  const y = player.position.y;
  const z = player.position.z;
  const ballBody = new CANNON.Body({ mass: 300 });
  const ballShape = new CANNON.Sphere(2);
  ballBody.position.x = x;
  ballBody.position.y = y;
  ballBody.position.z = z;
  ballBody.addShape(ballShape);
  this.clientToCannon[player.object.uuid] = ballBody;
  this.clients[player.object.uuid] = {uuid: player.object.uuid, position: ballBody.position, direction: player.direction, up: false, left: false, right: false, down: false, jumps: 3};
  this.world.add(ballBody);
};

const loadFullScene = function loadFullScene(scene, player) {
  // Setup our world
  const context = this;
  let world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  const solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 2;
  solver.tolerance = 0.5;
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
      cannonBody.uuid = mesh.uuid;
      cannonBody.userData = {shapeType: mesh.userData.name, geometry: {width, height, depth}};

      context.boxes.push(cannonBody);
      world.add(cannonBody);
    }
  });
  this.world = world;
  this.loadNewClient(player);
};

const shutdown = function shutdown() {
  clearTimeout(this.timeout);
  clearInterval(this.physicsClock);
  clearInterval(this.physicsEmitClock);
}
