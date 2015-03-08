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
  generateNamePicker();
});

function generateNamePicker() {
  $.ajax("//" + HOST + "/names").done(function(msg) {
    let names = JSON.parse(msg);
    let namesHtml = "";
    for (let i = 0; i < names.length; i++) {
      namesHtml += `<a role="name" data-name="${names[i][0]}" data-id="${names[i][1]}">${names[i][0]}</a>`;
    }
    namesHtml += `<a class="generate-more" role="generate-more">Generate more names</a>`;

    $("[role=name-list]").html(namesHtml);
    $("[role=generate-more]").click(generateNamePicker);
    $("[role=name]").click(function(evt) {
      let nameData = $(evt.target).data();
      $("[role=welcome]").hide();
      startGame(nameData.id);
    });
  });
}

function startGame(nameId) {
  conn = new WebSocket("ws://" + HOST + "/ws?name_id=" + nameId);
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
}

function updatePlayers(players) {
  world.updatedAt = Date.now();
  world.players = players;
}

function listenToPlayerInput() {
  $("html").keydown(function(evt) {
    switch(evt.which) {
      case 37: // left
        evt.preventDefault();
        if (!player.going_left) {
          player.going_left = true;
          updateServer();
        }
        break;

      case 38: // up
        evt.preventDefault();
        if (!player.going_up) {
          player.going_up = true;
          updateServer();
        }
        break;

      case 39: // right
        evt.preventDefault();
        if (!player.going_right) {
          player.going_right = true;
          updateServer();
        }
        break;

      case 40: // down
        evt.preventDefault();
        if (!player.going_down) {
          player.going_down = true;
          updateServer();
        }
        break;
    }
  });

  $("body").keyup(function(evt) {
    switch(evt.which) {
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
