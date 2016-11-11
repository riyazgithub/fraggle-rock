const THREE = require('three');
const CANNON = require('cannon');
const remoteClients = {};
let currentGame;
let currentWorld;
let pitch = 0;
let yaw = 0;
let ballMeshes = [];
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
    const updateCamera = setInterval(function() {
      const direction = camera.getWorldDirection();
      let thetaY = Math.PI/2 - Math.atan2(direction.z, direction.x);
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
  addClickControls: function addClickControls() {
    window.addEventListener("click",function(e){
      let x = currentGame.camera.position.x;
      let y = currentGame.camera.position.y;
      let z = currentGame.camera.position.z;

      //ball texture
      let redBall = new THREE.TextureLoader().load( 'textures/redball2.jpg' );
      redBall.wrapS = THREE.RepeatWrapping;
      redBall.wrapT = THREE.RepeatWrapping;
      redBall.repeat.set( 1, 1 );
      const redBallMaterial = new THREE.MeshLambertMaterial( {map: redBall} );

      // let techBall = new THREE.TextureLoader().load( 'textures/techcrate.jpg' );
      // techBall.wrapS = THREE.RepeatWrapping;
      // techBall.wrapT = THREE.RepeatWrapping;
      // techBall.repeat.set( 2, 1 );
      // const techBallMaterial = new THREE.MeshLambertMaterial( {map: techBall} );

      // let futureBall = new THREE.TextureLoader().load( 'textures/futuretile.jpg' );
      // futureBall.wrapS = THREE.RepeatWrapping;
      // futureBall.wrapT = THREE.RepeatWrapping;
      // futureBall.repeat.set( 1, 1 );
      // const futureBallMaterial = new THREE.MeshLambertMaterial( {map: futureBall} );

      // let balls = [redBallMaterial, techBallMaterial, futureBallMaterial];

      // let randBall = function() {
      //   let rand = Math.floor(Math.random() * balls.length);
      //   return balls[rand];
      // }

      const geometry = new THREE.SphereGeometry( .5, 32, 32 );
      // const material = new THREE.MeshLambertMaterial( {map: redBall} );
      const ballMesh = new THREE.Mesh( geometry, redBallMaterial );

      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;

      currentGame.scene.add(ballMesh);
      ballMeshes.push(ballMesh);

      const ballBody = new CANNON.Body({ mass: 1 });
      const ballShape = new CANNON.Sphere(0.5);
      ballBody.addShape(ballShape);
      currentWorld.add(ballBody);
      balls.push(ballBody);

      const shootDirection = currentGame.camera.getWorldDirection();
      ballBody.velocity.set(  shootDirection.x * 15, shootDirection.y * 15, shootDirection.z * 15);
      x += shootDirection.x * 2;
      y += shootDirection.y * 2;
      z += shootDirection.z * 2;
      ballBody.position.set(x,y,z);
      ballMesh.position.set(x,y,z);
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
        let cannonSize = new CANNON.Vec3(width/2, height/2, depth/2);

        let cannonBox = new CANNON.Box(cannonSize);
        let mass;
        if (width > 100) {
          return;
        }

        if (width > 30) {
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

    currentWorld.step(1/60);

    // Update ball positions
    for(var i=0; i<balls.length; i++){
      ballMeshes[i].position.copy(balls[i].position);
      ballMeshes[i].quaternion.copy(balls[i].quaternion);
    }

    // Update box positions
    for(var i=0; i<boxes.length; i++){
      boxMeshes[i].position.copy(boxes[i].position);
      boxMeshes[i].quaternion.copy(boxes[i].quaternion);
    }
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
  }
};
