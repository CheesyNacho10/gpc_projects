import * as THREE from '../../lib/three.module.js';

import { RobotFinger, RobotFingerOptions } from './components/RobotFinger.js';
import { RobotWrist, RobotWristOptions } from './components/RobotWrist.js';
import { RobotNerve, RobotNerveOptions } from './components/RobotNerve.js';
import { RobotDisk, RobotDiskOptions } from './components/RobotDisk.js';
import { RobotKneeCap, RobotKneeCapOptions } from './components/RobotKneeCap.js';
import { RobotStud, RobotStudOptions } from './components/RobotStud.js';
import { RobotAxis, RobotAxisOptions } from './components/RobotAxis.js';
import { RobotBase, RobotBaseOptions } from './components/RobotBase.js';

export class RobotArmOptions {
    constructor({
        generalMaterial = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        robotFingerOptions = new RobotFingerOptions({ material: generalMaterial }), 
        robotWristOptions = new RobotWristOptions({ material: generalMaterial}), 
        robotNerveOptions = new RobotNerveOptions({ material: generalMaterial}),
        robotDiskOptions = new RobotDiskOptions({ material: generalMaterial}),
        robotKneeCapOptions = new RobotKneeCapOptions({ material: generalMaterial}),
        robotStudOptions = new RobotStudOptions({ material: generalMaterial}),
        robotAxisOptions = new RobotAxisOptions({ material: generalMaterial}),
        robotBaseOptions = new RobotBaseOptions({ material: generalMaterial})
    } = {}) {
        this.robotFingerOptions = robotFingerOptions;
        this.robotWristOptions = robotWristOptions;
        this.robotNerveOptions = robotNerveOptions;
        this.robotDiskOptions = robotDiskOptions;
        this.robotKneeCapOptions = robotKneeCapOptions;
        this.robotStudOptions = robotStudOptions;
        this.robotAxisOptions = robotAxisOptions;
        this.robotBaseOptions = robotBaseOptions;
    }
}

export class RobotArm {
    constructor(robotArmOptions = new RobotArmOptions()) {
        this.options = robotArmOptions;
        this.speed = 1;

        this.buildHand();
        this.buildNerves();
        this.buildForearm();
        this.buildArm();
        this.buildBase();
        this.buildRobot();
    }

    buildHand() {
        this.hand = new THREE.Object3D();
        this.leftFinger = new RobotFinger(this.options.robotFingerOptions);
        this.rightFinger = new RobotFinger(this.options.robotFingerOptions);
        this.wrist = new RobotWrist(this.options.robotWristOptions);

        this.leftFinger.object.position.z = -this.wrist.clampWidth / 4;
        this.leftFinger.object.position.x = this.wrist.clampRadius / 2;
        this.leftFinger.object.rotation.x = Math.PI;
        this.hand.add(this.leftFinger.object);

        this.rightFinger.object.position.z = this.wrist.clampWidth / 4;
        this.rightFinger.object.position.x = this.wrist.clampRadius / 2;
        this.hand.add(this.rightFinger.object);

        this.wrist.object.rotation.x = Math.PI / 2;
        this.hand.add(this.wrist.object);
    }

    buildNerves() {
        this.nerves = new THREE.Object3D();
        this.leftUpNerve = new RobotNerve(this.options.robotNerveOptions);
        this.leftDownNerve = new RobotNerve(this.options.robotNerveOptions);
        this.rightUpNerve = new RobotNerve(this.options.robotNerveOptions);
        this.rightDownNerve = new RobotNerve(this.options.robotNerveOptions);

        this.leftUpNerve.object.position.z = -this.wrist.clampWidth / 4;
        this.leftUpNerve.object.position.x = this.wrist.clampRadius / 2;
        this.leftUpNerve.object.rotation.x = Math.PI;
        this.nerves.add(this.leftUpNerve.object);

        this.leftDownNerve.object.position.z = -this.wrist.clampWidth / 4;
        this.leftDownNerve.object.position.x = -this.wrist.clampRadius / 2;
        this.leftDownNerve.object.rotation.x = Math.PI;
        this.nerves.add(this.leftDownNerve.object);

        this.rightUpNerve.object.position.z = this.wrist.clampWidth / 4;
        this.rightUpNerve.object.position.x = this.wrist.clampRadius / 2;
        this.nerves.add(this.rightUpNerve.object);

        this.rightDownNerve.object.position.z = this.wrist.clampWidth / 4;
        this.rightDownNerve.object.position.x = -this.wrist.clampRadius / 2;
        this.nerves.add(this.rightDownNerve.object);
    }

    buildForearm() {
        this.forearm = new THREE.Object3D();

        this.hand.position.y = this.leftUpNerve.nerveHeight;
        this.forearm.add(this.hand);

        this.nerves.position.y = this.leftUpNerve.nerveHeight / 2;
        this.forearm.add(this.nerves);

        this.disk = new RobotDisk(this.options.robotDiskOptions);
        this.forearm.add(this.disk.object);
    }

    buildArm() {
        this.arm = new THREE.Object3D();

        this.stud = new RobotStud(this.options.robotStudOptions);

        this.forearm.position.y = this.stud.studHeight;
        this.arm.add(this.forearm);

        this.kneeCap = new RobotKneeCap(this.options.robotKneeCapOptions);
        this.kneeCap.object.position.y = this.stud.studHeight;
        this.arm.add(this.kneeCap.object);

        this.stud.object.position.y = this.stud.studHeight / 2;
        this.arm.add(this.stud.object)

        this.axis = new RobotAxis(this.options.robotAxisOptions);
        this.axis.object.rotation.x = Math.PI / 2;
        this.arm.add(this.axis.object);
    }

    buildBase() {
        this.base = new RobotBase(this.options.robotBaseOptions);
        this.base.object.add(this.arm);
    }

    buildRobot() {
        this.object = new THREE.Object3D();
        this.base.object.position.y = this.base.baseHeight / 2;
        this.object.add(this.base.object);
    }

    setBaseRotation(angle) {
        this.base.object.rotation.y = angle;
    }

    setAxisRotation(angle) {
        this.arm.rotation.z = angle;
    }

    setKneeCapZRotation(angle) {
        this.forearm.rotation.z = angle;
    }

    setKneeCapYRotation(angle) {
        this.forearm.rotation.y = angle;
    }

    setWristRotation(angle) {
        this.hand.rotation.z = angle;
    }

    setFingersOpen(distance) {
        this.leftFinger.object.position.z = -this.wrist.clampWidth / 4 + distance - 7.5;
        this.rightFinger.object.position.z = this.wrist.clampWidth / 4 - distance + 7.5;
    }

    setAlambricMode(isAlambric) {
        this.object.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.wireframe = isAlambric;
            }
        });
    }

    moveLeft() {
        this.object.position.x -= this.speed;
    }

    moveRight() {
        this.object.position.x += this.speed;
    }

    moveForward() {
        this.object.position.z -= this.speed;
    }

    moveBackward() {
        this.object.position.z += this.speed;
    }
}