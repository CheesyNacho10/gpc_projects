import * as THREE from '../../../lib/three.module.js';

export class RobotStudOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        studWidth = 18,
        studHeight = 120,
        studDeep = 12
    } = {}) {
        this.material = material;
        this.studWidth = studWidth;
        this.studHeight = studHeight;
        this.studDeep = studDeep;
    }
}

export class RobotStud {
    constructor(options = new RobotStudOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotStudOptions()) {
        if (options instanceof RobotStudOptions) {
            this.material = options.material;
            this.studWidth = options.studWidth;
            this.studHeight = options.studHeight;
            this.studDeep = options.studDeep;
        } else {
            throw new Error('Invalid RobotStud options');
        }
        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.BoxGeometry(this.studWidth, this.studHeight, this.studDeep);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}