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
	playerInputChan := make(chan PlayerInput)
	outputChans := []chan []byte{}
	tickerChan := time.NewTicker(TICK_LENGTH).C

	log.Println("Running on localhost:8080")

	for {
		select {
		case connection := <-hub.ConnectionChan:
			// got a new player!
			//request := connection.Request
			inputChan := connection.InputChan
			outputChan := connection.OutputChan
			disconnectChan := connection.DisconnectChan

			log.Printf("Register request!") //: %+v\n", request)
			player := NewPlayer("POOPY")
			world.AddPlayer(player)

			// attach input chan to player
			go (func() {
				for {
					select {
					case msg, ok := <-inputChan:
						if ok {
							playerInputChan <- PlayerInput{player, msg}
						} else {
							log.Println("Input channel was closed!")
							return // inputChan has been closed
						}
					}
				}
			})()

			// attach disconnect chan to player
			go (func() {
				select {
				case err, ok := <-disconnectChan:
					if ok {
						log.Printf("Error from disconnect chan! %+v\n", err)
					} else {
						log.Println("Disconnect channel was closed!")
					}
					world.RemovePlayer(player)
					return
				}
			})()

			// add output chan to rest of output chans for broadcasting
			outputChans = append(outputChans, outputChan)

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

		case <-tickerChan:
			// tick the world
			world.Tick()

			// send all players the updated world
			worldJson, _ := json.Marshal(world)
			for i, outputChan := range outputChans {
				select {
				case outputChan <- worldJson: // aw yiss
				default:
					// fancy delete
					log.Println("Can't output!")
					close(outputChan)
					outputChans[i], outputChans[len(outputChans)-1], outputChans = outputChans[len(outputChans)-1], nil, outputChans[:len(outputChans)-1]
				}
			}
		}
	}
}
