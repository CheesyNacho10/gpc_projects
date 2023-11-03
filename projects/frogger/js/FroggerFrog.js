import * as THREE from '../../../lib/three.module.js';
import { TWEEN } from '../../../lib/tween.module.min.js';
import {GLTFLoader} from "../../../lib/GLTFLoader.module.js";


export class FroggerFrog {
    static texturePath = '../../images/'

    constructor(squareSize, columns, initialLane, initialColumn) {
        this.squareSize = squareSize;
        this.action = null;

        this.object = new THREE.Object3D();
        const glloader = new GLTFLoader();
        glloader.load('../../../models/frog/frog.glb', (objeto)  => {
            this.object.add(objeto.scene);
            objeto.scene.scale.set(2, 2, 2);
            objeto.scene.name = 'frog';
            objeto.scene.traverse(ob => {
                if(ob.isObject3D) ob.castShadow = true;
            });
        });

        this.object.position.x = initialLane * squareSize;
        this.object.position.y = squareSize / 4;
        this.object.position.z = (Math.floor(columns / 2) - initialColumn ) * squareSize;
        this.object.receiveShadow = true;
        this.object.castShadow = true;

        this.actualLane = initialLane;
        this.actualColumn = initialColumn;
    }

    getPosition() {
        return {
            lane: this.actualLane,
            column: this.actualColumn
        };
    }

    getMoveForewardLane() { return this.actualLane + 1; }
    getMoveBackwardLane() { return this.actualLane - 1 };
    getMoveRightColumn() { return this.actualColumn - 1 };
    getMoveLeftColumn() { return this.actualColumn + 1 };

    move() {
        if (this.action != null) {
            const actualX = this.object.position.x;
            const newPosition = this.action();
    
            new TWEEN.Tween(this.object.position)
                .to(newPosition, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
    
            this.action = null;
            return newPosition.x - actualX;
        }
        return 0;
    }

    moveForward() {
        this.action = () => {
            this.actualLane++;
            return { x: this.object.position.x + this.squareSize, y: this.object.position.y, z: this.object.position.z };
        }
    }
    
    moveBackward() {
        this.action = () => {
            this.actualLane--;
            return { x: this.object.position.x - this.squareSize, y: this.object.position.y, z: this.object.position.z };
        }
    }
    
    moveRight() {
        this.action = () => {
            this.actualColumn--;
            return { x: this.object.position.x, y: this.object.position.y, z: this.object.position.z + this.squareSize };
        }
    }
    
    moveLeft() {
        this.action = () => {
            this.actualColumn++;
            return { x: this.object.position.x, y: this.object.position.y, z: this.object.position.z - this.squareSize };
        }
    }
}