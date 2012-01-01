ig.module(
    'plugins.isometricmap.isometric-map'
)
.requires(
    'impact.impact',
    'impact.background-map',
    'plugins.isometricmap.isometric-calc'
)
.defines(function(){

IsometricMap = ig.BackgroundMap.extend({

    worldTileOffsetX: 0,
    worldTileOffsetY: 0,
    worldTileOffsetZ: 0,

    screenTileOffsetX: 0,
    screenTileOffsetY: 0,

    pxOffsetX: 0,
    pxOffsetY: 0,

    pxMinX: 0,
    pxMinY: 0,
    pxMaxX: 0,
    pxMaxY: 0,

    calc: null,

    init: function( tilesize, data, tileset ) {

        this.parent(tilesize, data, tileset);

        this.calc = new IsometricCalc("Map");
        this.calc.setTileDimensions(this.tilesize, 2);

        this.tileHalfWidth = this.tilesize / 2;
        this.tileHeight = (this.tilesize + 2)/ 2;
    },

    setScreenPos: function(x, y) {

        this.parent(x, y);

        this.pxOffsetX = this.scroll.x % this.tilesize;
        this.pxOffsetY = this.scroll.y % this.tileHeight;

        this.pxMinX = -this.pxOffsetX - this.tilesize;
        this.pxMinY = -this.pxOffsetY - this.tileHeight;
        this.pxMaxX = ig.system.width + this.tilesize + this.pxOffsetX;
        this.pxMaxY = ig.system.height + this.tileHeight + this.pxOffsetY;

        // tile to be focused on at the 'world origin'
        var newX = (this.scroll.x / this.tilesize).toInt();
        var newY = -(this.scroll.y / this.tileHeight).toInt();

        if (newX < this.screenTileOffsetX) {
            var diff = this.screenTileOffsetX - newX;
            this.worldTileOffsetZ += diff;
            this.worldTileOffsetX -= diff;
        } else if (newX > this.screenTileOffsetX) {
            var diff = newX - this.screenTileOffsetX;
            this.worldTileOffsetZ -= diff;
            this.worldTileOffsetX += diff;
        }

        if (newY < this.screenTileOffsetY) {
            var diff = this.screenTileOffsetY - newY;
            this.worldTileOffsetZ += diff;
            this.worldTileOffsetX += diff;
        } else if (newY > this.screenTileOffsetY) {
            var diff = newY - this.screenTileOffsetY;
            this.worldTileOffsetZ -= diff;
            this.worldTileOffsetX -= diff;
        }

        this.screenTileOffsetX = newX;
        this.screenTileOffsetY = newY;

        this.calc.setFocusTile(this.worldTileOffsetX, this.worldTileOffsetZ, this.worldTileOffsetY, this.pxOffsetX, this.pxOffsetY);


    },

    draw: function() {

        if(!this.tiles.loaded) {
            return;
        }

        this.drawTiled();
    },

    drawTiled: function() {

        var tile = 0,
        anim = null,
        iso_pxX = 0,
        iso_pxY = 0,
        pxY = 0,
        pxX = 0,
        mapY = -2,
        mapX = -2;

        var tileY = mapY + this.worldTileOffsetZ,
        tileX = mapX + this.worldTileOffsetX,
        direction = 1;

        var renderTileY = tileY,
        renderTileX = tileX;

        // get coordinates of first tile to be rendered
        var screen = this.calc.worldToScreen(tileX, 0, tileY);
        pxX = screen[0];
        pxY = screen[1];

        while (pxY < this.pxMaxY) {

            if (this.repeat) {
                // Repeat Y?
                if (tileY >= this.height || tileY < 0) {
                    renderTileY = tileY > 0
                        ? tileY % this.height
                        : ((tileY+1) % this.height) + this.height - 1;
                }

                // Repeat X?
                if (tileX >= this.width || tileX < 0) {
                    renderTileX = tileX > 0
                        ? tileX % this.width
                        : ((tileX+1) % this.width) + this.width - 1;
                }
            }

            if (renderTileY >= 0 && renderTileY < this.height && renderTileX >= 0 && renderTileX < this.width) {
                // Draw!
                if( (tile = this.data[renderTileY][renderTileX]) ) {

                    var screen = this.calc.worldToScreen(tileX, 0, tileY);

                    // note position adjusted to be top-left of image
                    this.tiles.drawTile(screen[0] - this.tileHalfWidth, screen[1] - this.tileHeight, tile-1, this.tilesize );
                }
            }

            // move along in screen space to the next tile
            pxX += (this.tilesize * direction);

            // move horizontally (in screen space) to next tile.
            mapY -= direction;
            mapX += direction;

            if (pxX >= this.pxMaxX) {
                // now go from right to left
                direction = -1;
                // start at tile on SW side
                mapY++;
                // adjust for new tile position
                pxY += (this.tileHeight / 2);
                pxX -= (this.tilesize / 2);
            } else if (pxX <= this.pxMinX) {
                // now go from left to right
                direction = 1;
                // start at tile on SE side
                mapX++;
                // adjust for new tile position
                pxY += (this.tileHeight / 2);
                pxX += (this.tilesize / 2);
            }

            // calculate white tile in the map data we're looking at
            tileY = mapY + this.worldTileOffsetZ;
            tileX = mapX + this.worldTileOffsetX;

            renderTileY = tileY;
            renderTileX = tileX;

        }
    }

});

});
