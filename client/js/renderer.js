let water = "rgba(10, 100, 255, 1.0)";
let land = "rgba(253, 236, 144, 1)";
let landcast = "rgba(253, 236, 144, 0.9)";

module.exports = class Renderer {
  constructor(canvas, world) {
    $(canvas).attr('width', world.rules.map_width);
    $(canvas).attr('height', world.rules.map_height);

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.world = world;
  }

  start() {
    this.render();
    this.ctx.fillStyle = land;
    console.log(this.world.rules)
    this.ctx.fillRect(0, 0, this.world.rules.map_width, this.world.rules.map_height);
    this.ctx.font = "800 9pt Arial";
    this.ctx.textAlign = "center";

  }

  render() {
    this.ctx.fillStyle = land;
    this.ctx.fillRect(0, 0, this.world.rules.map_width, this.world.rules.map_height);

    for (let player of this.world.players) {
      if (player.alive) {
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
        this.ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();

        let name = player.name;
        let nameX = player.x;
        let nameY = player.y + 25;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#fff";
        this.ctx.strokeText(name, nameX, nameY);
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(name, nameX, nameY);
      }
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
      let friction = this.world.rules.friction;

      for (let player of this.world.players) {
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
        }
      }
      this.world.updatedAt = now;
    }
  }
};
