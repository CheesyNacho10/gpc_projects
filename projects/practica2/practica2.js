// Modulos necesarios
import * as THREE from '../../lib/three.module.js';
import { RobotArm } from '../../js/robot_arm/RobotArm.js'

// Variables globales
var renderer, scene, camera, controls, light;

// Models
var plane, robotArm;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    // Add light
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    scene.add(light);

    // Plane
    var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var planeMaterial = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);

    // Robot arm
    robotArm = new RobotArm();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(200, 200, 200);
    camera.lookAt(0, robotArm.stud.studHeight, 0);
}

function loadScene() {
    scene.add(plane);
    scene.add(robotArm.object);

    scene.add(new THREE.AxesHelper(100));
}

function update() {
}

function render () {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

// Acciones
init();
loadScene();
render();