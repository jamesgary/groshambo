let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

module.exports = class Renderer {
  constructor(canvas, leaderboard) {
    this.canvas = canvas;
    this.leaderboard = leaderboard;
    this.ctx = this.canvas.getContext("2d");
    this.images = {};
    this.patterns = {};

    this.imagesLoaded = false;
    this.loadImages({
      // note: dimensions be common denominators of canvas height/width
      // and map height/width in order for wrapping to work
      sandBg: '/images/sand_bg.png'
    });

    $(this.canvas).attr('width', CANVAS_WIDTH);
    $(this.canvas).attr('height', CANVAS_HEIGHT);
    $(this.leaderboard).css("height", `${CANVAS_HEIGHT}px`);
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
    console.log(this.world.rules)
    this.scale = CANVAS_WIDTH / this.world.rules.map_width;

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
    this.leaderboard.find("[role=leaderboard-players]").html(html);
  }

  render() {
    if (this.imagesLoaded) {
      let bgWidth = this.patterns.sandBg.width;
      let bgHeight = this.patterns.sandBg.height;
      let currentPlayer = this.world.players[this.currentPlayerName];
      let x, y;
      if (currentPlayer) {
        x = currentPlayer.x;
        y = currentPlayer.y;
      } else {
        // place camera in center of map
        x = this.world.rules.map_width / 2;
        y = this.world.rules.map_height / 2;
      }
      x %= bgWidth
      y %= bgHeight

      this.ctx.fillStyle = this.patterns.sandBg.pattern;
      this.ctx.translate(-x, -y);
      this.ctx.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);
      this.ctx.translate(x, y);

      for (let name in this.world.players) {
        let player = this.world.players[name];
        if (player.alive && player != currentPlayer) {
          // if player is visible in map
          // offset x and y
          //drawPlayer(player, x, y);
        }
      }
      if (currentPlayer && currentPlayer.alive) {
        this.drawPlayer(currentPlayer, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
      this.deadReckon()
    }

    requestAnimationFrame(() => this.render());
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
    this.ctx.arc(x, y, player.radius / this.scale, 0, 2 * Math.PI, false);
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

  deadReckon() {
    //this.world.rules = {friction: 0.999, acceleration: 0.0000000001};

    if (this.world.rules.friction && this.world.rules.acceleration) {
      let now = Date.now();
      let t = now - this.world.updatedAt;
      let a = this.world.rules.acceleration;
      let friction = this.world.rules.friction;

      for (let name in this.world.players) {
        let player = this.world.players[name];
        if (player.alive) {
          player.dr = true; // for debugging dead reckoning
          let x_a = 0;
          let y_a = 0;
          if (player.going_up)    { y_a = -a }
          if (player.going_down)  { y_a =  a }
          if (player.going_left)  { x_a = -a }
          if (player.going_right) { x_a =  a }

          // may not be correct algorithm
          x_a -= friction * player.x_speed
          y_a -= friction * player.y_speed

          player.x += (player.x_speed * t) + (0.5 * x_a * t * t)
          player.y += (player.y_speed * t) + (0.5 * y_a * t * t)
          player.x_speed += (x_a * t)
          player.y_speed += (y_a * t)

          // wrap!
          if (player.x < 0) { player.x += this.world.rules.map_width }
          if (player.x > this.world.rules.map_width) { player.x -= this.world.rules.map_width }
          if (player.y < 0) { player.y += this.world.rules.map_height }
          if (player.y > this.world.rules.map_height) { player.y += this.world.rules.map_height }
        }
      }
      this.world.updatedAt = now;
    }
  }
};
