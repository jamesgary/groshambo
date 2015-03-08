let Player = require("./player.js");
let Renderer = require("./renderer.js");

let HOST = "localhost:8080";
let player = {
  x: 20,
  y: 20,
  x_speed: 0,
  y_speed: 0,
  going_up: false,
  going_down: false,
  going_left: false,
  going_right: false
};
let conn, world, renderer;

$(function() {
  window.conn = conn = new WebSocket("ws://" + HOST + "/ws");
  conn.onopen = function(evt) { console.log("Welcome!"); };
  conn.onclose = function(evt) { console.error("Connection lost!") };
  conn.onmessage = function(evt) {
    let msg = JSON.parse(evt.data);
    if (msg.friction) { // need better type detection
      world.rules = {
        friction: msg.friction,
        acceleration: msg.acceleration
      }
    }
    if (msg.players) {
      updatePlayers(msg.players)
    }
  };


  world = {
    players: [],//player],
    rules: {},
    updatedAt: Date.now()
  };

  let renderer = new Renderer($("canvas[role=game]")[0], world);
  renderer.start();

  listenToPlayerInput();
});

function updatePlayers(players) {
  world.updatedAt = Date.now();
  world.players = players;
}

function listenToPlayerInput() {
  $("body").keydown(function(e) {
    switch(e.which) {
      case 37: // left
        if (!player.going_left) {
          player.going_left = true;
          updateServer();
        }
        break;

      case 38: // up
        if (!player.going_up) {
          player.going_up = true;
          updateServer();
        }
        break;

      case 39: // right
        if (!player.going_right) {
          player.going_right = true;
          updateServer();
        }
        break;

      case 40: // down
        if (!player.going_down) {
          player.going_down = true;
          updateServer();
        }
        break;
    }
  });

  $("body").keyup(function(e) {
    switch(e.which) {
      case 37: // left
        player.going_left = false;
        updateServer();
        break;

      case 38: // up
        player.going_up = false;
        updateServer();
        break;

      case 39: // right
        player.going_right = false;
        updateServer();
        break;

      case 40: // down
        player.going_down = false;
        updateServer();
        break;
    }
  });
}

function updateServer() {
  conn.send(JSON.stringify(player));
}
