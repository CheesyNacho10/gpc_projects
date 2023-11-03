import * as THREE from '../../lib/three.module.js';
import { TWEEN } from '../../lib/tween.module.min.js';
import { FroggerStage } from './js/FroggerStage.js';
import { FroggerFrog } from './js/FroggerFrog.js';

var renderer, scene, camera;
var froggerStage, froggerFrog;
var interval = 1500;
const intervalRatio = 0.995;
var lastTime = new Date().getTime();
var hasLoose = false;
const cameraRange = 500;
var generateSegments = false;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
    var cameraStartPosition = new THREE.Vector3(-50, 100, 50);
    var cameraStartTarget = new THREE.Vector3(0, 0, 0);
    camera.position.set(cameraStartPosition.x, cameraStartPosition.y, cameraStartPosition.z);
    camera.lookAt(cameraStartTarget);

    var cameraEndPosition = new THREE.Vector3(-25, 30, 0);
    var cameraEndTarget = new THREE.Vector3(50, 0, 0);
    
    var cameraPosition = { x: cameraStartPosition.x, y: cameraStartPosition.y, z: cameraStartPosition.z };
    var targetPosition = { x: cameraStartTarget.x, y: cameraStartTarget.y, z: cameraStartTarget.z };

    new TWEEN.Tween(cameraPosition)
        .to({ x: cameraEndPosition.x, y: cameraEndPosition.y, z: cameraEndPosition.z }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function() {
            camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        })
        .start();

    new TWEEN.Tween(targetPosition)
        .to({ x: cameraEndTarget.x, y: cameraEndTarget.y, z: cameraEndTarget.z }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out) // Tipo de transición para el punto objetivo
        .onUpdate(function() {
            camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
        })
        .onComplete(function() {
            generateSegments = true;
        })
        .start();

    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 1, -1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    scene.fog = new THREE.FogExp2(0x1c1c1c, 0.004);

    froggerStage = new FroggerStage(10, 11);
    scene.add(froggerStage.object);

    froggerFrog = new FroggerFrog(froggerStage.squareSize, 11, 0, Math.floor(froggerStage.columns / 2));
    scene.add(froggerFrog.object);
}

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            if (froggerStage.isValidPos(froggerFrog.getPosition().lane, froggerFrog.getMoveLeftColumn()))
                froggerFrog.moveLeft();
            break;
        case 'ArrowUp':
            if (froggerStage.isValidPos(froggerFrog.getMoveForewardLane(), froggerFrog.getPosition().column))
                froggerFrog.moveForward();
            break;
        case 'ArrowRight':
            if (froggerStage.isValidPos(froggerFrog.getPosition().lane, froggerFrog.getMoveRightColumn()))
                froggerFrog.moveRight();
            break;
        case 'ArrowDown':
            if (froggerStage.isValidPos(froggerFrog.getMoveBackwardLane(), froggerFrog.getPosition().column))
                froggerFrog.moveBackward();
            break;
    }
});

function update() {
    TWEEN.update();    

    const currentTime = new Date().getTime();
    if (!hasLoose && currentTime - lastTime > interval) {
        if (!froggerFrog.action && !froggerStage.isValidPos(froggerFrog.getPosition().lane, froggerFrog.getPosition().column)) {
            hasLoose = true;
            document.getElementById('gameOverScreen').style.display = 'flex';
        } else {
            froggerStage.move();
            const cameraMovement = froggerFrog.move();
            if (cameraMovement != 0) {
                const cameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
                const cameraEndPosition = { x: camera.position.x + cameraMovement, y: camera.position.y, z: camera.position.z };
                new TWEEN.Tween(cameraPosition)
                    .to(cameraEndPosition, interval)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(function() {
                        camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                    })
                    .start();
            }
            lastTime = currentTime;
            interval *= intervalRatio;
        }
    } else {
        // Make it so always you have segments on sight
        if (generateSegments && camera.position.x + cameraRange > froggerStage.actualLane * froggerStage.squareSize) {
            froggerStage.addSegment();
        }
    }
}

function render () {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

init();
render();
