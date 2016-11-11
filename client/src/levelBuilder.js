const THREE = require('three');

module.exports = {
  buildLevelOne: function buildLevelOne() {
    const scene = new THREE.Scene();

    window.addEventListener( 'resize', onResize, false );

    function onResize() {
            renderer.setSize( window.innerWidth, window.innerHeight );
            camera.aspect = ( window.innerWidth / window.innerHeight );
            camera.updateProjectionMatrix();
          }

    // load a texture, set wrap mode to repeat
    // let woodCrate = new THREE.TextureLoader().load( 'textures/woodcratesm.jpg' );
    // woodCrate.wrapS = THREE.RepeatWrapping;
    // woodCrate.wrapT = THREE.RepeatWrapping;
    // woodCrate.repeat.set( 1, 1 );

    // let metalCrate = new THREE.TextureLoader().load( 'textures/metalcratesm.jpg' );
    // metalCrate.wrapS = THREE.RepeatWrapping;
    // metalCrate.wrapT = THREE.RepeatWrapping;
    // metalCrate.repeat.set( 1, 1 );

    // let questionCrate = new THREE.TextureLoader().load( 'textures/questioncrate.jpg' );
    // questionCrate.wrapS = THREE.RepeatWrapping;
    // questionCrate.wrapT = THREE.RepeatWrapping;
    // questionCrate.repeat.set( 1, 1 );

    // let grass = new THREE.TextureLoader().load( 'textures/grass-repeating.jpg' );
    // grass.wrapS = THREE.RepeatWrapping;
    // grass.wrapT = THREE.RepeatWrapping;
    // grass.repeat.set( 40, 40 );

    // let futureTile = new THREE.TextureLoader().load( 'textures/futuretile.jpg' );
    // futureTile.wrapS = THREE.RepeatWrapping;
    // futureTile.wrapT = THREE.RepeatWrapping;
    // futureTile.repeat.set( 20, 20 );

    // Ambient Light
    scene.add(new THREE.AmbientLight(0x111111));

    // Sunlight
    let sunlight = new THREE.DirectionalLight();
    sunlight.position.set(250, 250, 325);
    sunlight.intensity = 1.1;
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.Width = sunlight.shadow.mapSize.Height = 2048;
    sunlight.shadow.camera.near = 200;
    sunlight.shadow.camera.far = 600;
    // sunlight.shadow.camera.left = -200;
    // sunlight.shadow.camera.right = 200;
    // sunlight.shadow.camera.top = 200;
    // sunlight.shadow.camera.bottom = -200;

    scene.add(sunlight);

    // Drop Shadow light (small, light shadow where object meets ground)
    let droplight = new THREE.DirectionalLight();
    droplight.position.set(0, 250, 0);
    droplight.intensity = .3;
    droplight.castShadow = true;
    droplight.shadow.mapSize.Width = droplight.shadow.mapSize.Height = 2048;
    droplight.shadow.camera.near = 200;
    droplight.shadow.camera.far = 600;
    // droplight.shadow.camera.left = -200;
    // droplight.shadow.camera.right = 200;
    // droplight.shadow.camera.top = 200;
    // droplight.shadow.camera.bottom = -200;

    scene.add(droplight);

    //Sky
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
    scene.add( sky.mesh );


    // Metal Crate
    let texture = new THREE.TextureLoader().load( 'textures/metalcratesm.jpg' );
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshLambertMaterial({ map: texture });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    mesh.position.x = 5;
    mesh.position.y = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let metalCrate = mesh;
    scene.add(mesh);


    // Question Crate
    texture = new THREE.TextureLoader().load( 'textures/questioncrate.jpg' );
    material = new THREE.MeshLambertMaterial({ map: texture, transparent: false, opacity: 1 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    mesh.position.y = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let questionCrate = mesh;
    scene.add(mesh);

    // Wood Crate
    texture = new THREE.TextureLoader().load( 'textures/woodcratesm.jpg' );
    material = new THREE.MeshLambertMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    mesh.position.x = -5;
    mesh.position.y = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let woodCrate = mesh;
    scene.add(mesh);

    // Magic Crate
    texture = new THREE.TextureLoader().load( 'textures/ancientcrate.jpg' );
    material = new THREE.MeshLambertMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -7;
    mesh.position.x = -5;
    mesh.position.y = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let ancientCrate = mesh;
    scene.add(mesh);

    // //cube creator
    // for(let i = 0; i < 64; i++) {
    //   let g = new THREE.BoxGeometry(.5, .5, .5);
    //   let ma = new THREE.MeshLambertMaterial({ color: 'green' });
    //   let me = new THREE.Mesh(geometry, material);
    //   mesh.position.x = x;
    //   mesh.position.y = y;
    //   mesh.position.z = z;
    //   z += 0.51
    //   scene.add(mesh);
    // }

    //random object generator
    for(let i = 0; i < 35; i++) {
      var rand = Math.floor(Math.random() * 4);
      console.log(i, rand)
      if (rand === 0) {
        scene.add(metalCrate);
      } else if (rand === 1) {
        scene.add(questionCrate);
      } else if (rand === 2) {
        scene.add(woodCrate);
      } else {
        scene.add(ancientCrate)
      }
    }

    // FLOOR
    let grass = new THREE.TextureLoader().load( 'textures/grass-repeating4.jpg' );
    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;
    grass.repeat.set( 40, 40 );
    geometry = new THREE.BoxGeometry(100, 0.1, 100);
    material = new THREE.MeshLambertMaterial({ map: grass });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -.1;
    mesh.receiveShadow = true;

    scene.add(mesh);
    return scene;
  }
}