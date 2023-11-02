// Modulos necesarios
// import * as THREE from '../../../lib/three.module.js';
// import { OrbitControls } from '../../../lib/OrbitControls.module.js';
// import { RobotArm } from '../../../js/robot_arm/RobotArm.js'
// import { RobotArmOptions } from '../../../js/robot_arm/RobotArm.js';

import * as THREE from '/gpc_projects/lib/three.module.js';
import { OrbitControls } from '/gpc_projects/lib/OrbitControls.module.js';
import { RobotArm } from '/gpc_projects/js/robot_arm/RobotArm.js'
import { RobotArmOptions } from '/gpc_projects/js/robot_arm/RobotArm.js';

// Variables globales
var renderer, scene, camera, controls, light;
var miniRenderer, miniCamera;

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
    var planeMaterial = new THREE.MeshNormalMaterial({ wireframe: false, flatShading: true });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);

    // Robot arm
    robotArm = new RobotArm(
        new RobotArmOptions({
            generalMaterial: new THREE.MeshNormalMaterial({wireframe: false, flatShading: true })
            })
        );

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(200, 200, 200);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, robotArm.stud.studHeight, 0); // Rotar alrededor de la escena
    controls.rotateSpeed = 0.5; // Velocidad de rotación
    controls.zoomSpeed = 1.2;   // Velocidad de zoom
    controls.panSpeed = 0.5;    // Velocidad de pan
    controls.enableZoom = true; // Habilitar el zoom
    controls.enablePan = true;  // Habilitar el pan
    controls.minDistance = 100; // Distancia mínima
    controls.maxDistance = 1000; // Distancia máxima

    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

    // Vista miniatura
    const size = Math.min(window.innerWidth, window.innerHeight) / 4;
    miniRenderer = new THREE.WebGLRenderer({ alpha: true });
    miniRenderer.setSize(size, size);
    document.getElementById('container').appendChild(miniRenderer.domElement);
    miniRenderer.domElement.style.position = 'absolute';
    miniRenderer.domElement.style.top = '0';
    miniRenderer.domElement.style.left = '0';

    miniCamera = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 1, 1000);
    miniCamera.position.set(0, 500, 0); // Posicionar encima del robot
    miniCamera.lookAt(scene.position);
}

function loadScene() {
    scene.add(plane);
    scene.add(robotArm.object);
}

function update() {
    controls.update();
    miniCamera.position.set(robotArm.object.position.x, 500, robotArm.object.position.z); // Asegurarse de que la cámara ortográfica esté siempre encima del robot
    miniCamera.lookAt(robotArm.object.position);
}

function render () {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
    miniRenderer.render(scene, miniCamera); // Renderizar la vista miniatura
}

window.addEventListener('resize', function() {
    const size = Math.min(window.innerWidth, window.innerHeight) / 4;
    miniRenderer.setSize(size, size);
    miniCamera.left = -size / 2;
    miniCamera.right = size / 2;
    miniCamera.top = size / 2;
    miniCamera.bottom = -size / 2;
    miniCamera.updateProjectionMatrix();
});

// Acciones
init();
loadScene();
render();