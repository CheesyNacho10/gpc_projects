import * as THREE from '../../../lib/three.module.js';

export class RobotKneeCapOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        kneeCapRadius = 20
    } = {}) {
        this.material = material;
        this.kneeCapRadius = kneeCapRadius;
    }
}

export class RobotKneeCap {
    constructor(options = new RobotKneeCapOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotKneeCapOptions()) {
        if (options instanceof RobotKneeCapOptions) {
            this.material = options.material;
            this.kneeCapRadius = options.kneeCapRadius;
        } else {
            throw new Error('Invalid RobotKneeCap options');
        }
        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.SphereGeometry(this.kneeCapRadius, 20, 20);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}