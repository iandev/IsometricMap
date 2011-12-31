Installation
----

### Copy files

Create the following directory:

`lib/plugins/isometricmap`

Place `isometric-map.js` file into directory.

### Allow level loading

_Note that this step is entirely optional, but allows you to simply use the "this.loadLevel" style of loading a level._

#### Apply the patch
Apply the patch `0001-Patch[..].patch` to your isntallation of ImpactJS.

This patch is designed for ImpactJS v1.19

Usage
----

### Include the plugin

In your main.js, require the plugin:

```javascript
ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
    'plugins.isometricmap.isometric-map',
)
.defines(function(){

    // ...

});
```

### Create a Map

Then create a new IsometricMap:

```
init: function() {

    var data = [
        [1,2,6],
        [0,3,5],
        [2,8,1],
    ];
    var bg = new ig.IsometricMap( 16, data, 'media/tileset.png' );

},
```

### Alternatively, use Load Level

_Note: Requires the patch to be applied as stated above_

Requires manual editing of level files. Add a "type" attribute to each layer
with the class-name of IsometricMap.

Then your level file would look similar to:
(note the "type" attribute for the first "layer").

```
LevelTest=/*JSON[*/{"entities":[],"layer":[{"type":"IsometricMap","name":"BG","width":10,"height":10,"linkWithCollision":false,"visible":1,"tilesetName":"media/tiles.png","repeat":false,"preRender":true,"distance":"1","tilesize":38,"foreground":false,"data":[[1,4],[3,2]]}]}/*]JSON*/;
```

If no "type" specified, or an unknown class given, will default to "BackgroundMap".

Tiles
----

The isometric graphics used in game must follow the pattern:

```
      ##
    **  **
  **      ** 
##          ##
##          ##
  **      **
    **  **
      ##
```

Where the edges marked (*) can be repeated to any length.

The graphic must be a square for each tile. Ie: if you have a tile which is 14px wide as in the example above, then the graphic area it sits on must be 14px high (even though the tile itself is only 7px high).

Example:
![14x7 iso tile](http://i.imgur.com/YVjxX.png)

