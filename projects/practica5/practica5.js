// Modulos necesarios

const githubPagesPath = "gpc_projects/";
const relativePath = "../../../";
let importPath = false ? githubPagesPath : relativePath

import * as THREE from '../../../lib/three.module.js';
import { OrbitControls } from '../../../lib/OrbitControls.module.js';
import { RobotArm } from '../../../js/robot_arm/RobotArm.js'
import { RobotArmOptions } from '../../../js/robot_arm/RobotArm.js';
import { TWEEN } from '../../../lib/tween.module.min.js';
import { GUI } from '../../../lib/lil-gui.module.min.js';

// import * as THREE from 'gpc_projects/lib/three.module.js';
// import { OrbitControls } from 'gpc_projects/lib/OrbitControls.module.js';
// import { RobotArm } from 'gpc_projects/js/robot_arm/RobotArm.js'
// import { RobotArmOptions } from 'gpc_projects/js/robot_arm/RobotArm.js';
// import { TWEEN } from 'gpc_projects/lib/tween.module.min.js';
// import { GUI } from 'gpc_projects/lib/lil-gui.module.min.js';

// Variables globales
var renderer, scene, camera, controls, light;
var miniRenderer, miniCamera;
var controlers, effectController, isAnimating = false;

// Models
var plane, room, robotArm;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    // Add light
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    scene.add(light);

    // Materials
    const texturePath = "../../images/";

    const texsuelo = new THREE.TextureLoader().load(texturePath+"pisometalico_1024.jpg");
    texsuelo.repeat.set(4, 3);
    texsuelo.wrapS = texsuelo.wrapT = THREE.RepeatWrapping;
    const matsuelo = new THREE.MeshStandardMaterial({color: "grey", map: texsuelo});

    // Room
    room = new THREE.Mesh(
        new THREE.BoxGeometry(1000, 1000, 1000),
        [
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"posx.jpg"), side: THREE.BackSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"negx.jpg"), side: THREE.BackSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"posy.jpg"), side: THREE.BackSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"negy.jpg"), side: THREE.BackSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"posz.jpg"), side: THREE.BackSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(texturePath+"negz.jpg"), side: THREE.BackSide})
        ]
    )
    room.position.set(0, 250, 0);
    room.receiveShadow = true;

    // Plane
    plane = new THREE.Mesh( new THREE.PlaneGeometry(750, 750, 10, 10), matsuelo );
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;

    // Robot arm
    const texturaMadera = new THREE.TextureLoader().load(texturePath+"wood512.jpg");
    const materialMadera = new THREE.MeshLambertMaterial({color: 'brown', map: texturaMadera});

    const texturaMetal = new THREE.TextureLoader().load(texturePath+"metal_128.jpg");
    const materialMetal = new THREE.MeshPhongMaterial({color: 'gray', specular: 'gray', shininess: 30, map: texturaMetal});

    const archivosReflejo = [ texturePath + "posx.jpg", texturePath + "negx.jpg",
                        texturePath+ "posy.jpg", texturePath + "negy.jpg",
                        texturePath + "posz.jpg", texturePath + "negz.jpg"];
    const texturaReflejo = new THREE.CubeTextureLoader().load(archivosReflejo);
    const materialReflejo = new THREE.MeshPhongMaterial({color: 'white', 
                                                        specular: 'gray',
                                                        shininess: 30,
                                                        envMap: texturaReflejo});

    const robotArmOptions = new RobotArmOptions({
            generalMaterial: new THREE.MeshNormalMaterial({wireframe: false, flatShading: true })
        })
    robotArmOptions.robotFingerOptions.material = materialMadera;
    robotArmOptions.robotWristOptions.material = materialMadera;
    robotArmOptions.robotNerveOptions.material = materialMadera;
    robotArmOptions.robotDiskOptions.material = materialMadera;
    robotArmOptions.robotKneeCapOptions.material = materialReflejo;
    robotArmOptions.robotStudOptions.material = materialMetal;
    robotArmOptions.robotAxisOptions.material = materialMetal;
    robotArmOptions.robotBaseOptions.material = materialMetal;

    robotArm = new RobotArm(robotArmOptions);
    robotArm.object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

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
    miniRenderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(miniRenderer.domElement);
    miniRenderer.domElement.style.position = 'absolute';
    miniRenderer.domElement.style.top = '0';
    miniRenderer.domElement.style.left = '0';

    miniCamera = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 1, 1000);
    miniCamera.position.set(0, 500, 0); // Posicionar encima del robot
    miniCamera.lookAt(scene.position);

    createGUI();

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-200, 200, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

    // Luz puntual (focal)
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(200, 300, 200);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI/7;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    spotLight.shadow.camera.far = 800;
    spotLight.shadow.camera.fov = 80;
    scene.add(spotLight);
    // scene.add(new THREE.CameraHelper(spotLight.shadow.camera));
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

    const baseRotationMin = -180.0; const baseRotationMax = 180.0;
    controlers.baseRotation = [
        h.add(effectController, "baseRotation", baseRotationMin, baseRotationMax, 0.1)
            .name("Giro base")
            .onChange(value => robotArm.setBaseRotation(value * Math.PI / 180.0)),
        baseRotationMin, baseRotationMax];
    
    const armRotationMin = -45.0; const armRotationMax = 45.0;
    controlers.armRotation = [
        h.add(effectController, "armRotation", armRotationMin, armRotationMax, 0.1)
            .name("Giro brazo")
            .onChange(value => robotArm.setAxisRotation(value * Math.PI / 180.0)),
        armRotationMin, armRotationMax];

    const forearmYRotationMin = -180.0; const forearmYRotationMax = 180.0;
    controlers.forearmYRotation = [
        h.add(effectController, "forearmYRotation", forearmYRotationMin, forearmYRotationMax, 0.1)
            .name("Giro antebrazo Y")
            .onChange(value => robotArm.setKneeCapYRotation(value * Math.PI / 180.0)),
        forearmYRotationMin, forearmYRotationMax];

    const forearmZRotationMin = -90.0; const forearmZRotationMax = 90.0;
    controlers.forearmZRotation = [
        h.add(effectController, "forearmZRotation", forearmZRotationMin, forearmZRotationMax, 0.1)
            .name("Giro antebrazo Z")
            .onChange(value => robotArm.setKneeCapZRotation(value * Math.PI / 180.0)),
        forearmZRotationMin, forearmZRotationMax];

    const wristRotationMin = -40.0; const wristRotationMax = 220.0;
    controlers.wristRotation = [
        h.add(effectController, "wristRotation", wristRotationMin, wristRotationMax, 0.1)
            .name("Giro muñeca")
            .onChange(value => robotArm.setWristRotation(value * Math.PI / 180.0)),
        wristRotationMin, wristRotationMax];

    const clawOpeningMin = 0.0; const clawOpeningMax = 15.0;
    controlers.clawOpening = [
        h.add(effectController, "clawOpening", clawOpeningMin, clawOpeningMax, 0.1)
            .name("Apertura pinza")
            .onChange(value => robotArm.setFingersOpen(value)),
        clawOpeningMin, clawOpeningMax];
    h.add(effectController, "isAlambric")
        .name("Alámbrico")
        .onChange((value) => {
            robotArm.setAlambricMode(value);
            plane.material.wireframe = value;
            room.material.wireframe = value;
        });
    h.add(effectController, "animate").name("Animar");
}

