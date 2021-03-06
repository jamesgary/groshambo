let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

var MINIMAP_PADDING = 10;
var MINIMAP_WIDTH = 200;
var MINIMAP_HEIGHT = 150;

module.exports = class CanvasRenderer {
  constructor($container, $leaderboard) {
    let $canvas = $('<canvas></canvas>');
    $container.prepend($canvas);
    this.$leaderboard = $leaderboard;
    this.ctx = $canvas[0].getContext("2d");
    this.images = {};
    this.patterns = {};

    this.imagesLoaded = false;
    this.loadImages({
      // note: dimensions be common denominators of canvas height/width
      // and map height/width in order for wrapping to work
      sandBg: '/images/sand_bg.png'
    });

    $canvas.attr('width', CANVAS_WIDTH);
    $canvas.attr('height', CANVAS_HEIGHT);
    $(this.$leaderboard).css("height", `${CANVAS_HEIGHT}px`);
  }

  loadImages(sources) {
    let loadedImages = 0;
    let numImages = Object.keys(sources).length;

    for(let name in sources) {
      this.images[name] = new Image();
      this.images[name].onload = () => {
        this.patterns[name] = {
          pattern: this.ctx.createPattern(this.images[name], "repeat"),
          width: this.images[name].width,
          height: this.images[name].height
        };
        loadedImages++;
        if(loadedImages == numImages) {
          // we're done loading!
          this.imagesLoaded = true;
        }
      };
      this.images[name].src = sources[name];
    }
  }

  start(world, currentPlayerName) {
    this.world = world;
    this.currentPlayerName = currentPlayerName;
    this.ctx.font = "800 9pt Arial";
    this.ctx.textAlign = "center";
    this.render();
  }

  updateLeaderboard() {
    let html = "";
    let sortedPlayers = [];
    for (let name in this.world.players) {
      let player = this.world.players[name];
      sortedPlayers.push(player);
    }

    // sort descending
    sortedPlayers.sort(function(a, b) { return b.points - a.points });

    for (let player of sortedPlayers) {
      html += `<div class="player-score-container">`;
      html += `<span class="player">${player.name}</span>`;
      html += `<span class="score">${player.points}</span>`;
      html += `</div>`;
    }
    this.$leaderboard.find("[role=leaderboard-players]").html(html);
  }

  render() {
    if (this.imagesLoaded) {
      let bgWidth = this.patterns.sandBg.width;
      let bgHeight = this.patterns.sandBg.height;
      let currentPlayer = this.world.players[this.currentPlayerName];
      let cameraX, cameraY, bgX, bgY;
      if (currentPlayer) {
        cameraX = currentPlayer.x;
        cameraY = currentPlayer.y;
      } else {
        // place camera in center of map
        cameraX = this.world.map_width / 2;
        cameraY = this.world.map_height / 2;
      }

      bgX = cameraX % bgWidth;
      bgY = cameraY % bgHeight;
      this.ctx.fillStyle = this.patterns.sandBg.pattern;
      this.ctx.translate(-bgX, -bgY);
      this.ctx.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);
      this.ctx.translate(bgX, bgY);

      for (let name in this.world.players) {
        let player = this.world.players[name];
        if (player.alive && player != currentPlayer) {
          // TODO check if player is visible in map, don't bother if not
          let xDelta = (player.x - currentPlayer.x);
          let yDelta = (player.y - currentPlayer.y);

          let x = (xDelta) + (CANVAS_WIDTH / 2);
          let y = (yDelta) + (CANVAS_HEIGHT / 2);
          this.drawPlayer(player, x, y);
        }
      }
      if (currentPlayer && currentPlayer.alive) {
        this.drawPlayer(currentPlayer, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
      this.renderMinimap(cameraX, cameraY);
      this.world.deadReckon()
    }

    requestAnimationFrame(() => this.render());
  }

  renderMinimap(viewportX, viewportY) {
    // scale to minimap position/size
    this.ctx.save();
    this.ctx.translate(
      MINIMAP_PADDING,
      (CANVAS_HEIGHT - MINIMAP_PADDING) - MINIMAP_HEIGHT
    );
    let minimapScale = (MINIMAP_WIDTH / this.world.map_width)
    this.ctx.scale(minimapScale, minimapScale);

    this.ctx.fillStyle = "#321";
    this.ctx.fillRect(
      0, 0,
      this.world.map_width,
      this.world.map_height
    );

    let playerMagnification = 2;

    let currentPlayer = this.world.players[this.currentPlayerName];

    for (let name in this.world.players) {
      let player = this.world.players[name];
      if (player.alive) {
        switch(player.element) {
          case 'water': this.ctx.fillStyle = '#cff'; break;
          case 'flame': this.ctx.fillStyle = '#f9b422'; break;
          case 'earth': this.ctx.fillStyle = '#37e408'; break;
        }
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius * playerMagnification, 0, 2 * Math.PI, false);
        this.ctx.fill();
      }
    }

    // show camera outline
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 16;
    this.ctx.strokeRect(
      viewportX - (CANVAS_WIDTH / 2),
      viewportY - (CANVAS_HEIGHT / 2),
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    this.ctx.restore();
  }

  drawPlayer(player, x, y) {
    switch(player.element) {
      case 'water':
        this.ctx.fillStyle = '#cff';
        this.ctx.strokeStyle = '#5ac';
        this.ctx.lineWidth = 1;
        break;
      case 'flame':
        this.ctx.fillStyle = '#E9F422';
        this.ctx.strokeStyle = '#AB0505';
        this.ctx.lineWidth = 1;
        break;
      case 'earth':
        this.ctx.fillStyle = '#37e408';
        this.ctx.strokeStyle = '#91770e';
        this.ctx.lineWidth = 2;
        break;
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, player.radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.stroke();

    let name = player.name;
    let nameX = x;
    let nameY = y + 25;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#fff";
    this.ctx.strokeText(name, nameX, nameY);
    this.ctx.fillStyle = "#000";
    this.ctx.fillText(name, nameX, nameY);
  }
};
