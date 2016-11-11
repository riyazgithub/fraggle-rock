const THREE = require('three');

module.exports = {
  buildLevelOne: function buildLevelOne() {
    const scene = new THREE.Scene();

    // // load a texture, set wrap mode to repeat
    let texture = new THREE.TextureLoader().load( 'textures/woodcrate.jpg' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );

    let metalCrate = new THREE.TextureLoader().load( 'textures/metalcrate.jpg' );
    metalCrate.wrapS = THREE.RepeatWrapping;
    metalCrate.wrapT = THREE.RepeatWrapping;
    metalCrate.repeat.set( 1, 1 );

    let grass = new THREE.TextureLoader().load( 'textures/futuretile.jpg' );
    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;
    grass.repeat.set( 10, 10 );

    // Ambient Light
    scene.add(new THREE.AmbientLight(0x111111));

    //Sky
    // let skyBox = new THREE.CubeGeometry(100, 100, 100);
    // // let skySphere = new THREE.SphereGeometry(1000, 3, 3, 0, Math.PI*2, 0, Math.PI*2);
    // let skyText = new THREE.TextureLoader().load( 'textures/sky3.jpg' );
    // let mat = new THREE.MeshBasicMaterial({map: skyText, side: THREE.BackSide});
    // var sky = new THREE.Mesh(skyBox, mat);
    // sky.position.y = 50;
    // // sky.scale.set(-1, 1, 1);
    // // sky.eulerOrder = 'XZY';
    // // sky.renderDepth = 1000.0;
    // scene.add(sky);
    var imagePrefix = "textures/dawnmountain-";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 500, 500, 500 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );


    // Green Square
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({ map: metalCrate });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 5;
    mesh.position.y = 3;
    scene.add(mesh);

    // Red Square
    material = new THREE.MeshBasicMaterial({ map: metalCrate });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    mesh.position.y = 3;
    scene.add(mesh);

    // Blue Square
    material = new THREE.MeshBasicMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 5;
    mesh.position.y = 3;
    scene.add(mesh);

    // Yellow Square
    material = new THREE.MeshBasicMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -5;
    mesh.position.y = 3;
    scene.add(mesh);

    // FLOOR
    geometry = new THREE.BoxGeometry(25, 0.1, 25);
    material = new THREE.MeshBasicMaterial({ map: grass });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -.05;
    scene.add(mesh);
    return scene;
  }
}