function toggleAnimation() {
    if (isAnimating) {
        // Detener todas las animaciones
        TWEEN.removeAll();
        isAnimating = false;
    } else {
        isAnimating = true;

        Object.keys(controlers).forEach(key => {
            const controller = controlers[key][0];
            const startValue = controller.getValue();
            const minValue = controlers[key][1];
            const maxValue = controlers[key][2];

            const randomTime = Math.random() * 5000 + 2000;
            const durationToMax = randomTime * (maxValue - startValue) / (maxValue - minValue);
            const durationToMin = randomTime * (startValue - minValue) / (maxValue - minValue);

            new TWEEN.Tween({ value: startValue })
                .to({ value: maxValue }, durationToMax)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function (object) {
                    controller.setValue(object.value);
                    updateRobotArmFromController(key, object.value);
                })
                .onComplete(function() {
                    new TWEEN.Tween({ value: maxValue })
                        .to({ value: minValue }, durationToMin * 2)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onUpdate(function (object) {
                            controller.setValue(object.value);
                            updateRobotArmFromController(key, object.value);
                        })
                        .repeat(Infinity) // Repetir infinitamente
                        .yoyo(true) // Ida y vuelta
                        .start();
                })
                .start();
        });
    }
}

function updateRobotArmFromController(key, value) {
    switch (key) {
        case 'baseRotation':
            robotArm.setBaseRotation(value * Math.PI / 180.0);
            break;
        case 'armRotation':
            robotArm.setAxisRotation(value * Math.PI / 180.0);
            break;
        case 'forearmYRotation':
            robotArm.setKneeCapYRotation(value * Math.PI / 180.0);
            break;
        case 'forearmZRotation':
            robotArm.setKneeCapZRotation(value * Math.PI / 180.0);
            break;
        case 'wristRotation':
            robotArm.setWristRotation(value * Math.PI / 180.0);
            break;
        case 'clawOpening':
            robotArm.setFingersOpen(value);
            break;
    }
}

function loadScene() {
    scene.add(room);
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