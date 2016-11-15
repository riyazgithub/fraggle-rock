const THREE = require('three');
const objectBuilder = require('./objectBuilder');

const lights = new THREE.AmbientLight(0x111111);

const buildLevelOne = function buildLevelOne() {
  const scene = this.buildBlankLevelOne();

  //FLOOR
  let mesh = objectBuilder.grassFloor({width: 100, height: 4, depth: 100}, {x: 0, y: -2.5, z: 0});
  scene.add(mesh);

  //RANDOM SHAPE GENERATOR
  const random = function random(low, high) {
    return Math.floor(Math.random()*(high - low + 1)) + low;
  }
  for (var i = 0; i < 20; i++) {
    const types = ['metalCrate', 'questionCrate', 'woodCrate', 'ancientCrate'];
    const size = random(2, 8);
    const x = random(-50, 50);
    const y = random(5, 40);
    const z = random(-50, 50);
    const type = random(0, types.length - 1);
    mesh = objectBuilder[types[type]]({width: size, height: size, depth: size}, {x, y, z});
    scene.add(mesh);
  }
  return scene;
}

const buildBlankLevelOne = function buildBlankLevelOne() {
const scene = new THREE.Scene();
scene.add(lights);

// Sunlight
let sunlight = new THREE.DirectionalLight();
sunlight.position.set(25, 25, 32.5);
sunlight.intensity = 1.9; //1.1
sunlight.castShadow = true;
// sunlight.shadow.mapSize.Width = sunlight.shadow.mapSize.Height = 2048;
sunlight.shadow.mapSize.x = sunlight.shadow.mapSize.y = 2048;
sunlight.shadow.camera.near = 10;
sunlight.shadow.camera.far = 300;
sunlight.shadow.camera.left = -60;
sunlight.shadow.camera.right = 60;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;

scene.add(sunlight);

const sky = objectBuilder.sky();
scene.add(sky);

return scene;
}

module.exports = function LevelBuilder() {
  this.buildLevelOne = buildLevelOne.bind(this);
  this.buildBlankLevelOne = buildBlankLevelOne.bind(this);
}