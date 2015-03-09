(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Player = require("./player.js");
var Renderer = require("./renderer.js");
var Welcome = require("./welcome.js");
var Input = require("./input.js");

var HOST = "localhost:8080";
var player = {
  going_up: false,
  going_down: false,
  going_left: false,
  going_right: false
};
var world = {
  updatedAt: Date.now(),
  players: []
};
var conn = undefined,
    renderer = undefined;

$(function () {
  Welcome.generateNamePicker(HOST, startGame);
});

function startGame(nameId) {
  conn = new WebSocket("ws://" + HOST + "/ws?name_id=" + nameId);
  conn.onopen = function (evt) {
    console.log("Welcome!");
  };
  conn.onclose = function (evt) {
    console.error("Connection lost!");
  };
  conn.onmessage = function (evt) {
    var msg = JSON.parse(evt.data);

    // TODO better msg type detection
    if (msg.friction) {
      // must be a rules update
      world.rules = {
        friction: msg.friction,
        acceleration: msg.acceleration,
        map_width: msg.map_width,
        map_height: msg.map_height
      };

      renderer = new Renderer($("canvas[role=game]")[0], world);
      renderer.start();

      Input.listenToPlayerInput(player, function () {
        conn.send(JSON.stringify(player));
      });
    }

    if (msg.players) {
      // must be a gamestate update
      world.updatedAt = Date.now();
      world.players = msg.players;
    }
  };
}

},{"./input.js":2,"./player.js":3,"./renderer.js":4,"./welcome.js":5}],2:[function(require,module,exports){
"use strict";

module.exports = {
  listenToPlayerInput: function listenToPlayerInput(player, callback) {
    $("html").keydown(function (evt) {
      switch (evt.which) {
        case 37:
          // left
          evt.preventDefault();
          if (!player.going_left) {
            player.going_left = true;
            callback();
          }
          break;

        case 38:
          // up
          evt.preventDefault();
          if (!player.going_up) {
            player.going_up = true;
            callback();
          }
          break;

        case 39:
          // right
          evt.preventDefault();
          if (!player.going_right) {
            player.going_right = true;
            callback();
          }
          break;

        case 40:
          // down
          evt.preventDefault();
          if (!player.going_down) {
            player.going_down = true;
            callback();
          }
          break;
      }
    });

    $("body").keyup(function (evt) {
      switch (evt.which) {
        case 37:
          // left
          player.going_left = false;
          callback();
          break;

        case 38:
          // up
          player.going_up = false;
          callback();
          break;

        case 39:
          // right
          player.going_right = false;
          callback();
          break;

        case 40:
          // down
          player.going_down = false;
          callback();
          break;
      }
    });
  }
};

},{}],3:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = function Player(name, x, y) {
  _classCallCheck(this, Player);

  this.name = name;
  this.x = x;
  this.y = y;
};

},{}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var water = "rgba(10, 100, 255, 1.0)";
var land = "rgba(253, 236, 144, 1)";
var landcast = "rgba(253, 236, 144, 0.9)";

module.exports = (function () {
  function Renderer(canvas, world) {
    _classCallCheck(this, Renderer);

    $(canvas).attr("width", world.rules.map_width);
    $(canvas).attr("height", world.rules.map_height);

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.world = world;
  }

  _prototypeProperties(Renderer, null, {
    start: {
      value: function start() {
        this.render();
        this.ctx.fillStyle = land;
        console.log(this.world.rules);
        this.ctx.fillRect(0, 0, this.world.rules.map_width, this.world.rules.map_height);
      },
      writable: true,
      configurable: true
    },
    render: {
      value: function render() {
        var _this = this;

        this.ctx.fillStyle = land;
        this.ctx.fillRect(0, 0, this.world.rules.map_width, this.world.rules.map_height);

        var radius = 5;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.world.players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var player = _step.value;

            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, player.dr ? radius : 10, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = player.dr ? "#f00" : "#0f0";
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#030";
            this.ctx.stroke();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.deadReckon();

        requestAnimationFrame(function () {
          return _this.render();
        });
      },
      writable: true,
      configurable: true
    },
    deadReckon: {
      value: function deadReckon() {
        //this.world.rules = {friction: 0.999, acceleration: 0.0000000001};

        if (this.world.rules.friction && this.world.rules.acceleration) {
          var now = Date.now();
          var t = now - this.world.updatedAt;
          var a = this.world.rules.acceleration;

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.world.players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var player = _step.value;

              //player.dr = true; // for debugging dead reckoning
              var x_a = 0;
              var y_a = 0;
              if (player.going_up) {
                y_a = -a;
              }
              if (player.going_down) {
                y_a = a;
              }
              if (player.going_left) {
                x_a = -a;
              }
              if (player.going_right) {
                x_a = a;
              }

              player.x += player.x_speed * t + 0.5 * x_a * t * t;
              player.y += player.y_speed * t + 0.5 * y_a * t * t;
              player.x_speed += x_a * t;
              player.y_speed += y_a * t;
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          this.world.updatedAt = now;
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Renderer;
})();

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
  generateNamePicker: function generateNamePicker(host, callback) {
    var _this = this;

    $.ajax("//" + host + "/names").done(function (msg) {
      var names = JSON.parse(msg);
      var namesHtml = "";
      for (var i = 0; i < names.length; i++) {
        namesHtml += "<a role=\"name\" data-name=\"" + names[i][0] + "\" data-id=\"" + names[i][1] + "\">" + names[i][0] + "</a>";
      }
      namesHtml += "<a class=\"generate-more\" role=\"generate-more\">Generate more names</a>";

      $("[role=name-list]").html(namesHtml);
      $("[role=generate-more]").click(_this.generateNamePicker);
      $("[role=name]").click(function (evt) {
        var nameData = $(evt.target).data();
        $("[role=welcome]").hide();
        callback(nameData.id);
      });
    });
  }
};

},{}]},{},[1])