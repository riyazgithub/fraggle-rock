const THREE = require('three');

module.exports = {
  buildLevelOne: function buildLevelOne() {
    const scene = new THREE.Scene();

    // Ambient Light
    scene.add(new THREE.AmbientLight(0x111111));

    // Green Square
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({ color: 'green' });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 5;
    scene.add(mesh);

    // Red Square
    material = new THREE.MeshBasicMaterial({ color: 'red' });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    scene.add(mesh);

    // Blue Square
    material = new THREE.MeshBasicMaterial({ color: 'blue' });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 5;
    scene.add(mesh);

    // Yellow Square
    material = new THREE.MeshBasicMaterial({ color: 'yellow' });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -5;
    scene.add(mesh);

    // FLOOR
    geometry = new THREE.BoxGeometry(100, 0.1, 100);
    material = new THREE.MeshBasicMaterial({ color: 'white' });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return scene;
  }
}