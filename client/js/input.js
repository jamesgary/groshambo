module.exports = {
  listenToPlayerInput: function(player, callback) {
    $("html").keydown(function(evt) {
      switch(evt.which) {
        case 37: // left
          evt.preventDefault();
          if (!player.going_left) {
            player.going_left = true;
            callback();
          }
          break;

        case 38: // up
          evt.preventDefault();
          if (!player.going_up) {
            player.going_up = true;
            callback();
          }
          break;

        case 39: // right
          evt.preventDefault();
          if (!player.going_right) {
            player.going_right = true;
            callback();
          }
          break;

        case 40: // down
          evt.preventDefault();
          if (!player.going_down) {
            player.going_down = true;
            callback();
          }
          break;
      }
    });

    $("body").keyup(function(evt) {
      switch(evt.which) {
        case 37: // left
          player.going_left = false;
          callback();
          break;

        case 38: // up
          player.going_up = false;
          callback();
          break;

        case 39: // right
          player.going_right = false;
          callback();
          break;

        case 40: // down
          player.going_down = false;
          callback();
          break;
      }
    });
  }
}
