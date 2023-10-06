import * as THREE from '../../../lib/three.module.js';

export class RobotFingerOptions {
    constructor({
        material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
        palmLong = 19,
        palmHeight = 20,
        palmWidth = 4,
        clampLong = 39,
        fingerWidth = 2,
        fingerHeight = palmHeight / 3
    } = {}) {
        this.material = material;
        this.palmLong = palmLong;
        this.palmHeight = palmHeight;
        this.palmWidth = palmWidth;
        this.clampLong = clampLong;
        this.fingerWidth = fingerWidth;
        this.fingerHeight = fingerHeight;
    }
}

export class RobotFinger {
    constructor(options = new RobotFingerOptions()) {
        this.geometry = new THREE.BufferGeometry();

        this.clampIndex = new Uint16Array([
            // Interior face
            0, 5, 4,
            0, 4, 1,
            1, 3, 2,
            1, 4, 3,
        
            // Exterior face
            10, 6, 7,
            10, 11, 6,
            9, 10, 7,
            9, 7, 8,
        
            // Upwards face
            5, 11, 4,
            11, 10, 4,
            4, 10, 9,
            4, 9, 3,
        
            // Downwards face
            0, 7, 6,
            0, 1, 7,
            1, 8, 7,
            1, 2, 8,
        
            // Front face
            0, 6, 5,
            6, 11, 5,
        
            // Back face
            2, 3, 8,
            8, 3, 9,
        ]);
        this.geometry.setIndex(new THREE.BufferAttribute(this.clampIndex, 1));
        this.setOptions(options);
    }

    setOptions(options = new RobotFingerOptions()) {
        if (options instanceof RobotFingerOptions) {
            this.material = options.material;
            this.palmLong = options.palmLong;
            this.palmHeight = options.palmHeight;
            this.palmWidth = options.palmWidth;
            this.clampLong = options.clampLong;
            this.fingerWidth = options.fingerWidth;
            this.fingerHeight = options.fingerHeight;
        } else {
            throw new Error('Invalid RobotFinger options');
        }

        this.refreshGeometry();
    }

    refreshGeometry() {
        this.clampVertex = new Float32Array([
            // Cara interior
            0, 0, 0,
            this.palmLong, 0, 0,
            this.clampLong, this.fingerHeight, 0,
            this.clampLong, this.palmHeight - this.fingerHeight, 0,
            this.palmLong, this.palmHeight, 0,
            0, this.palmHeight, 0,
        
            // Cara exterior
            0, 0, this.palmWidth,
            this.palmLong, 0, this.palmWidth,
            this.clampLong, this.fingerHeight, this.fingerWidth,
            this.clampLong, this.palmHeight - this.fingerHeight, this.fingerWidth,
            this.palmLong, this.palmHeight, this.palmWidth,
            0, this.palmHeight, this.palmWidth,
        ]);

        // Center the clamp in the origin
        for (let i = 0; i < this.clampVertex.length; i += 3) {
            this.clampVertex[i] -= this.palmLong / 2;
            this.clampVertex[i + 1] -= this.palmHeight / 2;
            this.clampVertex[i + 2] -= this.palmWidth / 2;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.clampVertex, 3));
        this.geometry.computeVertexNormals();
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.object = new THREE.Object3D().add(this.mesh);
    }
}
