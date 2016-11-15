const THREE = require('three');

const LoadTexture = function LoadTexture(texturePath) {
  return new THREE.TextureLoader().load(texturePath);
};

const MeshLambertMaterial = function MeshLambertMaterial(texturePath) {
  return new THREE.MeshLambertMaterial({map: LoadTexture(texturePath)})
};
const RedBall = function RedBall() {
  const redBall = new THREE.TextureLoader().load( 'textures/redball2.jpg' );
  redBall.wrapS = THREE.RepeatWrapping;
  redBall.wrapT = THREE.RepeatWrapping;
  redBall.repeat.set( 1, 1 );
  return redBall;
}
const redBallMaterial = new THREE.MeshLambertMaterial( {map: RedBall()} );
const playerMaterial = new THREE.MeshLambertMaterial({ color: 'green' });
const metalCrateMaterial = MeshLambertMaterial('textures/metalcratesm.jpg');
const questionCrateMaterial = MeshLambertMaterial('textures/questioncrate.jpg');
const woodCrateMaterial = MeshLambertMaterial('textures/woodcratesm.jpg');
const ancientCrateMaterial = MeshLambertMaterial('textures/ancientcrate.jpg');

const sky = (() => {
  let sky = {};
  let imagePrefix = "textures/dawnmountain-";
  let directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  let imageSuffix = ".png";
  sky.geometry = new THREE.CubeGeometry( 500, 500, 500 );

  let materialArray = [];
  for (let i = 0; i < 6; i++)
      materialArray.push( new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
          side: THREE.BackSide
      }));
  sky.material = new THREE.MeshFaceMaterial( materialArray );
  sky.mesh = new THREE.Mesh( sky.geometry, sky.material );
  return sky.mesh;
})();

const BoxGeometry = function BoxGeometry(size) {
  return new THREE.BoxGeometry(size.width, size.height, size.depth);
};


const addShadow = function addShadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

const initPosition = function initPosition(mesh, position, quaternion) {
  if (position) {
    mesh.position.copy(position);
  }
  if (quaternion) {
    quaternion.w = quaternion._w;
    quaternion.x = quaternion._x;
    quaternion.y = quaternion._y;
    quaternion.z = quaternion._z;
    mesh.quaternion.copy(quaternion);
  }
}

const volumeOf = function volumeOf(size) {
  return size.width * size.height * size.depth;
}

module.exports = {
  grassFloor: function(size, position, quaternion) { // {width, height, depth}, {x, y, z}, {w, x, y, z}
    const grass = new THREE.TextureLoader().load( 'textures/grass-repeating4.jpg' );
    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;
    grass.repeat.set( 40, 40 );
    const geometry = BoxGeometry(size);
    const material = new THREE.MeshLambertMaterial({ map: grass });
    const mesh = new THREE.Mesh(geometry, material);
    addShadow(mesh);
    initPosition(mesh, position, quaternion);
    mesh.userData.name = 'grassFloor'
    mesh.userData.mass = 0;
    return mesh;
  },
  metalCrate: function(size, position, quaternion) {
    const mesh = new THREE.Mesh(BoxGeometry(size), metalCrateMaterial);
    addShadow(mesh);
    initPosition(mesh, position, quaternion);
    mesh.userData.name = 'metalCrate';
    mesh.userData.mass = volumeOf(size);
    return mesh;
  },
  questionCrate: function(size, position, quaternion) {
    const mesh = new THREE.Mesh(BoxGeometry(size), questionCrateMaterial);
    addShadow(mesh);
    initPosition(mesh, position, quaternion);
    mesh.userData.name = 'questionCrate';
    mesh.userData.mass = volumeOf(size);
    return mesh;
  },
  woodCrate: function(size, position, quaternion) {
    const mesh = new THREE.Mesh(BoxGeometry(size), woodCrateMaterial);
    addShadow(mesh);
    initPosition(mesh, position, quaternion);
    mesh.userData.name = 'woodCrate';
    mesh.userData.mass = volumeOf(size);
    return mesh;
  },
  ancientCrate: function(size, position, quaternion) {
    const mesh = new THREE.Mesh(BoxGeometry(size), ancientCrateMaterial);
    addShadow(mesh);
    initPosition(mesh, position, quaternion);
    mesh.userData.name = 'ancientCrate';
    mesh.userData.mass = volumeOf(size);
    return mesh;
  },
  playerModel: function(position, quaternion) {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const mesh = new THREE.Mesh(geometry, playerMaterial);
    initPosition(mesh, position, quaternion);
    addShadow(mesh);
    mesh.userData.name = 'playerModel';
    return mesh;
  },
  redBall: function(size, position, quaternion) {
    let redBall = redBall;
    const geometry = new THREE.SphereGeometry( size.radius, size.widthSegments, size.heightSegments );
    const ballMesh = new THREE.Mesh( geometry, redBallMaterial );
    addShadow(ballMesh);
    initPosition(ballMesh, position, quaternion);
    ballMesh.userData.name = 'redBall';
    return ballMesh;
  },
  sky: function() {
    return sky;
  }
}

