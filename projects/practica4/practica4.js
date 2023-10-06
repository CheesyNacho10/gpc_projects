// Modulos necesarios
import * as THREE from '../../../lib/three.module.js';
import { OrbitControls } from './../../../lib/OrbitControls.module.js';
import { RobotArm } from '../../../js/robot_arm/RobotArm.js'
import { RobotArmOptions } from '../../js/robot_arm/RobotArm.js';
import { TWEEN } from '../../lib/tween.module.min.js';
import { GUI } from '../../lib/lil-gui.module.min.js';

// Variables globales
var renderer, scene, camera, controls, light;
var miniRenderer, miniCamera;
var controlers, effectController, isAnimating = false;
var animations = [];

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
    var planeMaterial = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true });
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

    createGUI();
    defineAnimations();
}

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft': // Flecha izquierda
            robotArm.moveLeft();
            break;
        case 'ArrowUp': // Flecha arriba
            robotArm.moveForward();
            break;
        case 'ArrowRight': // Flecha derecha
            robotArm.moveRight();
            break;
        case 'ArrowDown': // Flecha abajo
            robotArm.moveBackward();
            break;
    }
});

function createGUI() {
    effectController = {
        baseRotation: 0.0,
        armRotation: 0.0,
        forearmYRotation: 0.0,
        forearmZRotation: 0.0,
        wristRotation: 0.0,
        clawOpening: 7.5,
        isAlambric: false,
        animate: toggleAnimation
    };

    controlers = {};

    var gui = new GUI();

    var h = gui.addFolder("Control robot");
    controlers.baseRotation =
        h.add(effectController, "baseRotation", -180.0, 180.0, 0.1)
            .name("Giro base")
            .onChange(value => robotArm.setBaseRotation(value * Math.PI / 180.0));
    controlers.armRotation =
        h.add(effectController, "armRotation", -45.0, 45.0, 0.1)
            .name("Giro brazo")
            .onChange(value => robotArm.setAxisRotation(value * Math.PI / 180.0));
    controlers.forearmYRotation =
        h.add(effectController, "forearmYRotation", -180.0, 180.0, 0.1)
            .name("Giro antebrazo Y")
            .onChange(value => robotArm.setKneeCapYRotation(value * Math.PI / 180.0));
    controlers.forearmZRotation =
        h.add(effectController, "forearmZRotation", -90.0, 90.0, 0.1)
            .name("Giro antebrazo Z")
            .onChange(value => robotArm.setKneeCapZRotation(value * Math.PI / 180.0));
    controlers.wristRotation =
        h.add(effectController, "wristRotation", -40.0, 220.0, 0.1)
            .name("Giro muñeca")
            .onChange(value => robotArm.setWristRotation(value * Math.PI / 180.0));
    controlers.clawOpening =
        h.add(effectController, "clawOpening", 0.0, 15.0, 0.1)
            .name("Apertura pinza")
            .onChange(value => robotArm.setFingersOpen(value));
    h.add(effectController, "isAlambric")
        .name("Alámbrico")
        .onChange((value) => {
            robotArm.setAlambricMode(value);
            plane.material.wireframe = value;
        });
    h.add(effectController, "animate").name("Animar");
}

function defineAnimations() {
    animations = [
        new TWEEN.Tween(robotArm.base.object.rotation)
            .to({ y: [robotArm.base.object.rotation.y, robotArm.base.object.rotation.y + 2 * Math.PI] }, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function(value) {
                robotArm.base.object.rotation.y = value.y;
                effectController.baseRotation = (robotArm.base.object.rotation.y * 180 / Math.PI + 180) % 360 - 180;
                controlers.baseRotation.updateDisplay();
            })
            .repeat(Infinity)
        ,
        createPendulumTween(robotArm.arm.rotation.z, Math.PI/4, -Math.PI/4)
    ];
}

function createPendulumTween(object, property, start, max, min, duration = 1500) {
    let toMax = new TWEEN.Tween(object)
        .to({ [property]: max }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            if (object === robotArm.arm.rotation && property === 'z') {
                effectController.armRotation = (robotArm.arm.rotation.z * 180 / Math.PI + 180) % 360 - 180;
                controlers.armRotation.updateDisplay();
            }
            // Add similar conditions for other properties if needed
        });

    let toMin = new TWEEN.Tween(object)
        .to({ [property]: min }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut);

    let toStart = new TWEEN.Tween(object)
        .to({ [property]: start }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            toMax.start(); // Start the chain again
        });

    // Chain the tweens
    toMax.chain(toMin);
    toMin.chain(toStart);

    return toMax; // Return the first tween in the chain
}


function toggleAnimation() {
    if (isAnimating) {
        animations.forEach(animation => animation.stop());
        isAnimating = false;
    } else {
        defineAnimations();
        animations.forEach(animation => animation.start());
        isAnimating = true;
    }
}

function loadScene() {
    scene.add(plane);
    scene.add(robotArm.object);
}

function update() {
    controls.update();
    miniCamera.position.set(robotArm.object.position.x, 500, robotArm.object.position.z); // Asegurarse de que la cámara ortográfica esté siempre encima del robot
    miniCamera.lookAt(robotArm.object.position);
    TWEEN.update();
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