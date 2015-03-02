let Player = require("./player.js");
let Renderer = require("./renderer.js");

let HOST = "localhost:8080";
let player = {
  goingUp: false,
  goingDown: false,
  goingLeft: false,
  goingRight: false
};
let conn, world, renderer;

$(function() {
  conn = new WebSocket("ws://" + HOST + "/ws");
  conn.onopen = function(evt) { console.log("Welcome!"); };
  conn.onclose = function(evt) { console.error("Connection lost!") };
  conn.onmessage = function(evt) {
    let serverGameState = JSON.parse(evt.data);
    //console.log("Received", serverGameState);
    //if (evt.data.player)  { updatePlayer(evt.data.player) }
    //if (evt.data.world)   { updateWorld(evt.data.world) }
    if (serverGameState.players) { updatePlayers(serverGameState.players) }
  };

  let $canvas = $("[role=game]");

  listenToPlayerInput();
  world = {players:[]};
  let renderer = new Renderer($("canvas[role=game]")[0], world);
  renderer.start();
});

function updatePlayers(players) {
  world.players = players;
}

function listenToPlayerInput() {
  $("body").keydown(function(e) {
    switch(e.which) {
      case 37: // left
        if (!player.goingLeft) {
          player.goingLeft = true;
          updateServer();
        }
        break;

      case 38: // up
        if (!player.goingUp) {
          player.goingUp = true;
          updateServer();
        }
        break;

      case 39: // right
        if (!player.goingRight) {
          player.goingRight = true;
          updateServer();
        }
        break;

      case 40: // down
        if (!player.goingDown) {
          player.goingDown = true;
          updateServer();
        }
        break;
    }
  });

  $("body").keyup(function(e) {
    switch(e.which) {
      case 37: // left
        player.goingLeft = false;
        updateServer();
        break;

      case 38: // up
        player.goingUp = false;
        updateServer();
        break;

      case 39: // right
        player.goingRight = false;
        updateServer();
        break;

      case 40: // down
        player.goingDown = false;
        updateServer();
        break;
    }
  });
}

function updateServer() {
  conn.send(JSON.stringify(player));
}