// //Side Panel +z
// let futureTile = new THREE.TextureLoader().load( 'textures/futuretile.jpg' );
// futureTile.wrapS = THREE.RepeatWrapping;
// futureTile.wrapT = THREE.RepeatWrapping;
// futureTile.repeat.set( 15, 2.5/3 );
// geometry = new THREE.BoxGeometry(45, 0.1, 2.5);
// material = new THREE.MeshLambertMaterial({ map: futureTile,  transparent: true, opacity: .5  });
// mesh = new THREE.Mesh(geometry, material);
// mesh.position.y = 0.5;
// mesh.position.x = 0;
// mesh.position.z = 23.5;
// mesh.receiveShadow = true;
// mesh.rotation.x = - Math.PI / 6;
// scene.add(mesh);

// //Side Panel -z
// futureTile = new THREE.TextureLoader().load( 'textures/futuretile.jpg' );
// futureTile.wrapS = THREE.RepeatWrapping;
// futureTile.wrapT = THREE.RepeatWrapping;
// futureTile.repeat.set( 15, 2.5/3 );
// geometry = new THREE.BoxGeometry(45, 0.1, 2.5);
// material = new THREE.MeshPhongMaterial({ map: futureTile,  transparent: true, opacity: .5 });
// mesh = new THREE.Mesh(geometry, material);
// mesh.position.y = 0.5;
// mesh.position.x = 0;
// mesh.position.z = -23.5;
// mesh.receiveShadow = true;
// mesh.rotation.x = Math.PI / 6;
// scene.add(mesh);

// //Score Board
// let openEnded = false;
// let height = 10;
// geometry = new THREE.CylinderGeometry(.1, .1, height, 10, 10, openEnded);
// material = new THREE.MeshLambertMaterial({ color: new THREE.Color( 0x0e1c33 )  });
// mesh = new THREE.Mesh(geometry, material);
// mesh.position.x = -22.5;
// mesh.position.z = -2;
// mesh.position.y = height/2 - .2;
// scene.add(mesh);

// openEnded = false;
// height = 10;
// geometry = new THREE.CylinderGeometry(.1, .1, height, 10, 10, openEnded);
// material = new THREE.MeshLambertMaterial({ color: new THREE.Color( 0x0e1c33 )  });
// mesh = new THREE.Mesh(geometry, material);
// mesh.position.x = -22.5;
// mesh.position.z = 2;
// mesh.position.y = height/2 - .2;
// scene.add(mesh);

// futureTile = new THREE.TextureLoader().load( 'textures/scoreboard.png' );
// // futureTile.wrapS = THREE.RepeatWrapping;
// // futureTile.wrapT = THREE.RepeatWrapping;
// // futureTile.repeat.set( 9/4 , 1 );
// geometry = new THREE.BoxGeometry(9, 0.1, 4);
// material = new THREE.MeshPhongMaterial({ map: futureTile,  transparent: true, opacity: 1 });
// mesh = new THREE.Mesh(geometry, material);
// mesh.position.y = 7.5;
// mesh.position.x = -22.3;
// mesh.receiveShadow = true;
// mesh.rotation.x = - Math.PI / 2;
// mesh.rotation.z = Math.PI / 2;
// scene.add(mesh);

// var loader = new THREE.FontLoader();
// let font = loader.load( 'Arial_Regular.json', function(font) {
//   geometry = new THREE.TextGeometry("5", { font: font, size: 1.3, height: .06, curveSegments: 3})
//   material = new THREE.MeshPhongMaterial({ color: 'yellow',  transparent: true, opacity: 1  });
//   mesh = new THREE.Mesh(geometry, material);
//   mesh.position.x = -22.3;
//   mesh.position.y = 6.3;
//   mesh.position.z = 2.9;
//   mesh.rotation.y = Math.PI / 2;
//   scene.add(mesh);

//   geometry = new THREE.TextGeometry("5", { font: font, size: 1.3, height: .06, curveSegments: 3})
//   material = new THREE.MeshPhongMaterial({ color: 'yellow',  transparent: true, opacity: 1  });
//   mesh = new THREE.Mesh(geometry, material);
//   mesh.position.x = -22.3;
//   mesh.position.y = 6.3;
//   mesh.position.z = -1.9;
//   mesh.rotation.y = Math.PI / 2;
//   scene.add(mesh);

//   geometry = new THREE.TextGeometry("2:51", { font: font, size: .8, height: .06, curveSegments: 3})
//   material = new THREE.MeshPhongMaterial({ color: 'yellow',  transparent: true, opacity: 1  });
//   mesh = new THREE.Mesh(geometry, material);
//   mesh.position.x = -22.3;
//   mesh.position.y = 8.3;
//   mesh.position.z = 1.1;
//   mesh.rotation.y = Math.PI / 2;
//   scene.add(mesh);
// });