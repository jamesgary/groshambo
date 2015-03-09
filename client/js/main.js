let Player = require("./player.js");
let Renderer = require("./renderer.js");
let Welcome = require("./welcome.js");
let Input = require("./input.js");

let HOST = "localhost:8080";
let player = {
  going_up: false,
  going_down: false,
  going_left: false,
  going_right: false
};
let world = {
  updatedAt: Date.now(),
  players: []
};
let conn, renderer;

$(function() {
  Welcome.generateNamePicker(HOST, startGame);
});

function startGame(nameId) {
  conn = new WebSocket("ws://" + HOST + "/ws?name_id=" + nameId);
  conn.onopen = function(evt) { console.log("Welcome!"); };
  conn.onclose = function(evt) { console.error("Connection lost!") };
  conn.onmessage = function(evt) {
    let msg = JSON.parse(evt.data);

    // TODO better msg type detection
    if (msg.friction) { // must be a rules update
      world.rules = {
        friction: msg.friction,
        acceleration: msg.acceleration,
        map_width: msg.map_width,
        map_height: msg.map_height
      }

      renderer = new Renderer($("canvas[role=game]")[0], world);
      renderer.start();

      Input.listenToPlayerInput(player, function() {
        conn.send(JSON.stringify(player));
      });
    }

    if (msg.players) { // must be a gamestate update
      world.updatedAt = Date.now();
      world.players = msg.players;
    }
  };
}
