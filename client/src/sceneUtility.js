module.exports = {
  addLookControls: function addLookControls(camera) {
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
      const thetaX = camera.rotation.x;
      const thetaY = camera.rotation.y;
      const thetaZ = camera.rotation.z;
      const movePerTick = 0.1;
      if (moveForward) {
        camera.position.x -= movePerTick * Math.sin(thetaY);
        camera.position.z += movePerTick * (-Math.cos(thetaY));
      } else if(moveBackward) {
        camera.position.x += movePerTick * Math.sin(thetaY);
        camera.position.z -= movePerTick * (-Math.cos(thetaY))
      } else if(moveLeft) {
        camera.position.x += movePerTick * (-Math.cos(thetaY));
        camera.position.z -= movePerTick * (-Math.sin(thetaY));
      } else if(moveRight) {
        camera.position.x -= movePerTick * (-Math.cos(thetaY));
        camera.position.z += movePerTick * (-Math.sin(thetaY));
      }
    }, 10);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    return updateCamera;
  },
  animate: function animate(game) {
    game.renderer.render(game.scene, game.camera);
    requestAnimationFrame(animate.bind(null, game));
  },
};
