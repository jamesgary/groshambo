let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;

let MINIMAP_PADDING = 10;
let MINIMAP_WIDTH = 200;
let MINIMAP_HEIGHT = 150;

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

    this.$leaderboard = $leaderboard;
    $(this.$leaderboard).css("height", `${CANVAS_HEIGHT}px`);
  }

  start(world, currentPlayerName) {
    this.world = world;
    this.currentPlayerName = currentPlayerName;

    this.animate();
  }

  animate() {
    this.stats.begin();
    let currentPlayer = this.world.players[this.currentPlayerName];
    if (currentPlayer) {
      this.sandBg.tilePosition.x = -currentPlayer.x;
      this.sandBg.tilePosition.y = -currentPlayer.y;
    } else {
      // place camera in center of map
      this.sandBg.tilePosition.x = this.world.map_width / 2;
      this.sandBg.tilePosition.y = this.world.map_height / 2;
    }

    this.renderer.render(this.stage);

    requestAnimationFrame(() => this.animate());
    this.world.deadReckon();
    this.stats.end();
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
}
