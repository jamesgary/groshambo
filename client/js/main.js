require("../node_modules/babelify/node_modules/babel-core/browser-polyfill.js"); // :-\

let Player = require("./player.js");
let Renderer = require("./renderer.js");
let Welcome = require("./welcome.js");
let Input = require("./input.js");

let HOST = window.location.hostname + ":8080";
let movementInput = {
  type: "movement",
  going_up: false,
  going_down: false,
  going_left: false,
  going_right: false
};
let world = {
  updatedAt: Date.now(),
  players: {}
};
let conn, renderer, currentPlayerName;

$(function() {
  Welcome.generateNamePicker(HOST, startGame);
});

function startGame(name, nameId) {
  currentPlayerName = name;
  conn = new WebSocket("ws://" + HOST + "/ws?name_id=" + nameId);
  conn.onopen = function() {
    showElementChooser();
  };
  conn.onclose = function() { console.error("Connection lost!") };
  conn.onmessage = function(evt) {
    let msg = JSON.parse(evt.data);

    // TODO better msg type detection
    if (msg.friction) { // must be a rules update, i.e. a new game
      world.rules = {
        friction: msg.friction,
        acceleration: msg.acceleration,
        map_width: msg.map_width,
        map_height: msg.map_height
      }

      $("[role=game-container]").show();
      renderer = new Renderer(
        $("canvas[role=renderer]")[0],
        $("[role=leaderboard]"),
        world
      );
      renderer.start();

      Input.listenToPlayerInput(movementInput, function() {
        conn.send(JSON.stringify(movementInput));
      });
    }

    if (msg.players) { // must be a gamestate update
      let shouldUpdateLeaderboard;
      world.updatedAt = Date.now();
      for (let name in msg.players) {
        let serverPlayer = msg.players[name];
        let clientPlayer = world.players[name];
        if (clientPlayer) {
          // check for changes in existing players
          if (clientPlayer.points != serverPlayer.points) {
            shouldUpdateLeaderboard = true;
          }
          if ((currentPlayerName == name) &&
            (clientPlayer.alive) &&
            (!serverPlayer.alive)) {
            // player died!
            showElementChooser();
          }
        } else {
          // new players should go on leaderboard
          shouldUpdateLeaderboard = true;
        }
      }
      // refresh all players
      world.players = msg.players;
      if (shouldUpdateLeaderboard) {
        renderer.updateLeaderboard();
      }
    }
  };
}

function showElementChooser() {
  let $explanations = $('[role=explanations] p');
  let $explanationsChooser = $('[role=element-chooser]');

  $explanations.hide();
  $explanationsChooser.show();

  $('[role=flame]').mouseover(function() {
    $explanations.hide();
    $('[role=flame-explanation]').show();
  }).mouseleave(function() {
    $explanations.hide();
  }).click(function() {
    pickElement('flame');
    $explanationsChooser.hide();
  });

  $('[role=water]').mouseover(function() {
    $explanations.hide();
    $('[role=water-explanation]').show();
  }).mouseleave(function() {
    $explanations.hide();
  }).click(function() {
    pickElement('water');
    $explanationsChooser.hide();
  });

  $('[role=earth]').mouseover(function() {
    $explanations.hide();
    $('[role=earth-explanation]').show();
  }).mouseleave(function() {
    $explanations.hide();
  }).click(function() {
    pickElement('earth');
    $explanationsChooser.hide();
  });
}

function pickElement(element) {
  conn.send(JSON.stringify({type: 'element', element: element}));
}
