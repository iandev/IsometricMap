ig.module(
    'plugins.isometricmap.isometric-calc'
)
.defines(function(){

/*
 * Works as both factory and class.
 *
 * To get an instance of the class with a 'name' of "Test", do:
 *
 * var iso = new IsometricCalc("Test");
 * iso.foo = "blah";
 *
 * // You can then get the same instance again by doing
 * var secondIso = new IsometricCalc("Test");
 *
 * if (iso.foo == secondIso.foo) {
 *     alert("true"); // < will alert "true"
 * }
 *
 * // You can also get the 'global' instance by not passing a name
 * var globalIso = new IsometricCalc();
 * globalIso.foo = "different";
 *
 * var anotherGlobalIso = new IsometricCalc();
 * if (globalIso.foo == anotherGlobalIso.foo) {
 *     alert("true"); // < will alert "true"
 * }
 *
 * if (globalIso.foo == iso.foo) {
 *     alert("true"); // < will NOT alert "true"
 * }
 */
IsometricCalc = ig.Class.extend({
    
    // dimensions of graphics
    tileWidth: 0,
    tileHeight: 0,

    // how many pixels across per one up
    step: 0,

    // dimensions of tile in Isometric world
    edgeLength: 0,

    // angles for calculating positions
    alpha: 0,
    sinAlpha: 0,
    cosAlpha: 0,

    // position of the 'origin' tile from the Isometric world in Screen Space
    origin: {x: 0, y: 0},

    // Screen position
    screen: {x: 0, y: 0},

    focusTile: {x: 0, y: 0, z: 0},

    staticInstantiate: function(name) {

        if (typeof(name) == "undefined") {
            if (IsometricCalc.instance == null) {
                return null;
            } else {
                return IsometricCalc.instance;
            }
        }

        if (!IsometricCalc.instances.hasOwnProperty(name)) {
            // will fall through to the init function
            return null;
        }

        return IsometricCalc.instances[name];
    },

    init: function(name) {
        if (typeof(name) == "undefined") {
            IsometricCalc.instance = this;
        } else {
            IsometricCalc.instances[name] = this;
        }
    },

    /**
     * 'Free' the given instance of this class.
     *
     * Note that this will only remove the factory's internal references. It
     * will NOT actually delete the object. It is up to you to ensure there are
     * no lingering references to that instance so the JS Garbage Collector can
     * actually go about deleting it.
     */
    free: function(name) {

        if (typeof(name) == "undefined") {
            IsometricCalc.instance = null;
        } else {
            if (IsometricCalc.instances.hasOwnProperty(name)) {
                delete IsometricCalc[name];
            }
        }

    },

    setTileDimensions: function(width, step) {

        ig.assert(
            width >= 2,
            "width must be at least 2"
        );

        ig.assert(
            (step > 1) && ((step & -step) == step),
            "step must be a power of 2 greather than 1"
        );

        this.tileWidth = width;
        this.step = step;

        this.calculateAngles();
        this.calculateLengths();
        this.setFocusTile(0, 0);

    },

    calculateLengths: function() {
        /*
           This is calculated by determining the 'length' of one of the sides of
           an isometric tile.

           Given:
           width = horizonal pixels at tile's widest point
           step = how many pixels across per 1 up
           height = vertical pixels at base tile's tallest point

           Given the tile:
                               [(width / 2) + (step / 2), 0]
                              #*
           [0, height / 2]  ##  ##
                          *#      ##
                          ##      ##
                            ##  ##
                              ##

            The distance between the two points marked (*) can be written as:

            length = sqrt( ((width / 2) + (step / 2))^2 + (height / 2)^2 )

        */
        //this.tileHeight = (this.tileWidth / this.step) + 1;
        this.tileHeight = (this.tileWidth + 2)/ 2;
        var x1 = (this.tileWidth + this.step) / 2;
        var y2 = (this.tileHeight / 2);

        this.edgeLength = Math.sqrt(Math.pow(x1, 2) + Math.pow(y2, 2));

    },

    calculateAngles: function() {
        this.alpha = Math.atan(1 / this.step);
        this.sinAlpha = Math.sin(this.alpha);
        this.cosAlpha = Math.cos(this.alpha);
    },

    worldToScreen: function(tileX, height, tileZ) {
        // screen coordinates of center of world tile
        var screen = this.worldToScreenRaw(tileX, height, tileZ);
        screen[0] -= this.origin.x;
        screen[1] -= this.origin.y;
        return [screen[0].round(), screen[1].round()];
    },

    worldToScreenRaw: function(tileX, height, tileZ) {
        ig.assert(
            this.tileWidth != 0,
            "You must call .setTileDimensions() at least once"
        );
        var xs = ((tileX - tileZ) * this.cosAlpha * this.edgeLength);
        var ys = (((tileX + tileZ) * this.sinAlpha - height) * this.edgeLength);

        return [xs, ys];
    },

    setFocusTile: function(tileX, tileZ, tileHeight, screenOffsetX, screenOffsetY) {

        // default parameters
        if (typeof tileHeight == "undefined") tileHeight = 0;
        if (typeof screenOffsetX == "undefined") screenOffsetX = 0;
        if (typeof screenOffsetY == "undefined") screenOffsetY = 0;

        this.focusTile.x = tileX;
        this.focusTile.y = tileHeight;
        this.focusTile.z = tileZ;

        // world origin (in screen coordinates) based on focus tile
        var screen = this.worldToScreenRaw(this.focusTile.x, this.focusTile.y, this.focusTile.z);
        this.origin.x = screen[0] + screenOffsetX;
        this.origin.y = screen[1] + screenOffsetY;

    },

    /**
     * Move the window which is looking into the Isometric world.
     * Position values are in screen pixels.
     */
    setWindowPosition: function(screenX, screenY) {

        this.origin.x += (screenX - this.screen.x);
        this.origin.y += (screenY - this.screen.y);

        this.screen.x = screenX;
        this.screen.y = screenY;
    },

    getFocusTile: function() {
        return [this.focusTile.x, this.focusTile.y, this.focusTile.z];
    },

});

// Associative array of instances of this class
IsometricCalc.instances = {};

// The "Global" instance of this class
IsometricCalc.instance = null;

});

