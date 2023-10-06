// Modulos necesarios
import * as THREE from '../../lib/three.module.js';
import { GLTFLoader }  from '../../lib/GLTFLoader.module.js';
import { TWEEN } from '../../lib/tween.module.min.js';
import { GUI } from '../../lib/lil-gui.module.min.js';

// Variables globales
var renderer, scene, camera;
const L = 5;
var alzado, planta, perfil;
let effectController;

// Otras
let esferaCubo, cubo, esfera;
let angulo = 0;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    // renderer.domElement.addEventListener('dblclick', rotateShape);
    renderer.domElement.addEventListener('dblclick', animate);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0.5, 0.5, 0.5);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0.5, 2, 7);
    camera.lookAt(0, 1, 0);

    const ar = window.innerWidth / window.innerHeight;
    setCameras(ar);
    window.addEventListener('resize', updateAspectRatio);

    setupGUI();
}

function loadScene() {
    // Material sencillo
    const material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });

    // Suele 
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10, 10), material);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -0.2;
    scene.add(suelo);

    // Esfera y cubo
    esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), material);
    cubo = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
    esfera.position.x = 1;
    cubo. position.x = -1;

    esferaCubo = new THREE.Object3D();
    esferaCubo.add(esfera);
    esferaCubo.add(cubo);
    esferaCubo.position.y = 1.5;
    esferaCubo.name = "grupoEC";

    scene.add(esferaCubo);

    scene.add(new THREE.AxesHelper(3));
    cubo.add(new THREE.AxesHelper(1));

    // Modelos importados
    const loader = new THREE.ObjectLoader();
    loader.load('./../../../../models/soldado/soldado.json', function(objeto) {
        const soldado = new THREE.Object3D();
        soldado.add(objeto);
        cubo.add(soldado);
        objeto.position.y = 1;
        soldado.name = 'soldado';
    });

    const gllloader = new GLTFLoader();
    gllloader.load('./../../../../models/robota/scene.gltf', function(objeto) {
        esfera.add(objeto.scene);
        objeto.scene.scale.set(0.5, 0.5, 0.5);
        objeto.scene.position.y = 1;
        objeto.scene.rotation.y = -Math.PI / 2;
        objeto.scene.name = "robot";
    });
}

function setCameras(ar)
{
    let camaraOrto;
    if (ar>1) camaraOrto = new THREE.OrthographicCamera(-ar*L, ar*L, L, -L, -10, 1000);
    else camaraOrto = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -10, 1000);

    alzado = camaraOrto.clone();
    alzado.position.set(0, 0, 10);
    alzado.lookAt(0, 0, 0);

    perfil = camaraOrto.clone();
    perfil.position.set(10, 0, 0);
    perfil.lookAt(0, 0, 0);

    planta = camaraOrto.clone();
    planta.position.set(0, 10, 0);
    planta.lookAt(0, 0, 0);
    planta.up = new THREE.Vector3(0, 0, -1);
}

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if (ar >1) {
        alzado.left = perfil.left = planta.left = -ar * L;
        alzado.right = perfil.right = planta.right = ar * L;
        alzado.top = perfil.top = planta.top = L;
        alzado.bottom = perfil.bottom = planta.bottom = -L;
    } else {
        alzado.left = perfil.left = planta.left = -L;
        alzado.right = perfil.right = planta.right = L;
        alzado.top = perfil.top = planta.top = L / ar;
        alzado.bottom = perfil.bottom = planta.bottom = -L / ar;
    }
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}

function rotateShape(evento) {
    let x = evento.clientX;
    let y = evento.clientY;

    let derecha = false;
    let abajo = false;
    let cam = null;
    if (x > window.innerWidth / 2) {
        derecha = true;
        x -= window.innerWidth / 2;
    }
    if (y > window.innerHeight / 2) {
        abajo = true;
        y -= window.innerHeight / 2;
    }

    if (derecha)
        if (abajo) cam = camera;
        else cam = perfil;
    else
        if (abajo) cam = planta;
        else cam = alzado;

    x = (x * 4 / window.innerWidth) - 1;
    y = -(y * 4 / window.innerHeight) + 1;

    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x, y), cam);

    const intersecciones = rayo.intersectObjects(
        scene.getObjectByName("grupoEC").children, false);
    if (intersecciones.length > 0) {
        intersecciones[0].object.rotation.y += Math.PI / 8;
    }
}

function animate(event) {
    // Capturar y normalizar
    let x = event.clientX;
    let y = event.clientY;
    
    let derecha = false;
    let abajo = false;
    let cam = null;
    if (x > window.innerWidth / 2) {
        derecha = true;
        x -= window.innerWidth / 2;
    }
    if (y > window.innerHeight / 2) {
        abajo = true;
        y -= window.innerHeight / 2;
    }

    if (derecha)
        if (abajo) cam = camera;
        else cam = perfil;
    else
        if (abajo) cam = planta;
        else cam = alzado;

    x = (x * 4 / window.innerWidth) - 1;
    y = -(y * 4 / window.innerHeight) + 1;

    // Construir el rayo y detectar la intersección
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x, y), cam);
    const soldado = scene.getObjectByName('soldado');
    const robot = scene.getObjectByName('robot');

    let intersecciones = rayo.intersectObjects(soldado.children, true);
    if (intersecciones.length > 0) {
        new TWEEN.Tween(soldado.position)
            .to ( {x:[0,0], y:[3,0], z:[0,0] }, 2000)
            .interpolation(TWEEN.Interpolation.Bezier)
            .easing(TWEEN.Easing.Bounce.Out)
            .start();
    }

    intersecciones = rayo.intersectObjects(robot.children, true);
    if (intersecciones.length > 0) {
        new TWEEN.Tween(robot.rotation)
            .to ( {x:[0,0], y:[Math.PI, -Math.PI / 2], z:[0,0] }, 5000)
            .interpolation(TWEEN.Interpolation.Linear)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
}

function setupGUI() {
    // Definicion de los controles
    effectController = {
        mensaje: 'Soldado & Robota',
        giroY: 0.0,
        separacion: 0,
        colorsuelo: "rgb(255,255,0)"
    }

    const gui = new GUI();

    const h = gui.addFolder("Control esferaCubo");
    h.add(effectController, "mensaje").name("Aplicacion");
    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
    h.add(effectController, "separacion", { "Ninguna": 0, "Media": 2, "Total": 5 } ).name("Separacion");
    h.addColor(effectController, "colorsuelo").name("Color alambres");
}

function update() {
    TWEEN.update();
    // angulo += 0.01;
    scene.rotation.y = angulo;

    cubo.position.set(-1-effectController.separacion / 2, 0, 0);
    esfera.position.set(1+effectController.separacion / 2, 0, 0);
    cubo.material.setValues({ color: effectController.colorsuelo });
    esferaCubo.rotation.y = effectController.giroY * Math.PI / 180;
}

function render () {
    requestAnimationFrame(render);
    update();
    renderer.clear();
    renderer.render(scene, camera);
    let w = window.innerWidth / 2;
    let h = window.innerHeight / 2;
    renderer.setViewport(0, h, w, h);
    renderer.render(scene, alzado);
    renderer.setViewport(0, 0, w, h);
    renderer.render(scene, planta);
    renderer.setViewport(w, h, w, h);
    renderer.render(scene, perfil);
    renderer.setViewport(w, 0, w, h);
    renderer.render(scene, camera);
}   

// Acciones
init();
loadScene();
render();