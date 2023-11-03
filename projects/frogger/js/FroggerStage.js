import * as THREE from '../../../lib/three.module.js';
import { TWEEN } from '../../../lib/tween.module.min.js';
import { FroggerGlassPanelFactory } from './FroggerGlassPanelFactory.js';

export class FroggerStage {
    
    static texturePath = '../../images/'

    constructor(squareSize, columns) {
        this.squareSize = squareSize;
        this.columns = columns;
        this.object = new THREE.Object3D();
        this.object.receiveShadow = true;
        this.object.castShadow = true;
        this.actualLane = -1;
        this.isRiver = true;

        this.platforms = [];

        this.glassPanelFactory = new FroggerGlassPanelFactory(squareSize, columns);
        this.object.add(this.glassPanelFactory.getFrontalPanel(this.actualLane));

        this.addPlatform(3);
    }

    addSegment() {
        if (this.isRiver)
            this.addPlatform(2); 
        else 
            this.addRiver(Math.floor(Math.random() * 5) + 2);
        this.isRiver = !this.isRiver;
    }

    move() {
        const uniquePlatform = new Set(this.platforms);
        uniquePlatform.forEach(platform => platform.move());
    }

    isValidPos(laneIndex, columnIndex) {
        if (laneIndex < -1 || laneIndex >= this.platforms.length - 1)
            return false;
        if (columnIndex < 0 || columnIndex >= this.columns)
            return false;
        return this.platforms[laneIndex + 1].isValidPos(laneIndex, columnIndex);
    }

    addPlatform(lanes) {
        const platform = new FroggerPlatform(this.squareSize, this.actualLane, lanes, this.columns);
        for (let i = 0; i < lanes; i++)
            this.platforms.push(platform)

        this.object.add(platform.object);
        this.object.add(this.glassPanelFactory.getCoverPanel(this.actualLane, lanes));
        this.actualLane += lanes;
    }

    addRiver(lanes) {
        const river = new FroggerRiver(this.squareSize, this.actualLane, lanes, this.columns);
        for (let i = 0; i < lanes; i++)
            this.platforms.push(river)

        this.object.add(river.object);
        this.object.add(this.glassPanelFactory.getCoverPanel(this.actualLane, lanes));
        this.actualLane += lanes;
    }
}

class FroggerPlatform {
    constructor(squareSize, actualLane, lanes, columns) {
        this.squareSize = squareSize;
        this.actualLane = actualLane;
        this.lanes = lanes;
        this.columns = columns;

        // TODO: Put obstacles
        this.obstacles = [];
        for (let i = 0; i < this.lanes; i++)
            this.obstacles.push(Array(this.columns).fill(false));

        this.object = new THREE.Object3D();
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(this.lanes * this.squareSize, this.squareSize, this.columns * this.squareSize),
            this.getMaterials(lanes)
        );
        platform.position.x = this.actualLane * this.squareSize + this.lanes * this.squareSize / 2 - this.squareSize / 2;
        platform.position.y = - this.squareSize / 2;
        this.object.add(platform);
    }

    isValidPos(laneIndex, columnIndex) {
        return !this.obstacles[laneIndex - this.actualLane][columnIndex];
    }

    move() { }

    getMaterials() {
        const platformMaterials = [];

        // +/-X
        for (let i = 0; i < 2; i++) {
            const platformTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'ground.jpeg');
            platformTexture.wrapS = THREE.RepeatWrapping;
            platformTexture.wrapT = THREE.RepeatWrapping;
            platformTexture.repeat.set(this.columns, 1);

            platformMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: platformTexture
                })
            );
        }

        // +/-Y
        for (let i = 0; i < 2; i++) {
            const platformTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'ground.jpeg');
            platformTexture.wrapS = THREE.RepeatWrapping;
            platformTexture.wrapT = THREE.RepeatWrapping;
            platformTexture.repeat.set(this.lanes, this.columns);

            platformMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: platformTexture
                })
            );
        }

        // +/-Z
        for (let i = 0; i < 2; i++) {
            const platformTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'ground.jpeg');
            platformTexture.wrapS = THREE.RepeatWrapping;
            platformTexture.wrapT = THREE.RepeatWrapping;
            platformTexture.repeat.set(this.lanes, 1);

            platformMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: platformTexture
                })
            );
        }

        return platformMaterials;
    }
}

