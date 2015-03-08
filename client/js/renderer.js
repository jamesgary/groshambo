let WIDTH = 400;
let HEIGHT = 300;

let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

module.exports = class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.world = world;
  }

  start() {
    this.render();
    this.ctx.fillStyle = land;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  render() {
    this.ctx.fillStyle = land;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let radius = 5;
    for (let player of this.world.players) {
      this.ctx.beginPath();
      this.ctx.arc(player.x, player.y, player.dr ? radius : 10, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = player.dr ? '#f00' : '#0f0';
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#030';
      this.ctx.stroke();
    }
    this.deadReckon()

    requestAnimationFrame(() => this.render());
  }

  deadReckon() {
    //this.world.rules = {friction: 0.999, acceleration: 0.0000000001};

    if (this.world.rules.friction && this.world.rules.acceleration) {
      let now = Date.now();
      let t = now - this.world.updatedAt;
      let a = this.world.rules.acceleration;

      for (let player of this.world.players) {
        //player.dr = true; // for debugging dead reckoning
        let x_a = 0;
        let y_a = 0;
        if (player.going_up)    { y_a = -a }
        if (player.going_down)  { y_a =  a }
        if (player.going_left)  { x_a = -a }
        if (player.going_right) { x_a =  a }

        player.x += (player.x_speed * t) + (0.5 * x_a * t * t)
        player.y += (player.y_speed * t) + (0.5 * y_a * t * t)
        player.x_speed += (x_a * t)
        player.y_speed += (y_a * t)
      }
      this.world.updatedAt = now;
    }
  }
};
