// forked from phi's "正弦波 - tmlib.js 0.3" http://jsdo.it/phi/vIm5
// forked from phi's "多角形の外角の和 - tmlib.js 0.3" http://jsdo.it/phi/xEa6
// forked from phi's "template - tmlib.js 0.2.2" http://jsdo.it/phi/yRg0
// forked from phi's "template - tmlib.js 0.1.7" http://jsdo.it/phi/m68l
/*
 * tmlib.js 0.3
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 465;              // スクリーン幅
var SCREEN_HEIGHT   = 465;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

/*
 * main
 */
tm.main(function() {
    var app = tm.display.CanvasApp("#world");
    app.background = "#222";
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();

    app.replaceScene(MainScene());

    app.run();
});

/*
 * main scene
 */
tm.define("MainScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();

        this.title = tm.display.Label("Cosine Wave")
            .setFillStyle("#eee")
            .setPosition(SCREEN_CENTER_X, 30)
            .addChildTo(this)
            ;

        this.cosineWave = user.CosineWave().addChildTo(this)
            .setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);
    },

    update: function(app) {
        this.cosineWave.degree += 4;
        var p = app.pointing;
        if (p.getPointing()) {
            var v = tm.geom.Vector2(
                SCREEN_CENTER_X-p.position.x,
                SCREEN_CENTER_Y-p.position.y
            );

            var degree = -v.toAngle()*180/Math.PI+180;
            this.cosineWave.degree = degree;
        }
    },
});


tm.define("user.CosineWave", {
    superClass: "tm.app.CanvasElement",

    init: function() {
        this.superInit();

        this.v = tm.geom.Vector2(0, 0);

        this.degree = 0;
        this.radius = 160;
    },

    update: function(app) {
        if (app.frame%1==0) {
            var p = user.Particle({
                angle: this.degree
            }).addChildTo(this);
            p.x = 0;
            p.y = this.v.y*-this.radius;
            p.v.x = 2;
            p.tweener.moveBy(400, 0, 5000).call(function() {
                this.remove();
            }, p);
        }

        if (app.frame%1==0) {
            var p = user.Particle({
                angle: this.degree
            }).addChildTo(this);
            p.x = this.v.x*this.radius;
            p.y = this.v.y*-this.radius;
            p.tweener.fadeOut(1100).call(function() {
                this.remove();
            }, p);
        }
    },

    draw: function(c) {
        c.fillStyle = "white";
        this.ndegree = 360-this.degree;
        //console.log(degree);
        c.fillStyle = "hsla({ndegree}, 80%, 80%, 1.0)".format(this);
        c.fillCircle(this.v.x*this.radius, this.v.y*-this.radius, 4);
    },
});

user.CosineWave.prototype.accessor("degree", {
    set: function(v) {
        this._degree = v;

        var rad = this.degree*Math.PI/180;
        this.v.y = Math.cos(rad);
        this.v.x = Math.sin(rad);
    },
    get: function() {
        return this._degree;
    }
});


tm.define("user.Particle", {
    superClass: "tm.display.CircleShape",

    init: function(param) {
        this.superInit(12, 12, {
            fillStyle: "hsla({angle}, 80%, 50%, 1.0)".format(param),
            strokeStyle: "transparent",
        });

        this.v = tm.geom.Vector2(0, 0);

        this.blendMode ="lighter";
    },
});