class FroggerRiver {
    constructor(squareSize, actualLane, lanes, columns) {
        this.squareSize = squareSize;
        this.actualLane = actualLane;
        this.lanes = lanes;
        this.columns = columns;

        this.object = new THREE.Object3D();
        const river = new THREE.Mesh(
            new THREE.BoxGeometry(this.lanes * this.squareSize, this.squareSize * 0.8, this.columns * this.squareSize),
            this.getMaterials()
        );
        river.position.x = this.actualLane * this.squareSize + this.lanes * this.squareSize / 2 - this.squareSize / 2;
        river.position.y = - this.squareSize / 2 - this.squareSize * 0.1;
        this.object.add(river);

        this.logLines = [];
        for (let i = 0; i < this.lanes; i++) {
            let goesLeft = Math.random() > 0.5;
            this.logLines.push(new FroggerLogLine(this.squareSize, this.columns, goesLeft));
            this.logLines[i].object.position.x = this.actualLane * this.squareSize + this.squareSize * i
            this.object.add(this.logLines[this.logLines.length - 1].object);
        }
    }

    move() {
        this.logLines.forEach(logLine => logLine.move());
    }

    isValidPos(laneIndex, columnIndex) {
        return this.logLines[laneIndex - this.actualLane].isValidPos(columnIndex);
    }

    getMaterials() {
        const riverMaterials = [];

        // +/-X
        for (let i = 0; i < 2; i++) {
            const riverTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'water_1000.png');
            riverTexture.wrapS = THREE.RepeatWrapping;
            riverTexture.wrapT = THREE.RepeatWrapping;
            riverTexture.repeat.set(this.columns, 1);

            riverMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: riverTexture
                })
            );
        }

        // +/-Y
        for (let i = 0; i < 2; i++) {
            const riverTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'water_1000.png');
            riverTexture.wrapS = THREE.RepeatWrapping;
            riverTexture.wrapT = THREE.RepeatWrapping;
            riverTexture.repeat.set(this.lanes, this.columns);

            riverMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: riverTexture
                })
            );
        }

        // +/-Z
        for (let i = 0; i < 2; i++) {
            const riverTexture = new THREE.TextureLoader().load(FroggerStage.texturePath + 'water_1000.png');
            riverTexture.wrapS = THREE.RepeatWrapping;
            riverTexture.wrapT = THREE.RepeatWrapping;
            riverTexture.repeat.set(this.lanes, 1);

            riverMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: riverTexture
                })
            );
        }

        return riverMaterials;
    }
}

class FroggerLogLine {
    constructor(squareSize, columns, goesLeft) {
        this.squareSize = squareSize;
        this.columns = columns;
        this.goesLeft = goesLeft;

        this.object = new THREE.Object3D();

        this.logs = [];

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        
        function randomSample(array, x) {
            let copy = array.slice();
            shuffle(copy);
            return copy.slice(0, x);
        }

        const initialOccupedColumns = randomSample(Array.from(Array(this.columns).keys()), Math.ceil(this.columns / 1.5));
        for (let i = 0; i < initialOccupedColumns.length; i++) {
            this.logs.push(new FroggerLog(this.squareSize, this.columns, initialOccupedColumns[i], this.goesLeft));
            this.object.add(this.logs[this.logs.length - 1].object);
        }
    }

    move() {
        this.logs.forEach(log => log.move());
    }

    isValidPos(columnIndex) {
        for (let i = 0; i < this.logs.length; i++)
            if (this.logs[i].getNextPos() == columnIndex)
                return true;
        return false;
    }
}

class FroggerLog {
    constructor(squareSize, columns, initialPos, goesLeft) {
        this.squareSize = squareSize;
        this.columns = columns;
        this.actualPos = initialPos;
        this.goesLeft = goesLeft;

        this.object = new THREE.Mesh(
            new THREE.BoxGeometry(this.squareSize * 0.6, this.squareSize * 0.8, this.squareSize),
            new THREE.MeshLambertMaterial({
                color: 'white',
                map: new THREE.TextureLoader().load(FroggerStage.texturePath + 'wood_planks.jpg')
            })
        );
        this.object.position.y = - this.squareSize + this.squareSize / 2;
        this.object.position.z = this.squareSize * (Math.floor(this.columns / 2) - this.actualPos);
    }

    getNextPos() {
        if (this.goesLeft)
            return this.actualPos + 1;
        else
            return this.actualPos - 1;
    }

    move() {
        const startPosition = this.object.position.clone();
        const endPosition = startPosition.clone();
    
        if (this.goesLeft)
            this.actualPos++;
        else
            this.actualPos--;
    
        if (!this.goesLeft && this.actualPos < 0) {
            this.actualPos = this.columns - 1;
            endPosition.z -= this.squareSize * (this.columns - 1);
            this.object.position.z = endPosition.z;
        }
        else if (this.goesLeft && this.actualPos > this.columns - 1) {
            this.actualPos = 0;
            endPosition.z += this.squareSize * (this.columns - 1);
            this.object.position.z = endPosition.z;
        } else {
            endPosition.z += this.squareSize * (this.goesLeft ? -1 : 1);
            new TWEEN.Tween(this.object.position)
            .to(endPosition, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
    }    
}
