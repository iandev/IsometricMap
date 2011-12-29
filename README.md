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
