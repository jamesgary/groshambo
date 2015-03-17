module.exports = class World {
  constructor(rules) {
    this.friction     = rules.friction;
    this.acceleration = rules.acceleration;
    this.map_width    = rules.map_width;
    this.map_height   = rules.map_height;
    this.updated_at   = Date.now();
    this.players      = {};
  }

  refreshPlayers(newPlayers) {
    for (let name in newPlayers) {
      let newPlayer = newPlayers[name];
      if (this.players[newPlayer.name]) {
        let oldPlayer = this.players[newPlayer.name];
        oldPlayer.element = newPlayer.element
        oldPlayer.alive = newPlayer.alive
        oldPlayer.points = newPlayer.points
        oldPlayer.radius = newPlayer.radius

        oldPlayer.x = newPlayer.x
        oldPlayer.y = newPlayer.y

        oldPlayer.x_speed = newPlayer.x_speed
        oldPlayer.y_speed = newPlayer.y_speed

        oldPlayer.going_up = newPlayer.going_up
        oldPlayer.going_down = newPlayer.going_down
        oldPlayer.going_left = newPlayer.going_left
        oldPlayer.going_right = newPlayer.going_right
      } else {
        this.players[newPlayer.name] = newPlayer;
      }
    }
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
