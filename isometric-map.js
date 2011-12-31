ig.module(
    'plugins.isometricmap.isometric-map'
)
.requires(
    'impact.impact',
    'impact.background-map'
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

    originX: 0,
    originY: 0,
    originZ: 0,

    init: function( tilesize, data, tileset ) {

        this.parent(tilesize, data, tileset);

        this.calculateAngles();

        this.tileHalfWidth = this.tilesize / 2;
        this.tileHeight = (this.tilesize + 2)/ 2;

        /*
           This is calculated by determining the 'length' of one of the sides of
           an isometric tile.
           Derivation:

           width = tilesize
           height = (width + 2) / 2

           Given the tile:
           [(width / 2) + 1), 0]
                              #*
           [0, height / 2]  ##  ##
                          *#      ##
                          ##      ##
                            ##  ##
                              ##

            The distance between the two points marked (*) can be written as:

            length = sqrt( ((width / 2) + 1)^2 + (height / 2)^2 )

            The derivation is left as an exercise ;)

        */
        this.edgeLength = (this.tilesize + 2) * 0.559016994;
    },

    calculateAngles: function() {
        this.alpha = Math.atan(0.5);
        this.sinAlpha = Math.sin(this.alpha);
        this.cosAlpha = Math.cos(this.alpha);
    },

    worldToScreen: function(tileX, height, tileZ) {
        // screen coordinates of center of world tile
        var screen = this.worldToScreenRaw(tileX, height, tileZ);
        screen[0] -= this.originX;
        screen[1] -= this.originY;
        return [screen[0].round(), screen[1].round()];
    },

    worldToScreenRaw: function(tileX, height, tileZ) {
        var xs = ((tileX - tileZ) * this.cosAlpha * this.edgeLength);
        var ys = (((tileX + tileZ) * this.sinAlpha - height) * this.edgeLength);

        return [xs, ys];
    },

    setScreenPos: function(x, y) {

        this.parent(x, y);

        this.pxOffsetX = this.scroll.x % this.tilesize;
        this.pxOffsetY = this.scroll.y % this.tilesize;

        this.pxMinX = -this.pxOffsetX - this.tilesize;
        this.pxMinY = this.pxOffsetY - this.tilesize;
        this.pxMaxX = ig.system.width + this.tilesize + this.pxOffsetX;
        this.pxMaxY = ig.system.height + this.tilesize + this.pxOffsetY;

        // tile to be focused on at the 'world origin'
        var newX = (this.scroll.x / this.tilesize).toInt();
        var newY = -(this.scroll.y / this.tilesize).toInt();

        if (newX < this.screenTileOffsetX) {
            this.worldTileOffsetZ++;
            this.worldTileOffsetX--;
        } else if (newX > this.screenTileOffsetX) {
            this.worldTileOffsetZ--;
            this.worldTileOffsetX++;
        }

        if (newY < this.screenTileOffsetY) {
            this.worldTileOffsetZ++;
            this.worldTileOffsetX++;
        } else if (newY > this.screenTileOffsetY) {
            this.worldTileOffsetZ--;
            this.worldTileOffsetX--;
        }

        this.screenTileOffsetX = newX;
        this.screenTileOffsetY = newY;

        // world origin (in screen coordinates) based on focus tile
        var screen = this.worldToScreenRaw(this.worldTileOffsetX, this.worldTileOffsetY, this.worldTileOffsetZ);
        this.originX = screen[0] + this.pxOffsetX;
        this.originY = screen[1] + this.pxOffsetY - (this.screenTileOffsetY * this.tileHeight);

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
        mapY = -1,
        mapX = -1;

        var tileY = mapY + this.worldTileOffsetZ,
        tileX = mapX + this.worldTileOffsetX,
        direction = 1;

        // get coordinates of first tile to be rendered
        var screen = this.worldToScreen(tileX, 0, tileY);
        pxX = screen[0];
        pxY = screen[1];

        while (pxY < this.pxMaxY) {
/*
            // Repeat Y?
            if( tileY >= this.height || tileY < 0 ) {

                if( !this.repeat ) {
                    continue;
                }

                tileY = tileY > 0
                    ? tileY % this.height
                    : ((tileY+1) % this.height) + this.height - 1;
            }

            // Repeat X?
            if( tileX >= this.width || tileX < 0 ) {

                if( !this.repeat ) {
                    continue;
                }

                tileX = tileX > 0
                    ? tileX % this.width
                    : ((tileX+1) % this.width) + this.width - 1;
            }
*/
            if (tileY >= 0 && tileY < this.height && tileX >= 0 && tileX < this.width) {
                // Draw!
                if( (tile = this.data[tileY][tileX]) ) {

                    var screen = this.worldToScreen(tileX, 0, tileY);

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

        }
    }

});

});
