import * as THREE from '../../../lib/three.module.js';

export class FroggerGlassPanelFactory {
    static texturePath = '../../images/'
    static widthFactor = 0.2;
    static heightFactor = 5;
    static frameFactor = 1.05;

    constructor(squareSize, columns) {
        this.squareSize = squareSize;
        this.columns = columns;

        this.panelWidth = this.squareSize * FroggerGlassPanelFactory.widthFactor;
        this.frameWidth = this.panelWidth * FroggerGlassPanelFactory.frameFactor;

        this.glassMaterial = new THREE.MeshLambertMaterial({
            color: 'white',
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
    }

    getFrameMaterials(height) {
        const frameMaterials = [];
        const heightRepetitions = Math.ceil(height / this.squareSize);

        // +/-X
        for (let i = 0; i < 2; i++) {
            const frameTexture = new THREE.TextureLoader().load(FroggerGlassPanelFactory.texturePath + 'wood.jpeg');
            frameTexture.wrapS = THREE.RepeatWrapping;
            frameTexture.wrapT = THREE.RepeatWrapping;
            frameTexture.repeat.set(1, 1);

            frameMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: frameTexture
                })
            );
        }

        // +/-Y
        for (let i = 0; i < 2; i++) {
            const frameTexture = new THREE.TextureLoader().load(FroggerGlassPanelFactory.texturePath + 'wood.jpeg');
            frameTexture.wrapS = THREE.RepeatWrapping;
            frameTexture.wrapT = THREE.RepeatWrapping;
            frameTexture.repeat.set(heightRepetitions, 1);

            frameMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: frameTexture
                })
            );
        }

        // +/-Z
        for (let i = 0; i < 2; i++) {
            const frameTexture = new THREE.TextureLoader().load(FroggerGlassPanelFactory.texturePath + 'wood.jpeg');
            frameTexture.wrapS = THREE.RepeatWrapping;
            frameTexture.wrapT = THREE.RepeatWrapping;
            frameTexture.repeat.set(heightRepetitions, 1);

            frameMaterials.push(
                new THREE.MeshLambertMaterial({
                    color: 'white',
                    map: frameTexture
                })
            );
        }

        return frameMaterials;
    }

    getPanel(width, height) {
        return new THREE.Mesh(
            new THREE.BoxGeometry(width, height, this.panelWidth),
            this.glassMaterial
        );
    }

    getFrame(height) {
        return new THREE.Mesh(
            new THREE.BoxGeometry(height, this.frameWidth, this.frameWidth),
            this.getFrameMaterials(height)
        );
    }

    getFrontalPanel(laneIndex) {
        const frontalPanel = new THREE.Object3D();

        const panelHeight = this.squareSize * FroggerGlassPanelFactory.heightFactor;
        const panelWidth = this.squareSize * this.columns;

        const panel = this.getPanel(panelWidth, panelHeight);
        panel.rotation.y = Math.PI / 2;
        panel.position.x += this.squareSize * laneIndex - this.squareSize / 2 - this.panelWidth / 2 * 1.1;
        panel.position.y += panelHeight / 2 - this.squareSize;
        frontalPanel.add(panel);

        const frameHeight = panelHeight;
        const frameDepth = panelWidth + this.frameWidth * 2;

        // Top frame
        const topFrame = this.getFrame(frameDepth);
        topFrame.rotation.y = Math.PI / 2;
        topFrame.position.y = panel.position.y + panelHeight / 2 + this.frameWidth / 2;
        topFrame.position.x = panel.position.x;
        frontalPanel.add(topFrame);

        // Bottom frame
        const bottomFrame = this.getFrame(frameDepth)
        bottomFrame.rotation.y = Math.PI / 2;
        bottomFrame.position.y = panel.position.y - panelHeight / 2 - this.frameWidth / 2;
        bottomFrame.position.x = panel.position.x;
        frontalPanel.add(bottomFrame);

        // Right frame
        const leftFrame = this.getFrame(frameHeight)
        leftFrame.rotation.z = Math.PI / 2;
        leftFrame.position.y = panel.position.y;
        leftFrame.position.x = panel.position.x;
        leftFrame.position.z = panelWidth / 2 + this.frameWidth / 2;
        frontalPanel.add(leftFrame);

        // Left frame
        const rightFrame = this.getFrame(frameHeight)
        rightFrame.rotation.z = Math.PI / 2;
        rightFrame.position.y = panel.position.y;
        rightFrame.position.x = panel.position.x;
        rightFrame.position.z = -panelWidth / 2 - this.frameWidth / 2;
        frontalPanel.add(rightFrame);

        return frontalPanel;
    }

    getCoverPanel(laneIndex, numLanes) {
        const coverHeight = this.squareSize * FroggerGlassPanelFactory.heightFactor;
        const coverDepth = this.squareSize * this.columns;
        const coverWidth = this.squareSize * numLanes;
        const laneXOffset = this.squareSize * laneIndex + numLanes * this.squareSize / 2 - this.squareSize / 2 - this.panelWidth / 2 * 1.1;

        const cover = new THREE.Object3D();

        // Top panel
        const topPanel = this.getPanel(coverWidth * 0.9999, coverDepth * 0.9999);
        topPanel.rotation.x = Math.PI / 2;
        topPanel.position.x = laneXOffset;
        topPanel.position.y = coverHeight - this.squareSize + this.panelWidth / 2 * 1.1;
        cover.add(topPanel);

        // Bottom panel
        const bottomPanel = this.getPanel(coverWidth * 0.9999, coverDepth * 0.9999);
        bottomPanel.rotation.x = Math.PI / 2;
        bottomPanel.position.x = laneXOffset;
        bottomPanel.position.y = -this.squareSize - this.panelWidth / 2 * 1.1;
        cover.add(bottomPanel);

        // Right panel
        const rightPanel = this.getPanel(coverWidth * 0.9999, coverHeight * 0.9999);
        rightPanel.position.y = coverHeight / 2 - this.squareSize;
        rightPanel.position.x = laneXOffset;
        rightPanel.position.z = coverDepth / 2 + this.panelWidth / 2 * 1.1;
        cover.add(rightPanel);

        // Left panel
        const leftPanel = this.getPanel(coverWidth * 0.9999, coverHeight * 0.9999);
        leftPanel.position.y = coverHeight / 2 - this.squareSize;
        leftPanel.position.x = laneXOffset;
        leftPanel.position.z = -coverDepth / 2 - this.panelWidth / 2 * 1.1;
        cover.add(leftPanel);

        // Frame

        // Top right frame
        const topRightFrame = this.getFrame(coverWidth);
        topRightFrame.position.y = coverHeight - this.squareSize + this.frameWidth / 2;
        topRightFrame.position.x = laneXOffset
        topRightFrame.position.z = coverDepth / 2 + this.frameWidth / 2;
        cover.add(topRightFrame);

        // Top left frame
        const topLeftFrame = this.getFrame(coverWidth);
        topLeftFrame.position.y = coverHeight - this.squareSize + this.frameWidth / 2;
        topLeftFrame.position.x = laneXOffset
        topLeftFrame.position.z = -coverDepth / 2 - this.frameWidth / 2;
        cover.add(topLeftFrame);

        // Bottom right frame
        const bottomRightFrame = this.getFrame(coverWidth);
        bottomRightFrame.position.y = - this.frameWidth / 2 - this.squareSize;
        bottomRightFrame.position.x = laneXOffset
        bottomRightFrame.position.z = coverDepth / 2 + this.frameWidth / 2;
        cover.add(bottomRightFrame);

        // Bottom left frame
        const bottomLeftFrame = this.getFrame(coverWidth);
        bottomLeftFrame.position.y = - this.frameWidth / 2 - this.squareSize;
        bottomLeftFrame.position.x = laneXOffset
        bottomLeftFrame.position.z = -coverDepth / 2 - this.frameWidth / 2;
        cover.add(bottomLeftFrame);

        return cover;
    }
}