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
let latestServerUpdate;
const serverShapeMap = {};

module.exports = {
  addLookControls: function addLookControls(camera) {
    const onMouseMove = function onMouseMove(event) {
      const movementX = event.movementX;
      const movementY = event.movementY;
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
  animate: function animate(game) {
    currentGame = game;
    module.exports.stepClientPhysics();
    if(latestServerUpdate) {
      module.exports.loadPhysicsUpdate(latestServerUpdate);
    }
    game.renderer.render(game.scene, game.camera);
    requestAnimationFrame(animate.bind(null, game));
  },
  loadClientUpdate: function loadClientUpdate(clientPosition) {
    clientPosition = JSON.parse(clientPosition);
    if (currentGame.camera.uuid !== clientPosition.uuid) {
      debugger;
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
  savePhysicsUpdate: function(meshObject) {
    latestServerUpdate = meshObject;
  },
  loadPhysicsUpdate: function loadPhysicsUpdate(meshObject) {
    meshObject = JSON.parse(meshObject);
    const boxMeshes = meshObject.boxMeshes;
    const ballMeshes = meshObject.ballMeshes;
    const serverClients = meshObject.players;
    const meshLookup = {};
    currentGame.scene.children.forEach((mesh) => {
      meshLookup[mesh.uuid] = mesh;
    });
    boxMeshes.forEach((serverMesh) => {
      let localMesh = meshLookup[serverMesh.uuid] || meshLookup[serverShapeMap[serverMesh.uuid]];
      if (localMesh) {
        localMesh.position.copy(serverMesh.position);
        const serverQuaternion = serverMesh.quaternion;
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
      let localMesh = meshLookup[serverMesh.uuid] || meshLookup[serverShapeMap[serverMesh.uuid]];
      if (localMesh) {
        localMesh.position.copy(serverMesh.position);
        localMesh.quaternion.copy(serverMesh.quaternion);
      } else {
        let ballMesh = new objectBuilder.redBall({radius: .5, widthSegments: 32, heightSegments: 32}, serverMesh.position, serverMesh.quaternion);
        serverShapeMap[serverMesh.uuid] = ballMesh.uuid;
        currentGame.scene.add(ballMesh);
      }
    });
    for (var key in serverClients) {
      if (key !== currentGame.camera.uuid) {
        module.exports.loadClientUpdate(serverClients[key]);
      }
    }
  },
  stepClientPhysics: function stepClientPhysics() {
    const camera = currentGame.camera;
    const scene = currentGame.scene;
  }
};
