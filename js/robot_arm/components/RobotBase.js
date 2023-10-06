import * as THREE from '../../../lib/three.module.js';

export class RobotBaseOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        baseRadius = 50,
        baseHeight = 15
    } = {}) {
        this.material = material;
        this.baseRadius = baseRadius;
        this.baseHeight = baseHeight;
    }
}

export class RobotBase {
    constructor(options = new RobotBaseOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotBaseOptions()) {
        if (options instanceof RobotBaseOptions) {
            this.material = options.material;
            this.baseRadius = options.baseRadius;
            this.baseHeight = options.baseHeight;
        }
        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.CylinderGeometry(this.baseRadius, this.baseRadius, this.baseHeight, 20);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}