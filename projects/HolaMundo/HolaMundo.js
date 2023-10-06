// Escena Cubo
// Cargar libreria
import * as THREE from '../../lib/three.module.js';

// Variables globales
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x2200aa);

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

// Cubo
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: "rgb(20,20,70)", wireframe: true } );
var cube = new THREE.Mesh( geometry, material );
cube.position.x = 1;

scene.add( cube );

// Posicion de la camara
camera.position.z = 5;
camera.position.y = 1;

// Render
// renderer.render( scene, camera );

// Animacion
var animate = function () {
    cube.rotation.x += 0.01;
    scene.rotation.y += 0.01;
    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}

animate();
