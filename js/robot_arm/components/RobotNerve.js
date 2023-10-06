import * as THREE from '../../../lib/three.module.js';

export class RobotNerveOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        nerveWidth = 4,
        nerveHeight  = 80
    } = {}) {
        this.material = material;
        this.nerveWidth = nerveWidth;
        this.nerveHeight = nerveHeight;
    }
}

export class RobotNerve {
    constructor(options = new RobotNerveOptions()) {
        this.setOptions(options);
    }

    setOptions(options = new RobotNerveOptions()) {
        if (options instanceof RobotNerveOptions) {
            this.material = options.material;
            this.nerveWidth = options.nerveWidth;
            this.nerveHeight = options.nerveHeight;
        } else {
            throw new Error('Invalid RobotForearm options');
        }

        this.refreshGeometry();
    }

    refreshGeometry() {
        this.geometry = new THREE.BoxGeometry(this.nerveWidth, this.nerveHeight, this.nerveWidth);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}
