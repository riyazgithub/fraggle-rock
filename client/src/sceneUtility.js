const THREE = require('three');
const objectBuilder = require('./objectBuilder');
const config = require('./../config/config.js')

const remoteClients = {};
const remoteScene = {};
let currentGame;
let pitch = 0;
let yaw = 0;
let host = false;
let shootCount = 0;
let shootTime;
const serverShapeMap = {};

module.exports = {
  addLookControls: function addLookControls(camera) {
    const onMouseMove = function onMouseMove(event) {
      const movementX = event.movementX;
      const movementY = event.movementY;
      // TODO - FIX THIS
      yaw -= movementX * 0.002;
      pitch -= movementY * 0.002;

      const yawQuat = new THREE.Quaternion();
      const pitchQuat = new THREE.Quaternion();
      yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
      const quat = yawQuat.multiply(pitchQuat);
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
      if (event.keyCode === 87 || event.keyCode === 38) {
        moveForward = true;
      }
      if (event.keyCode === 65 || event.keyCode === 37) {
        moveLeft = true;
      }
      if (event.keyCode === 83 || event.keyCode === 40) {
        moveBackward = true;
      }
      if (event.keyCode === 68 || event.keyCode === 39) {
        moveRight = true;
      }

    };

    const onKeyUp = function onKeyUp(event) {

      if (event.keyCode === 87 || event.keyCode === 38) {
        moveForward = false;
      }
      if (event.keyCode === 65 || event.keyCode === 37) {
        moveLeft = false;
      }
      if (event.keyCode === 83 || event.keyCode === 40) {
        moveBackward = false;
      }
      if (event.keyCode === 68 || event.keyCode === 39) {
        moveRight = false;
      }

    };
    const updateCamera = setInterval(() => {
      const direction = camera.getWorldDirection();
      const thetaY = (Math.PI / 2) - Math.atan2(direction.z, direction.x);
      const movePerTick = 0.1;
      if (moveForward && moveLeft) {
        camera.position.x += movePerTick / Math.sqrt(2) * Math.sin(thetaY);
        camera.position.z -= movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.x -= movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.z += movePerTick / Math.sqrt(2) * (-Math.sin(thetaY));
      } else if (moveForward && moveRight) {
        camera.position.x += movePerTick / Math.sqrt(2) * Math.sin(thetaY);
        camera.position.z -= movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.x += movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.z -= movePerTick / Math.sqrt(2) * (-Math.sin(thetaY));
      } else if (moveBackward && moveLeft) {
        camera.position.x -= movePerTick / Math.sqrt(2) * Math.sin(thetaY);
        camera.position.z += movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.x -= movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.z += movePerTick / Math.sqrt(2) * (-Math.sin(thetaY));
      } else if (moveBackward && moveRight) {
        camera.position.x -= movePerTick / Math.sqrt(2) * Math.sin(thetaY);
        camera.position.z += movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.x += movePerTick / Math.sqrt(2) * (-Math.cos(thetaY));
        camera.position.z -= movePerTick / Math.sqrt(2) * (-Math.sin(thetaY));
      } else if (moveForward) {
        camera.position.x += movePerTick * Math.sin(thetaY);
        camera.position.z -= movePerTick * (-Math.cos(thetaY));
      } else if (moveBackward) {
        camera.position.x -= movePerTick * Math.sin(thetaY);
        camera.position.z += movePerTick * (-Math.cos(thetaY));
      } else if (moveLeft) {
        camera.position.x -= movePerTick * (-Math.cos(thetaY));
        camera.position.z += movePerTick * (-Math.sin(thetaY));
      } else if (moveRight) {
        camera.position.x += movePerTick * (-Math.cos(thetaY));
        camera.position.z -= movePerTick * (-Math.sin(thetaY));
      }
    }, 10);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    return updateCamera;
  },
  addClickControls: function addClickControls(socketUtility) {
    window.addEventListener('click', () => {
      shootCount++;
      if (shootCount <= config.throttleLimit) {
        socketUtility.emitShootBall({
          position: currentGame.camera.position,
          direction: currentGame.camera.getWorldDirection(),
        });
      } else {
        // set timer for throttle limit and reset
        shootTime = shootTime || new Date();
        let currTime = new Date();
        if(currTime - shootTime > config.throttleTime) {
          shootCount = 0;
          shootTime = undefined;
        }
      }
    });
  },
  oldClickControls: function oldClickControls() {
    window.addEventListener("click",function(e){
      let x = currentGame.camera.position.x;
      let y = currentGame.camera.position.y;
      let z = currentGame.camera.position.z;

      //ball texture
      let redBall = new THREE.TextureLoader().load( 'textures/redball2.jpg' );
      redBall.wrapS = THREE.RepeatWrapping;
      redBall.wrapT = THREE.RepeatWrapping;
      redBall.repeat.set( 1, 1 );
      const geometry = new THREE.SphereGeometry( .5, 32, 32 );
      const redBallMaterial = new THREE.MeshLambertMaterial( {map: redBall} );
      const ballMesh = new THREE.Mesh( geometry, redBallMaterial );
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;
      currentGame.scene.add(ballMesh);
    });
  },
  animate: function animate(game) {
    currentGame = game;
    requestAnimationFrame(animate.bind(null, game));
    game.renderer.render(game.scene, game.camera);
  },
  loadClientUpdate: function loadClientUpdate(clientPosition) {
    if (currentGame.camera.uuid !== clientPosition.uuid) {
      const oldShape = remoteClients[clientPosition.uuid];
      if (oldShape) {
        currentGame.scene.remove(oldShape);
        delete remoteClients[clientPosition.uuid];
      }
      const mesh = objectBuilder.playerModel(clientPosition.position, clientPosition.quaternion);

      currentGame.scene.add(mesh);
      remoteClients[clientPosition.uuid] = mesh;
    }
  },
  loadPhysicsUpdate: function loadPhysicsUpdate(meshObject) {
    const boxMeshes = meshObject.boxMeshes;
    const ballMeshes = meshObject.ballMeshes;
    const serverClients = meshObject.players;
    boxMeshes.forEach((serverMesh) => {
      let localMesh;
      currentGame.scene.children.forEach((mesh) => {
        if (serverShapeMap[serverMesh.uuid] === mesh.uuid || serverMesh.uuid === mesh.uuid) {
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
        const serverGeometry = serverMesh.geometry;
        const serverPosition = serverMesh.position;
        const serverQuaternion = serverMesh.quaternion;
        const serverType = serverMesh.type;
        const boxMesh = objectBuilder[serverType](serverGeometry, serverPosition, serverQuaternion)
        serverShapeMap[serverMesh.uuid] = boxMesh.uuid;
        currentGame.scene.add(boxMesh);
      }
    });
    ballMeshes.forEach((serverMesh) => {
      let localMesh;
      currentGame.scene.children.forEach((mesh) => {
        if (serverShapeMap[serverMesh.uuid] === mesh.uuid) {
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
        let redBall = new THREE.TextureLoader().load( 'textures/redball2.jpg' );
        redBall.wrapS = THREE.RepeatWrapping;
        redBall.wrapT = THREE.RepeatWrapping;
        redBall.repeat.set( 1, 1 );
        const geometry = new THREE.SphereGeometry( .5, 32, 32 );
        const redBallMaterial = new THREE.MeshLambertMaterial( {map: redBall} );
        const ballMesh = new THREE.Mesh( geometry, redBallMaterial );
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;

        serverShapeMap[serverMesh.uuid] = ballMesh.uuid;
        ballMesh.position.copy(serverMesh.position);
        const serverQuaternion = serverMesh.quaternion;
        serverQuaternion.x = serverQuaternion._x;
        serverQuaternion.y = serverQuaternion._y;
        serverQuaternion.z = serverQuaternion._z;
        serverQuaternion.w = serverQuaternion._w;
        ballMesh.quaternion.copy(serverMesh.quaternion);
        currentGame.scene.add(ballMesh);
      }
    });
    for (var key in serverClients) {
      if (key !== currentGame.camera.uuid) {
        module.exports.loadClientUpdate(serverClients[key]);
      }
    }
  },
};
