module.exports = class World {
  constructor(rules) {
    this.friction     = rules.friction;
    this.acceleration = rules.acceleration;
    this.map_width    = rules.map_width;
    this.map_height   = rules.map_height;
    this.updated_at   = Date.now();
    this.players      = {};
  }

  deadReckon() {
    let now = Date.now();
    let t = now - this.updated_at;
    let a = this.acceleration;
    let friction = this.friction;

    for (let name in this.players) {
      let player = this.players[name];
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
        if (player.x < 0) { player.x += this.map_width }
        if (player.x > this.map_width) { player.x -= this.map_width }
        if (player.y < 0) { player.y += this.map_height }
        if (player.y > this.map_height) { player.y -= this.map_height }
      }
    }
    this.updated_at = now;
  }
}
