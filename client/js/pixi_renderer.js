let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;

let MINIMAP_PADDING = 10;
let MINIMAP_WIDTH = 200;
let MINIMAP_HEIGHT = 150;
let PLAYER_MAGNIFICATION = 2;

module.exports = class PixiRenderer {
  constructor($container, $leaderboard) {
    this.stats = new Stats();
    this.stats.setMode(0); // 0: fps, 1: ms

    // align top-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0';
    this.stats.domElement.style.top = '0';
    document.body.appendChild(this.stats.domElement);

    this.renderer = new PIXI.autoDetectRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);

    $container.prepend(this.renderer.view);

    this.stage = new PIXI.Stage;

    let sandTexture = PIXI.Texture.fromImage("/images/sand_bg.png");
    this.sandBg = new PIXI.TilingSprite(
      sandTexture,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    this.sandBg.position.x = 0;
    this.sandBg.position.y = 0;
    this.stage.addChild(this.sandBg);

    this.spriteContainer = new PIXI.SpriteBatch();
    this.stage.addChild(this.spriteContainer);

    this.minimap = new PIXI.Graphics();

    let minimapMask = new PIXI.Graphics();
    minimapMask.position.x = MINIMAP_PADDING;
    minimapMask.position.y = (CANVAS_HEIGHT - MINIMAP_PADDING) - MINIMAP_HEIGHT;
    minimapMask.beginFill(0x000000, 1);
    minimapMask.drawRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    this.minimap.mask = minimapMask;

    this.stage.addChild(this.minimap);
    this.stage.addChild(minimapMask);

    this.$leaderboard = $leaderboard;
    $(this.$leaderboard).css("height", `${CANVAS_HEIGHT}px`);
  }

  start(world, currentPlayerName) {
    this.world = world; // only used to trigger deadReckon
    this.currentPlayerName = currentPlayerName;

    // cache for performance (and syntactic sugar)
    this.map_height = this.world.map_height;
    this.map_width = this.world.map_width;

    this.players = {};

    this.animate();
  }

  addPlayer(player) {
    let sprite = this.createFireSprite();
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    this.spriteContainer.addChild(sprite);

    this.players[player.name] = {
      sprite:      sprite,
      x:           player.x,
      y:           player.y,
      element:     player.element,
      alive:       player.alive,
      points:      player.points,
      radius:      player.radius,
      going_up:    player.going_up,
      going_down:  player.going_down,
      going_left:  player.going_left,
      going_right: player.going_right
    }
    // then some special 'flash' to introduce player?
    this.updateLeaderboard();
  }

  updatePlayer(player) {
    let p = this.players[player.name];
    p.x           = player.x;
    p.y           = player.y;
    p.element     = player.element;
    p.alive       = player.alive;
    p.points      = player.points;
    p.radius      = player.radius;
    p.going_up    = player.going_up;
    p.going_down  = player.going_down;
    p.going_left  = player.going_left;
    p.going_right = player.going_right;
  }

  removePlayer(playerName) {
    // poof?
    delete this.players[playerName];
  }

  updateLeaderboard() {
    let html = "";
    let sortedPlayers = [];
    for (let name in this.players) {
      let player = this.players[name];
      player.name = name;
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

  // private

  createFireSprite() {
    return new PIXI.Sprite.fromImage('/images/fire1_ 01.png');
  }

  animate() {
    this.stats.begin();
    let currentPlayer = this.players[this.currentPlayerName];
    let cameraX, cameraY;

    // paint background
    if (currentPlayer) {
      cameraX = currentPlayer.x;
      cameraY = currentPlayer.y;
    } else {
      // place camera in center of map
      cameraX = -this.map_width / 2;
      cameraY = -this.map_height / 2;
    }
    this.sandBg.tilePosition.x = -cameraX;
    this.sandBg.tilePosition.y = -cameraY;

    // paint players
    for (let name in this.players) {
      let player = this.players[name];
      if (player.sprite) {
        if (player.alive) {
          player.sprite.visible = true;
          if (player == currentPlayer) {
            player.sprite.x = CANVAS_WIDTH / 2;
            player.sprite.y = CANVAS_HEIGHT / 2;
          } else {
            // TODO check if player is visible in map, don't bother if not
            let xDelta = (player.x - currentPlayer.x);
            let yDelta = (player.y - currentPlayer.y);

            // flip it if it is more than halfway across map
            if (xDelta > (this.map_width / 2)) { xDelta -= this.map_width }
            if (xDelta < (this.map_width / -2)) { xDelta += this.map_width }
            if (yDelta > (this.map_height / 2)) { yDelta -= this.map_height }
            if (yDelta < (this.map_height / -2)) { yDelta += this.map_height }

            let x = (xDelta) + (CANVAS_WIDTH / 2);
            let y = (yDelta) + (CANVAS_HEIGHT / 2);

            player.sprite.x = x;
            player.sprite.y = y;
          }
        } else {
          player.sprite.visible = false;
        }
      }
    }

    // paint minimap
    this.minimap.clear();
    this.minimap.scale.set(0.125);
    this.minimap.position.x = MINIMAP_PADDING;
    this.minimap.position.y = (CANVAS_HEIGHT - MINIMAP_PADDING) - MINIMAP_HEIGHT;
    this.minimap.beginFill(0x123456, 1);
    this.minimap.drawRect(0, 0, this.map_width, this.map_height);
    // paint minimap players
    for (let name in this.players) {
      let player = this.players[name];
      if (player.alive) {
        switch(player.element) {
          case 'water': this.minimap.beginFill(0xff0000, 1); break;
          case 'flame': this.minimap.beginFill(0xff0000, 1); break;
          case 'earth': this.minimap.beginFill(0xff0000, 1); break;
        }
        this.minimap.drawCircle(player.x, player.y, player.radius * PLAYER_MAGNIFICATION);
      }
    }
    // paint minimap viewport rect thingy
    this.minimap.lineStyle(8, 0xffffff);
    this.minimap.beginFill(0x000000, 0);
    this.minimap.moveTo(cameraX - (CANVAS_WIDTH / 2), cameraY - (CANVAS_HEIGHT / 2));
    this.minimap.lineTo(cameraX + (CANVAS_WIDTH / 2), cameraY - (CANVAS_HEIGHT / 2));
    this.minimap.lineTo(cameraX + (CANVAS_WIDTH / 2), cameraY + (CANVAS_HEIGHT / 2));
    this.minimap.lineTo(cameraX - (CANVAS_WIDTH / 2), cameraY + (CANVAS_HEIGHT / 2));
    this.minimap.lineTo(cameraX - (CANVAS_WIDTH / 2), cameraY - (CANVAS_HEIGHT / 2));

    this.renderer.render(this.stage);

    requestAnimationFrame(() => this.animate());
    this.deadReckon();
    this.stats.end();
  }

  deadReckon() {
    this.world.deadReckon();
    for (let name in this.players) {
      // assuming everyone changed
      this.updatePlayer(this.world.players[name]);
    }
  }
}
