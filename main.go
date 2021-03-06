package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jamesgary/groshambo/hubber"
	"github.com/jamesgary/groshambo/naming"
)

const (
	PORT        = 8080
	TICK_LENGTH = time.Millisecond * 30  // ~30 fps
	PING_LENGTH = time.Millisecond * 100 // 10 fps
)

var namer naming.Namer

type PlayerInput struct {
	player *Player
	input  []byte
}

// All incoming player messages have a type.
// Use this to figure out how to unmarshal message.
type PlayerInputType struct {
	Type string `json:"type"`
}

type MovementInput struct {
	GoingUp    bool `json:"going_up"`
	GoingDown  bool `json:"going_down"`
	GoingLeft  bool `json:"going_left"`
	GoingRight bool `json:"going_right"`
}

type ElementInput struct {
	Element string `json:"element"`
}

func main() {
	world := NewWorld()
	rulesJson, _ := json.Marshal(world.rules)
	hub := hubber.NewHub("/ws", PORT)
	go setupNamer()

	// our own pools of channels
	playerInputChan := make(chan PlayerInput)            // channel to receieve player input
	playerOutputChans := make(map[*Player](chan []byte)) // map of players to their output channel
	disconnectChan := make(chan *Player)                 // channel to receieve players' departures
	tickerChan := time.NewTicker(TICK_LENGTH).C          // channel that ticks world physics
	pingChan := time.NewTicker(PING_LENGTH).C            // channel that sends game state to players

	log.Println("Running game on localhost:8080/ws")

	for {
		select {
		case conn := <-hub.ConnectionChan:
			// check their name
			nameId := conn.Request.URL.Query().Get("name_id")
			name, err := namer.Get(nameId)
			if err != nil {
				conn.DisconnectChan <- errors.New("Bad name id!")
				// don't make new player!
			}
			player := NewPlayer(name)
			world.AddPlayer(player)

			// send player initial rules, map, or other immutable data
			conn.OutputChan <- rulesJson

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

			var playerInputType PlayerInputType
			err := json.Unmarshal(inputBytes, &playerInputType)
			if err != nil {
				log.Println("Error parsing player input type:", err)
			} else {
				switch playerInputType.Type {
				case "movement":
					var movementInput MovementInput
					err := json.Unmarshal(inputBytes, &movementInput)
					if err != nil {
						log.Println("Error parsing movement input:", err)
					} else {
						player.SetDirection(
							movementInput.GoingUp,
							movementInput.GoingDown,
							movementInput.GoingLeft,
							movementInput.GoingRight,
						)
					}
				case "element":
					var elementInput ElementInput
					err := json.Unmarshal(inputBytes, &elementInput)
					if err != nil {
						log.Println("Error parsing element input:", err)
					} else {
						player.SpawnAsElement(elementInput.Element)
					}
				default:
					log.Printf(`Unknown player input type: "%s"\n`, playerInputType.Type)
				}
			}

		case player := <-disconnectChan: // listen for player disconnects
			world.RemovePlayer(player)
			delete(playerOutputChans, player) // stop notifying departed player

		case <-tickerChan:
			world.Tick()

		case <-pingChan:
			// send all players the updated world
			worldJson, _ := json.Marshal(world)
			for _, outputChan := range playerOutputChans {
				// _ represents player struct
				// maybe do something differently for each player (like fog of war, or team stuff)?
				// but for now, everyone gets same world information
				outputChan <- worldJson
			}
		}
	}
}

func setupNamer() {
	var err error
	namer, err = naming.NewNamer()
	if err != nil {
		log.Println("Error making namer", err)
	}
	http.HandleFunc("/names", nameHandler)
	log.Println("Running namer on localhost:8080/names")
	http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil)
}

func nameHandler(w http.ResponseWriter, r *http.Request) {
	// CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var names [10][2]string // 10 name/ID pairs
	i := 0
	for i < 10 {
		names[i][0], names[i][1] = namer.Generate()
		i++
	}
	namesJson, _ := json.Marshal(names)

	fmt.Fprint(w, string(namesJson))
}
