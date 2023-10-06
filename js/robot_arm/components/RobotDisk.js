import * as THREE from '../../../lib/three.module.js';

export class RobotDiskOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        diskRadius = 22,
        diskWidth = 6,
        diskSegments = 20
    } = {}) {
        this.material = material;
        this.diskRadius = diskRadius;
        this.diskWidth = diskWidth;
        this.diskSegments = diskSegments;
    }
}

export class RobotDisk {
    constructor(options = new RobotDiskOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotDiskOptions()) {
        if (options instanceof RobotDiskOptions) {
            this.material = options.material;
            this.diskRadius = options.diskRadius;
            this.diskWidth = options.diskWidth;
            this.diskSegments = options.diskSegments;
        } else {
            throw new Error('Invalid RobotDisk options');
        }

        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.CylinderGeometry(this.diskRadius, this.diskRadius, this.diskWidth, this.diskSegments);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}