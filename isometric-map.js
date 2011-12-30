ig.module(
    'plugins.isometricmap.isometric-map'
)
.requires(
    'impact.impact',
    'impact.background-map'
)
.defines(function(){

ig.IsometricMap = ig.BackgroundMap.extend({

    tileOffsetX: 0,
    tileOffsetY: 0,
    tileOffsetZ: 0,

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

        this.alpha = Math.atan(0.5);
        this.recalculateAngles();

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
        this.edgeLength = ((this.tilesize + 2) / 2) * Math.sqrt(5) / 2;
    },

    recalculateAngles: function() {
        this.sinAlpha = Math.sin(this.alpha);
        this.cosAlpha = Math.cos(this.alpha);
    },

    setScreenPos: function(x, y) {

        this.parent(x, y);

        this.pxOffsetX = this.scroll.x % this.tilesize;
        this.pxOffsetY = this.scroll.y % this.tilesize;

        this.pxMinX = -this.pxOffsetX - this.tilesize;
        this.pxMinY = -this.pxOffsetY - this.tilesize;
        this.pxMaxX = ig.system.width + this.tilesize - this.pxOffsetX;
        this.pxMaxY = ig.system.height + this.tilesize - this.pxOffsetY;

        // tile focused at screen center
        this.tileOffsetX = (this.scroll.x / this.tilesize).toInt();
        this.tileOffsetY = 0;
        this.tileOffsetZ = (this.scroll.y / this.tilesize).toInt();

        // world origin (in screen coordinates) based on focus tile
        this.originX = (this.tileOffsetX - this.tileOffsetZ) * this.cosAlpha * this.edgeLength;
        this.originY = ((this.tileOffsetX + this.tileOffsetZ + 1) * this.sinAlpha - this.tileOffsetY) * this.edgeLength;

        this.originX += this.pxOffsetX;
        this.originY += this.pxOffsetY;

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
        iso_pxY = 0;

        for (var mapY = -1, pxY = this.pxMinY; pxY < this.pxMaxY; mapY++, pxY += this.tilesize) {

            var tileY = mapY + this.tileOffsetZ;

            // Repeat Y?
            if( tileY >= this.height || tileY < 0 ) {

                if( !this.repeat ) {
                    continue;
                }

                tileY = tileY > 0
                    ? tileY % this.height
                    : ((tileY+1) % this.height) + this.height - 1;
            }

            for (var mapX = -1, pxX = this.pxMinX; pxX < this.pxMaxX; mapX++, pxX += this.tilesize) {

                var tileX = mapX + this.tileOffsetX;

                // Repeat X?
                if( tileX >= this.width || tileX < 0 ) {

                    if( !this.repeat ) {
                        continue;
                    }

                    tileX = tileX > 0
                        ? tileX % this.width
                        : ((tileX+1) % this.width) + this.width - 1;
                }

                // Draw!
                if( (tile = this.data[tileY][tileX]) ) {

                    // tile to be rendered
                    var xw = tileX;
                    var yw = 0;
                    var zw = tileY;

                    // screen coordinates of arbitrary world tile
                    var xs = ((xw - zw) * this.cosAlpha * this.edgeLength) - this.originX;
                    var ys = (((xw + zw) * this.sinAlpha - yw) * this.edgeLength) - this.originY;

                    this.tiles.drawTile(xs.round(), ys.round(), tile-1, this.tilesize );
                }

            }
        }
    }

});

});
