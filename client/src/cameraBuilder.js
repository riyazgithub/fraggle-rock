const THREE = require('three');

module.exports = {
  buildCamera: function buildCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far)
    camera.position.y = 2;
    return camera;
  }
}