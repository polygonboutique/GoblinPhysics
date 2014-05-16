window.exampleUtils = (function(){
	var renderer,
		camera,
		controls,
		world;
	
	var objects = [];

	var startThree = function() {
		// Setup Three.js
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
		document.body.appendChild( renderer.domElement );

		exampleUtils.scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set( 0, 15, 30 );
		camera.lookAt( exampleUtils.scene.position );

		controls = new THREE.TrackballControls( camera, renderer.domElement );

		var ambient_light = new THREE.AmbientLight( new THREE.Color( 0x333333 ) );
		exampleUtils.scene.add( ambient_light );

		var directional_light = new THREE.DirectionalLight( new THREE.Color( 0xFFFFFF ) );
		directional_light.position.set( 10, 30, 20 );
		directional_light.shadowCameraLeft = directional_light.shadowCameraBottom = -50;
		directional_light.shadowCameraRight = directional_light.shadowCameraTop = 50;
		directional_light.castShadow = true;
		directional_light.shadowCameraNear = 1;
		directional_light.shadowCameraFar = 50;
		directional_light.shadowCameraFov = 50;
		directional_light.shadowDarkness = 0.5;
		exampleUtils.scene.add( directional_light );
	};

	var startGoblin = function() {
		exampleUtils.world = world = new Goblin.World( new Goblin.BasicBroadphase(), new Goblin.NearPhase(), new Goblin.SequentialImpulseSolver() );
	};

	return {
		objects: objects,
		scene: null,
		world: null,
		ontick: null,

		initialize: function() {
			startThree();
			startGoblin();
		},

		materials: {
			wood: {
				diffuse: '228_diffuse.png',
				normal: '228_normal.png',
				normal_scale: 7
			},
			pebbles: {
				diffuse: '254_diffuse.png',
				normal: '254_normal.png',
				normal_scale: 4
			},
			rusted_metal: {
				diffuse: '210_diffuse.png',
				normal: '210_normal.png',
				specular: '210_specular.png',
				shininess: 200,
				normal_scale: 4,
				metal: true
			},
			scratched_metal: {
				diffuse: '213_diffuse.png',
				normal: '213_normal.png',
				specular: '213_specular.png',
				shininess: 300,
				normal_scale: 3,
				metal: true
			},
			cement: {
				diffuse: '173_diffuse.png',
				normal: '173_normal.png',
				specular: '173_specular.png',
				shininess: 30,
				normal_scale: 2
			}
		},

        render: function() {
            // Sync objects
            var i, object;
            for ( i = 0; i < objects.length; i++ ) {
                object = objects[i];
                object.position.set(
                    object.goblin.position[0],
                    object.goblin.position[1],
                    object.goblin.position[2]
                );
                object.quaternion.set(
                    object.goblin.rotation[0],
                    object.goblin.rotation[1],
                    object.goblin.rotation[2],
                    object.goblin.rotation[3]
                );
            }

            renderer.render( exampleUtils.scene, camera );
        },

		run: function() {
			requestAnimationFrame( exampleUtils.run );
			//setTimeout( exampleUtils.run, 50 );

			controls.update();
			world.step( 1 / 60 );
			exampleUtils.render();

			if ( exampleUtils.ontick ) exampleUtils.ontick();
		},

		withinEpsilon: function( value, expected ) {
			return Math.abs( value - expected ) <= Goblin.EPSILON;
		},

		createSphere: function( radius, mass, material ) {
			var sphere = new THREE.Mesh(
				new THREE.SphereGeometry( radius, 32, 32 ),
				material
			);
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			sphere.goblin = new Goblin.RigidBody(
				new Goblin.SphereShape( radius ),
				mass
			);

			objects.push( sphere );
			exampleUtils.scene.add( sphere );
			world.addRigidBody( sphere.goblin );

			return sphere;
		},

		createBox: function( half_width, half_height, half_length, mass, material ) {
			var box = new THREE.Mesh(
				new THREE.BoxGeometry( half_width * 2, half_height * 2, half_length * 2 ),
				material
			);
			box.castShadow = true;
			box.receiveShadow = true;
			box.goblin = new Goblin.RigidBody(
				new Goblin.BoxShape( half_width, half_height, half_length ),
				mass
			);

			objects.push( box );
			exampleUtils.scene.add( box );
			world.addRigidBody( box.goblin );

			return box;
		},

		createCylinder: function( radius, half_height, mass, material ) {
			var cylinder = new THREE.Mesh(
				new THREE.CylinderGeometry( radius, radius, half_height * 2 ),
				new THREE.MeshNormalMaterial({ opacity: 1 })
			);
			cylinder.goblin = new Goblin.RigidBody(
				new Goblin.CylinderShape( radius, half_height ),
				mass
			);

			objects.push( cylinder );
			exampleUtils.scene.add( cylinder );
			world.addRigidBody( cylinder.goblin );

			return cylinder;
		},

		createCone: function( radius, half_height, mass, material ) {
			var cone = new THREE.Mesh(
				new THREE.CylinderGeometry( 0, radius, half_height * 2 ),
				new THREE.MeshNormalMaterial({ opacity: 1 })
			);
			cone.goblin = new Goblin.RigidBody(
				new Goblin.ConeShape( radius, half_height ),
				mass
			);

			objects.push( cone );
			exampleUtils.scene.add( cone );
			world.addRigidBody( cone.goblin );

			return cone;
		},

		createPlane: function( orientation, half_width, half_length, mass, material ) {
			var plane = new THREE.Mesh(
				new THREE.BoxGeometry(
					orientation === 1 || orientation === 2 ? half_width * 2 : 0.01,
					orientation === 0 ? half_width * 2 : ( orientation === 2 ? half_length * 2 : 0.01 ),
					orientation === 0 || orientation === 1 ? half_length * 2 : 0.01
				),
				material
			);
			plane.castShadow = true;
			plane.receiveShadow = true;
			plane.goblin = new Goblin.RigidBody(
				new Goblin.PlaneShape( orientation, half_width, half_length ),
				mass
			);

			objects.push( plane );
			exampleUtils.scene.add( plane );
			world.addRigidBody( plane.goblin );

			return plane;
		},

		createMaterial: function( name, repeat_x, repeat_y ) {
			var def = exampleUtils.materials[name],
				map = THREE.ImageUtils.loadTexture( 'textures/' + def.diffuse ),
				normalMap, specularMap,
				material_def = {
					shininess: 0
				};

			map.repeat.x = repeat_x;
			map.repeat.y = repeat_y;
			map.wrapS = map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = renderer.getMaxAnisotropy();
			material_def.map = map;

			if ( def.normal ) {
				normalMap = THREE.ImageUtils.loadTexture( 'textures/' + def.normal, THREE.RepeatWrapping );
				normalMap.repeat.x = repeat_x;
				normalMap.repeat.y = repeat_y;
				normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
				normalMap.anisotropy = renderer.getMaxAnisotropy();
				material_def.normalMap = normalMap;
			}

			if ( def.specular ) {
				specularMap = THREE.ImageUtils.loadTexture( 'textures/' + def.specular, THREE.RepeatWrapping );
				specularMap.repeat.x = repeat_x;
				specularMap.repeat.y = repeat_y;
				specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
				specularMap.anisotropy = renderer.getMaxAnisotropy();
				material_def.specularMap = specularMap;
				material_def.shininess = def.shininess;
			}

			var material = new THREE.MeshPhongMaterial( material_def );

			if ( def.normal_scale ) {
				material.normalScale.set( def.normal_scale, def.normal_scale );
			}

			if ( def.metal ) {
				material.metal = true;
			}

			return material;
		}
	};
})();