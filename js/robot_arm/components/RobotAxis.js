import * as THREE from '../../../lib/three.module.js';

export class RobotAxisOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        axisRadius = 20,
        axisHeight = 18
    } = {}) {
        this.material = material;
        this.axisRadius = axisRadius;
        this.axisHeight = axisHeight;
    }
}

export class RobotAxis {
    constructor(options = new RobotAxisOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotAxisOptions()) {
        if (options instanceof RobotAxisOptions) {
            this.material = options.material;
            this.axisRadius = options.axisRadius;
            this.axisHeight = options.axisHeight;
        } else {
            throw new Error('Invalid RobotAxis options');
        }
        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.CylinderGeometry(this.axisRadius, this.axisRadius, this.axisHeight, 20);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}