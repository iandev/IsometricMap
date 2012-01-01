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
        this.tileHeight = this.calc.setTileDimensions(this.tilesize, 2);

        this.tileHalfWidth = this.tilesize / 2;
    },

    setScreenPos: function(x, y) {

        this.parent(x, y);

        this.pxOffsetX = this.scroll.x % this.tilesize;
        this.pxOffsetY = this.scroll.y % this.tileHeight;

        this.pxMinX = -this.pxOffsetX - this.tilesize;
        this.pxMinY = -this.pxOffsetY - this.tileHeight;
        this.pxMaxX = ig.system.width + this.tilesize + this.pxOffsetX;
        this.pxMaxY = ig.system.height + this.tileHeight + this.pxOffsetY;

        this.calc.setWindowPosition(this.scroll.x, this.scroll.y);

    },

    draw: function() {

        if(!this.tiles.loaded) {
            return;
        }

        this.drawTiled();
    },

    drawTiled: function() {
        this.drawWindow(this.pxMinX, this.pxMinY, this.pxMaxX, this.pxMaxY);
    },

    drawWindow: function(x1, y1, x2, y2) {

        var tile = 0,
        pxY = 0,
        pxX = 0,
        mapY = -2,
        mapX = -2;

        var worldTileOffset = this.calc.getBaseTileAtScreen();

        var tileY = mapY + worldTileOffset.y,
        tileX = mapX + worldTileOffset.x,
        direction = 1;

        var renderTileY = tileY,
        renderTileX = tileX;

        // get coordinates of first tile to be rendered
        var screen = this.calc.worldToScreen(tileX, 0, tileY);
        pxX = screen.x;
        pxY = screen.y;

        while (pxY < y2) {

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
                    this.tiles.drawTile(screen.x - this.tileHalfWidth, screen.y - this.tileHeight, tile-1, this.tilesize );
                }
            }

            // move along in screen space to the next tile
            pxX += (this.tilesize * direction);

            // move horizontally (in screen space) to next tile.
            mapY -= direction;
            mapX += direction;

            if (pxX >= x2) {
                // now go from right to left
                direction = -1;
                // start at tile on SW side
                mapY++;
                // adjust for new tile position
                pxY += (this.tileHeight / 2);
                pxX -= (this.tilesize / 2);
            } else if (pxX <= x1) {
                // now go from left to right
                direction = 1;
                // start at tile on SE side
                mapX++;
                // adjust for new tile position
                pxY += (this.tileHeight / 2);
                pxX += (this.tilesize / 2);
            }

            // calculate white tile in the map data we're looking at
            tileY = mapY + worldTileOffset.y;
            tileX = mapX + worldTileOffset.x;

            renderTileY = tileY;
            renderTileX = tileX;

        }
    }

});

});
