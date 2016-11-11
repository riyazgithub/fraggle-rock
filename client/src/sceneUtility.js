const THREE = require('three');
const objectBuilder = require('./objectBuilder');

const remoteClients = {};
const remoteScene = {};
let currentGame;
let pitch = 0;
let yaw = 0;
let host = false;
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
    const updateCamera = setInterval(() => {
      const direction = camera.getWorldDirection();
      const thetaY = (Math.PI / 2) - Math.atan2(direction.z, direction.x);
      const movePerTick = 0.1;
      if (moveForward) {
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
      socketUtility.emitShootBall({
        position: currentGame.camera.position,
        direction: currentGame.camera.getWorldDirection(),
      });
    });
  },
  oldClickControls: function oldClickControls() {
    window.addEventListener("click",function(e){
      let x = currentGame.camera.position.x;
      let y = currentGame.camera.position.y;
      let z = currentGame.camera.position.z;

      //ball texture
      let redBall = new THREE.TextureLoader().load( 'textures/redball.png' );
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
      // Green Square
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: clientPosition.color });
      const mesh = new THREE.Mesh(geometry, material);
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
        serverQuaternion.x = serverQuaternion._x;
        serverQuaternion.y = serverQuaternion._y;
        serverQuaternion.z = serverQuaternion._z;
        serverQuaternion.w = serverQuaternion._w;
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

        let redBall = new THREE.TextureLoader().load( 'textures/redball.png' );
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
  },
};
