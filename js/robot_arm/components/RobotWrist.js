import * as THREE from '../../../lib/three.module.js';

export class RobotWristOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        clampRadius = 15,
        clampWidth = 40,
        clampSegments = 20
    } = {}) {
        this.material = material;
        this.clampRadius = clampRadius;
        this.clampWidth = clampWidth;
        this.clampSegments = clampSegments;
    }
}

export class RobotWrist {
    constructor(options = new RobotWristOptions()) {
        this.setOptions(options); 
    }
        
    setOptions(options = new RobotWristOptions()) {
        if (options instanceof RobotWristOptions) {
            this.material = options.material;
            this.clampRadius = options.clampRadius;
            this.clampWidth = options.clampWidth;
            this.clampSegments = options.clampSegments;
        } else {
            throw new Error('Invalid RobotWrist options');
        }

        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.CylinderGeometry(this.clampRadius, this.clampRadius, this.clampWidth, this.clampSegments);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}
