const THREE = require('three');
const CANNON = require('cannon');
const remoteClients = {};
let currentGame;
let currentWorld;
let pitch = 0;
let yaw = 0;
let ballMeshes = [];
let ballMeshMap = {};
let balls = [];
let boxMeshes = [];
let boxes = [];

module.exports = {
  addLookControls: function addLookControls(camera) {
    const onMouseMove = function onMouseMove(event) {
      const movementX = event.movementX;
      const movementY = event.movementY;
      // TODO - FIX THIS
      yaw -= movementX * 0.002;
      pitch -= movementY * 0.002;

      let yawQuat = new THREE.Quaternion();
      let pitchQuat = new THREE.Quaternion();
      yawQuat.setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), yaw);
      pitchQuat.setFromAxisAngle(new THREE.Vector3(1,0,0), pitch);
      let quat = yawQuat.multiply(pitchQuat);
      camera.quaternion.copy(quat);
    };

   document.addEventListener('mousemove', onMouseMove, false);
  },
  addMoveControls: function addMoveControls(camera) {
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
      const direction = camera.getWorldDirection();
      let thetaY = Math.PI/2 - Math.atan2(direction.z, direction.x);
      const movePerTick = 0.1;
      if (moveForward) {
        camera.position.x += movePerTick * Math.sin(thetaY);
        camera.position.z -= movePerTick * (-Math.cos(thetaY));
      } else if(moveBackward) {
        camera.position.x -= movePerTick * Math.sin(thetaY);
        camera.position.z += movePerTick * (-Math.cos(thetaY))
      } else if(moveLeft) {
        camera.position.x -= movePerTick * (-Math.cos(thetaY));
        camera.position.z += movePerTick * (-Math.sin(thetaY));
      } else if(moveRight) {
        camera.position.x += movePerTick * (-Math.cos(thetaY));
        camera.position.z -= movePerTick * (-Math.sin(thetaY));
      }
    }, 10);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    return updateCamera;
  },
  addClickControls: function addClickControls(socketUtility) {
    window.addEventListener("click",function(e){
      socketUtility.emitShootBall({position: currentGame.camera.position, direction: currentGame.camera.getWorldDirection()});
    });
  },
  initCannon: function initCannon(scene) {
    // Setup our world
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
    scene.children.forEach(function(mesh) {
      if (mesh.geometry && mesh.geometry.type === 'BoxGeometry') {
        let position = mesh.position;
        let quaternion = mesh.quaternion;
        let width = mesh.geometry.parameters.width;
        let height = mesh.geometry.parameters.height;
        let depth = mesh.geometry.parameters.depth;

        let cannonPosition = new CANNON.Vec3(position.x, position.y, position.z);
        let cannonQuat = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        let cannonSize = new CANNON.Vec3(width, height, depth);

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
        
        boxMeshes.push(mesh);
        boxes.push(cannonBody);
        world.add(cannonBody);
      }
    });
    currentWorld = world;
  },
  animate: function animate(game) {
    currentGame = game;
    requestAnimationFrame(animate.bind(null, game));

    // currentWorld.step(1/60);

    // // Update ball positions
    // for(var i=0; i<balls.length; i++){
    //   ballMeshes[i].position.copy(balls[i].position);
    //   ballMeshes[i].quaternion.copy(balls[i].quaternion);
    // }

    // // Update box positions
    // for(var i=0; i<boxes.length; i++){
    //   boxMeshes[i].position.copy(boxes[i].position);
    //   boxMeshes[i].quaternion.copy(boxes[i].quaternion);
    // }

    game.renderer.render(game.scene, game.camera);
  },
  loadClientUpdate: function loadClientUpdate(clientPosition) {
    if (currentGame.camera.uuid !== clientPosition.uuid) {
      let oldShape = remoteClients[clientPosition.uuid];
      if (oldShape) {
        currentGame.scene.remove(oldShape);
        delete remoteClients[clientPosition.uuid];
      }
      // Green Square
      let geometry = new THREE.BoxGeometry(1, 1, 1);
      let material = new THREE.MeshBasicMaterial({ color: clientPosition.color });
      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = clientPosition.x;
      mesh.position.y = clientPosition.y;
      mesh.position.z = clientPosition.z;
      mesh.rotation.x = clientPosition.rx;
      mesh.rotation.y = clientPosition.ry;
      mesh.rotation.z = clientPosition.rz;
      currentGame.scene.add(mesh);
      remoteClients[clientPosition.uuid] = mesh;
    }
  },
  loadPhysicsUpdate: function loadPhysicsUpdate(meshObject) {
    const boxMeshes = meshObject.boxMeshes;
    const ballMeshes = meshObject.ballMeshes;
    boxMeshes.forEach(function(serverMesh) {
      let localMesh;
      currentGame.scene.children.forEach(function(mesh) {
        if (serverMesh.uuid === mesh.uuid) {
          localMesh = mesh;
        }
      });
      if (localMesh) {
        localMesh.position.copy(serverMesh.position);
        const serverQuaternion = serverMesh.quaternion;
        serverQuaternion.x = serverQuaternion._x;
        serverQuaternion.y = serverQuaternion._y;
        serverQuaternion.z = serverQuaternion._z;
        serverQuaternion.w = serverQuaternion._w;
        localMesh.quaternion.copy(serverMesh.quaternion);
      }
    });
    ballMeshes.forEach(function(serverMesh) {
      let localMesh;
      currentGame.scene.children.forEach(function(mesh) {
        if (ballMeshMap[serverMesh.uuid] === mesh.uuid) {
          localMesh = mesh;
        }
      });
      if (localMesh) {
        localMesh.position.copy(serverMesh.position);
        const serverQuaternion = serverMesh.quaternion;
        serverQuaternion.x = serverQuaternion._x;
        serverQuaternion.y = serverQuaternion._y;
        serverQuaternion.z = serverQuaternion._z;
        serverQuaternion.w = serverQuaternion._w;
        localMesh.quaternion.copy(serverMesh.quaternion);
      } else {
        const geometry = new THREE.SphereGeometry( .2, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 'red'} );
        const ballMesh = new THREE.Mesh( geometry, material );
        ballMeshMap[serverMesh.uuid] = ballMesh.uuid;
        ballMesh.position.copy(serverMesh.position);
        const serverQuaternion = serverMesh.quaternion;
        serverQuaternion.x = serverQuaternion._x;
        serverQuaternion.y = serverQuaternion._y;
        serverQuaternion.z = serverQuaternion._z;
        serverQuaternion.w = serverQuaternion._w;
        ballMesh.quaternion.copy(serverMesh.quaternion);
        currentGame.scene.add(ballMesh);
      }
    })
  }
};
