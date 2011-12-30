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
      this.piOn180 = Math.PI / 180;
      this.tilesizeOn2 = tilesize / 2;
      this.tilesizeOn4 = tilesize / 4;
      this.addDegrees(45, 26.5650512);//35.2643896);
    },

    setDegrees: function(theta,alpha) {
      this.setRadians(theta * this.piOn180, alpha * this.piOn180);
    },

    setRadians: function(theta, alpha) {
      this.theta = theta;
      this.alpha = alpha;
      this.recalculateAngles();
    },

    addDegrees: function(theta,alpha) {
      this.addRadians(theta * this.piOn180, alpha * this.piOn180);
    },

    addRadians: function(theta, alpha) {
      this.theta += theta;
      this.alpha += alpha;
      this.recalculateAngles();
    },

    recalculateAngles: function() {
      this.sinTheta = Math.sin(this.theta);
      this.cosTheta = Math.cos(this.theta);
      this.sinAlpha = Math.sin(this.alpha);
      this.cosAlpha = Math.cos(this.alpha);
    },

    tileToScreen: function (tileX, tileY) {
      var screenX = this.tilesizeOn2 * (tileX - tileY);
      var screenY = (this.tilesizeOn4 + 1) * (tileY + tileX) - this.tilesizeOn2;
      return [Math.floor(screenX), Math.floor(screenY)];
    },

    screenToTile: function (screenX, screenY) {
      var tileX = (screenX / this.tilesize) + ((screenY + this.tilesizeOn2) / (this.tilesizeOn2 + 2));
      var tileY = ((screenY + this.tilesizeOn2) / (this.tilesizeOn2 + 2)) - (screenX / this.tilesize);
      return [tileX, tileY];
    },

    toScreen: function(worldX, worldY, worldZ) {
      var xsinzcos = (worldX * this.sinTheta) + (worldZ * this.cosTheta);
      var screenX = (worldX * this.cosTheta) - (worldZ * this.sinTheta);
      var screenY = (this.sinAlpha * xsinzcos) + (worldY * this.cosAlpha);
      screenX *= this.tilesize;
      screenY *= this.tilesize;
      return [screenX, screenY];
    },

    toIso: function(screenX, screenY) {
      var worldX = (screenX * this.cosTheta) + (screenY * this.sinTheta * this.sinAlpha);
      var worldY = (screenY * this.cosAlpha);
      var worldZ = -(screenX * this.sinTheta) + (screenY * this.sinAlpha * this.cosTheta);
      return [worldX, worldY, worldZ];
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

      //console.log('stopped');
      //ig.system.stopRunLoop();
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
              //screenCoords = this.tileToScreen(tileX, tileY);
              screenCoords = this.toScreen(tileX, 0, tileY);
              this.tiles.drawTile(screenCoords[0], screenCoords[1], tile-1, this.tilesize );
          }

        } // end for x
      } // end for y
    }

  });

});
