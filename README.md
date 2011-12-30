Installation
----

Create the following directory:

lib/plugins/isometricmap

Place files into directory.

Usage
----

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

