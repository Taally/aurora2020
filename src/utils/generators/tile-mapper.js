import { config, digitToType } from './map-config';

// Dangeon
// const TILE_MAPPING = {
//     BLANK: 17,
//     WALL: {
//         TOP_LEFT: 3,
//         TOP_RIGHT: 5,
//         BOTTOM_RIGHT: 53,
//         BOTTOM_LEFT: 51,
        
//         TOP: 4,
//         LEFT: 18, //35, //18,
//         RIGHT: 16, // 37, //16,
//         BOTTOM: 52, // 1, //52,
//         INNER_TOP_LEFT: 0,
//         INNER_TOP_RIGHT: 2,
//         INNER_BOTTOM_LEFT: 32,
//         INNER_BOTTOM_RIGHT: 34,
//     },
//     FLOOR: 95
// };

// Crystal
const TILE_MAPPING = {
    BLANK: 13,
    WALL: {
        // TOP_LEFT: 3,
        // TOP_RIGHT: 5,
        // BOTTOM_RIGHT: 29,
        // BOTTOM_LEFT: 27,
        TOP_LEFT: 180,
        TOP_RIGHT: 181,
        BOTTOM_RIGHT: 193,
        BOTTOM_LEFT: 192,
        
        // TOP: 4,
        // LEFT: 15,
        // RIGHT: 17,
        // BOTTOM: 28,
        TOP: 25,
        LEFT: 14,
        RIGHT: 12,
        BOTTOM: 1,

        INNER_TOP_LEFT: 0,
        INNER_TOP_RIGHT: 2,
        INNER_BOTTOM_LEFT: 24,
        INNER_BOTTOM_RIGHT: 26,
    },
    FLOOR: 16
};

export default class TileMapper {
    constructor(map, scene, width, height, tilesize) {
        this.width = width;
        this.height = height;
        this.scene = scene;
        this.map = map;
        this.tilesize = tilesize;
    }

    generateLevel() {
        this.scene.map = this.scene.make.tilemap({
            tileWidth: this.tilesize,
            tileHeight: this.tilesize,
            width: this.width,
            height: this.height
        });

        const tileset = this.scene.map.addTilesetImage("crystals", null, this.tilesize, this.tilesize);
        const floorLayer = this.scene.map.createBlankDynamicLayer("Floor", tileset);
        const groundLayer = this.scene.map.createBlankDynamicLayer("Ground", tileset);
        const otherLayer = this.scene.map.createBlankDynamicLayer("Other", tileset);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cell = this.map[x][y];
                if (cell === config.BLANK) {
                    groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y);
                } else {
                    floorLayer.putTileAt(TILE_MAPPING.FLOOR, x, y);
                    if (cell !== config.FLOOR) {
                        const type = digitToType[cell];
                        groundLayer.putTileAt(TILE_MAPPING.WALL[type], x, y);
                    }
                }
            }
        }

        // randomize player position
        let playerX = 10, playerY = 10;

        while (this.map[playerX][playerY] !== config.FLOOR) {
            playerX = Math.floor(Math.random() * this.map.length);
            playerY = Math.floor(Math.random() * this.map[0].length);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('punk', playerX * this.tilesize, playerY * this.tilesize, { player: true });
        this.scene.physics.add.collider(this.scene.player, groundLayer);
        this.scene.physics.add.collider(this.scene.player, otherLayer);

        const camera = this.scene.cameras.main;
        camera.setZoom(1.0);
        this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels, true);
        camera.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        camera.startFollow(this.scene.player);

        groundLayer.setCollisionBetween(1, 500);
        otherLayer.setDepth(10);

        return { Ground: groundLayer, Other: otherLayer };

    }
}