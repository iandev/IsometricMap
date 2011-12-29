ig.module(
  'plugins.isometricmap.isometric-map'
)
.requires(
  'impact.impact',
  'impact.background-map'
)
.defines(function(){

  ig.IsometricMap = ig.BackgroundMap.extend({

    init: function( tilesize, data, tileset ) {
      this.parent(tilesize, data, tileset);
      this.theta = 0;
      this.alpha = 0;
      this.addDegrees(30, 45);
    },

    addDegrees: function(theta,alpha) {
      this.theta += theta;
      this.alpha += alpha;
      var thetaRadians = this.theta * Math.PI/180;
      var alphaRadians = this.alpha * Math.PI/180;
      this.sinTheta = Math.sin(thetaRadians);
      this.cosTheta = Math.cos(thetaRadians);
      this.sinAlpha = Math.sin(alphaRadians);
      this.cosAlpha = Math.cos(alphaRadians);
    },

    toScreen: function(xpp, ypp, zpp) {
      var yp = ypp;
      var xp = xpp * this.cosAlpha + zpp * this.sinAlpha;
      var zp = zpp * this.cosAlpha + xpp * this.sinAlpha;
      var x = xp;
      var y = yp * this.cosTheta - zp * this.sinTheta;
      var z = zp * this.cosTheta + yp * this.sinTheta;
      return [x, y, z];
    },

    toIso: function(screenX, screenY) {
      var z = (screenX / this.cosAlpha - screenY / (this.sinAlpha * this.sinTheta)) * (1 / (this.cosAlpha / this.sinAlpha + this.sinAlpha / this.cosAlpha));
      var x = (1 / this.cosAlpha) * (screenX - z * this.sinAlpha);
      
      return [x, z];
    },

    draw: function() {
      if(!this.tiles.loaded) {
        return;
      }
      
      if (ig.input.pressed('a'))      this.addDegrees(-1,0);
      if (ig.input.pressed('d'))      this.addDegrees(1,0);
      if (ig.input.pressed('w'))      this.addDegrees(0,-1);
      if (ig.input.pressed('s'))      this.addDegrees(0,1);
      
      this.drawTiled();
    },

    drawTiled: function() {
      var tile = 0,
      anim = null,
      tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
      tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
      pxOffsetX = this.scroll.x % this.tilesize,
      pxOffsetY = this.scroll.y % this.tilesize,
      pxMinX = -pxOffsetX - this.tilesize,
      pxMinY = -pxOffsetY - this.tilesize,
      pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
      pxMaxY = ig.system.height + this.tilesize - pxOffsetY,
      iso_pxX = 0,
      iso_pxY = 0;
      
      for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
        var tileY = mapY + tileOffsetY;
      
        // Repeat Y?
        if( tileY >= this.height || tileY < 0 ) {

          if( !this.repeat ) {
              continue;
          }

          tileY = tileY > 0
            ? tileY % this.height
            : ((tileY+1) % this.height) + this.height - 1;
        }
      
        for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
          var tileX = mapX + tileOffsetX;
      
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
              iso_pxX = ((this.tilesize/2)*tileX) - ((this.tilesize/2)*tileY);
              iso_pxY = ((this.tilesize/4)*tileY) + ((this.tilesize/4)*tileX);
              var tmp = this.toScreen(iso_pxX, 0, iso_pxY);

              this.tiles.drawTile(iso_pxX+250, iso_pxY, tile-1, this.tilesize );
          }

        } // end for x
      } // end for y
    }

  });

});
