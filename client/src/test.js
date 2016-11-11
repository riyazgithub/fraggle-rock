const THREE = require('three');
const sceneUtility = require('./sceneUtility');

var scene = new THREE.Scene();




var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

scene.add( new THREE.AmbientLight( 0x505050 ) );

var light = new THREE.SpotLight( 0xffffff, 1.5 );
light.position.set( -40, 10, 20 );
light.castShadow = true;

light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 500, 1, 200, 10000 ) );
light.shadow.bias = - 0.00022;

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;

scene.add( light );

var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshLambertMaterial( {color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
cube.position.x = 5;
scene.add(cube);

camera.position.z = 10;

function render() {
	requestAnimationFrame(render);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01
	renderer.render(scene, camera);
}
render();

