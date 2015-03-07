// how to ban: c.write(websocket.CloseMessage, []byte{})
package main

import (
	"encoding/json"
	"log"
	"time"

	//"github.com/jamesgary/game/namer"
	"github.com/jamesgary/game/hubber"
)

const (
	TICK_LENGTH = time.Millisecond * 100
)

type PlayerInput struct {
	player *Player
	input  []byte
}

type MovementInput struct {
	GoingUp    bool `json:"goingUp"`
	GoingDown  bool `json:"goingDown"`
	GoingLeft  bool `json:"goingLeft"`
	GoingRight bool `json:"goingRight"`
}

func main() {
	world := NewWorld()
	hub := hubber.NewHub("/ws", 8080)

	// our own pools of channels
	playerInputChan := make(chan PlayerInput)            // channel to receieve player input
	playerOutputChans := make(map[*Player](chan []byte)) // map of players to their output channel
	disconnectChan := make(chan *Player)                 // channel to receieve players' departures
	tickerChan := time.NewTicker(TICK_LENGTH).C          // channel that ticks every so often

	log.Println("Running on localhost:8080")

	for {
		select {
		case conn := <-hub.ConnectionChan:
			// got a new player!
			//request := conn.Request
			log.Printf("Register request!") //: %+v\n", request)
			player := NewPlayer("POOPY")
			world.AddPlayer(player)

			// listen to input/output/disconnect chans on player
			go (func() {
				for {
					select {
					case msg, ok := <-conn.InputChan: // read player input
						if ok {
							playerInputChan <- PlayerInput{player, msg}
						} else {
							log.Println("Input channel was closed!")
							return
						}
					case err := <-conn.DisconnectChan: // listen for player disconnections
						log.Printf("Player disconnected! Err: %+v\n", err)
						close(conn.InputChan)
						close(conn.OutputChan)
						close(conn.DisconnectChan)
						disconnectChan <- player // notify main loop
						return
					}
				}
			})()

			// add output chan to rest of output chans for broadcasting
			playerOutputChans[player] = conn.OutputChan

		case playerInput := <-playerInputChan:
			// player said something!
			player := playerInput.player
			inputBytes := playerInput.input

			var movementInput MovementInput
			err := json.Unmarshal(inputBytes, &movementInput)
			if err != nil {
				log.Println("error parsing player input:", err)
			} else {
				player.SetDirection(
					movementInput.GoingUp,
					movementInput.GoingDown,
					movementInput.GoingLeft,
					movementInput.GoingRight,
				)
			}

		case player := <-disconnectChan: // listen for player disconnects
			world.RemovePlayer(player)
			delete(playerOutputChans, player) // stop notifying departed player

		case <-tickerChan:
			// tick the world
			world.Tick()

			// send all players the updated world
			worldJson, _ := json.Marshal(world)
			for _, outputChan := range playerOutputChans {
				// _ represents player
				// maybe do something differently for each player (like fog of war, or team stuff)?
				// but for now, everyone gets same world information
				outputChan <- worldJson
			}
		}
	}
}
