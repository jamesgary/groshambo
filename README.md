# Groshambo

An HTML5 multiplayer realtime game inspired by Pac-Man, Pokemon, and Rock-Paper-Scissors. ES6 frontend, Go backend.

### Play now at [groshambo.com](http://groshambo.com/)!

## Running

```sh
# Run the server
go run *.go

# Run the client
cd client
gulp
```

Play on localhost:8001.

## Todo

- Add computer AIs for when there's few players
- Get more powerful when you eat other players
- Map features, such as walls
- If this world is persistent...
  - One beautiful map
  - Daily/Weekly/All-Time leaderboards
- If not...
  - Establish win-state, either first-to-X-points, or first-to-get-to-certain-size
- Camera prediction (i.e. see more in front of you when you're moving)
- Better sprites and UI
- Switch to WebGL for graphics rendering (I like [pixi.js](www.pixijs.com))
- Add mobile support
- Sounds
