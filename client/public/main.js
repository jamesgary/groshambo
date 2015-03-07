(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Player = require("./player.js");
var Renderer = require("./renderer.js");

var HOST = "localhost:8080";
var player = {
  goingUp: false,
  goingDown: false,
  goingLeft: false,
  goingRight: false
};
var conn = undefined,
    world = undefined,
    renderer = undefined;

$(function () {
  window.conn = conn = new WebSocket("ws://" + HOST + "/ws");
  conn.onopen = function (evt) {
    console.log("Welcome!");
  };
  conn.onclose = function (evt) {
    console.error("Connection lost!");
  };
  conn.onmessage = function (evt) {
    var serverGameState = JSON.parse(evt.data);
    //console.log("Received", serverGameState);
    //if (evt.data.player)  { updatePlayer(evt.data.player) }
    //if (evt.data.world)   { updateWorld(evt.data.world) }
    if (serverGameState.players) {
      updatePlayers(serverGameState.players);
    }
  };

  var $canvas = $("[role=game]");

  listenToPlayerInput();
  world = { players: [] };
  var renderer = new Renderer($("canvas[role=game]")[0], world);
  renderer.start();
});

function updatePlayers(players) {
  world.players = players;
}

function listenToPlayerInput() {
  $("body").keydown(function (e) {
    switch (e.which) {
      case 37:
        // left
        if (!player.goingLeft) {
          player.goingLeft = true;
          updateServer();
        }
        break;

      case 38:
        // up
        if (!player.goingUp) {
          player.goingUp = true;
          updateServer();
        }
        break;

      case 39:
        // right
        if (!player.goingRight) {
          player.goingRight = true;
          updateServer();
        }
        break;

      case 40:
        // down
        if (!player.goingDown) {
          player.goingDown = true;
          updateServer();
        }
        break;
    }
  });

  $("body").keyup(function (e) {
    switch (e.which) {
      case 37:
        // left
        player.goingLeft = false;
        updateServer();
        break;

      case 38:
        // up
        player.goingUp = false;
        updateServer();
        break;

      case 39:
        // right
        player.goingRight = false;
        updateServer();
        break;

      case 40:
        // down
        player.goingDown = false;
        updateServer();
        break;
    }
  });
}

function updateServer() {
  conn.send(JSON.stringify(player));
}

},{"./player.js":2,"./renderer.js":3}],2:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = function Player(name, x, y) {
  _classCallCheck(this, Player);

  this.name = name;
  this.x = x;
  this.y = y;
};

},{}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var WIDTH = 400;
var HEIGHT = 300;

var water = "rgba(10, 100, 255, 1.0)";
var land = "#FDEC90";

module.exports = (function () {
  function Renderer(canvas, world) {
    _classCallCheck(this, Renderer);

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.world = world;
  }

  _prototypeProperties(Renderer, null, {
    start: {
      value: function start() {
        this.render();
      },
      writable: true,
      configurable: true
    },
    render: {
      value: function render() {
        var _this = this;

        this.ctx.fillStyle = land;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        var radius = 5;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.world.players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var player = _step.value;

            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = "#0f0";
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

        requestAnimationFrame(function () {
          return _this.render();
        });
      },
      writable: true,
      configurable: true
    }
  });

  return Renderer;
})();

//var ballX = 200;
//var ballY = 150;
//var xSpeed = 0;
//var ySpeed = 0;
//var radius = 25;
//var texts = [];
//
//container.addEventListener("click", function() {
//  var mouseX = event.x - container.offsetLeft;
//  var mouseY = event.y - container.offsetTop;
//  if (distance(ballX, ballY, mouseX, mouseY) < radius) {
//    texts.push({text: "YAY", x: mouseX, y: mouseY, r: 0, g: 255, b: 0, opacity: 1})
//  } else {
//    texts.push({text: "BOO", x: mouseX, y: mouseY, r: 255, g: 0, b: 0, opacity: 1})
//  }
//});
//
//gameLoop();
//
//function drawBall() {
//  ctx.fillStyle = "rgba(223, 239, 255, 0.2)";
//  ctx.fillRect(0, 0, WIDTH, HEIGHT);
//
//  ctx.beginPath();
//  ctx.arc(ballX, ballY, radius, 0, 2 * Math.PI, false);
//  ctx.fillStyle = '#0f0';
//  ctx.fill();
//  ctx.lineWidth = 2;
//  ctx.strokeStyle = '#030';
//  ctx.stroke();
//}
//
//function drawText(text, x, y, r, g, b) {
//  effectsCtx.clearRect(0, 0, WIDTH, HEIGHT);
//  for (var i = 0; i < texts.length; i++) {
//    var t = texts[i];
//    effectsCtx.fillStyle = "rgba("+[t.r,t.g,t.b,t.opacity].join(',')+")";
//    effectsCtx.strokeStyle = "rgba("+[0,0,0,t.opacity].join(',')+")";
//    effectsCtx.fillText(t.text, t.x, t.y);
//    effectsCtx.strokeText(t.text, t.x, t.y);
//    t.y--;
//    t.opacity -= .04;
//    if (t.opacity <= 0) {
//      texts.splice(i, 1);
//      i--;
//    }
//  }
//}
//
//function moveBall() {
//  var speedVariance = 1;
//  var maxSpeed = 1;
//  xSpeed += (speedVariance / 2) - (Math.random() * speedVariance);
//  ySpeed += (speedVariance / 2) - (Math.random() * speedVariance);
//  xSpeed = clamp(xSpeed, -1 * maxSpeed, maxSpeed);
//  ySpeed = clamp(ySpeed, -1 * maxSpeed, maxSpeed);
//
//  ballX += xSpeed;
//  ballY += ySpeed;
//  if (ballX < 0 || ballX > WIDTH) {
//    ballX = clamp(ballX, 0, WIDTH);
//    xSpeed *= -1;
//  }
//  if (ballY < 0 || ballY > HEIGHT) {
//    ballY = clamp(ballY, 0, HEIGHT);
//    ySpeed *= -1;
//  }
//}
//
//function clamp(num, min, max) {
//  return Math.min(Math.max(num, min), max);
//};
//
//function distance(x1, y1, x2, y2) {
//  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
//}

},{}]},{},[1])