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
    tileHalfWidth: 0,
    tileHeight: 0,

    // how many pixels across per one up
    step: 0,
    halfStep: 0,

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

        this.calculateLengths();
        this.setFocusTile(0, 0);

        return this.getTileHeight();
    },

    calculateLengths: function() {
        this.tileHeight = (this.tileWidth / this.step) + 1;
        this.tileHalfWidth = this.tileWidth / 2;
        this.tileHalfHeight = this.tileHeight / 2;
        this.halfStep = this.step / 2;
    },

    worldToScreen: function(tileX, height, tileZ) {
        // screen coordinates of center of world tile
        var screen = this.worldToScreenRaw(tileX, height, tileZ);
        screen.x -= this.origin.x;
        screen.y -= this.origin.y;
        return {x: screen.x.round(), y: screen.y.round()};
    },

    worldToScreenRaw: function(tileX, height, tileZ) {
        ig.assert(
            this.tileWidth != 0,
            "You must call .setTileDimensions() at least once"
        );
        var xs = ((tileX - tileZ) * (this.tileHalfWidth + this.halfStep));
        var ys = (tileX + tileZ) * this.tileHalfHeight - height.toInt();

        return {x: xs, y: ys};
    },

    getBaseTileAtScreen: function(screenX, screenY) {
                             
        if (typeof screenX == "undefined") screenX = 0;
        if (typeof screenY == "undefined") screenY = 0;

        var part1 = (screenY + this.origin.y) / (2 * this.tileHalfHeight);
        var part2 = (screenX + this.origin.x) / (2 * (this.tileHalfWidth + this.halfStep));

        var tileX = (part1 + part2).toInt();
        var tileY = (part1 - part2).toInt();

        return {x: tileX, y: tileY};
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
        this.origin.x = screen.x + screenOffsetX;
        this.origin.y = screen.y + screenOffsetY;

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
        return {x: this.focusTile.x, height: this.focusTile.y, y: this.focusTile.z};
    },

    getTileHeight: function() {
        return this.tileHeight;
    },

});

// Associative array of instances of this class
IsometricCalc.instances = {};

// The "Global" instance of this class
IsometricCalc.instance = null;

});

