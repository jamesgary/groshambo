package main

import (
	"log"
	"time"
)

const (
	FRICTION     = 0.999
	ACCELERATION = 0.0004
)

type World struct {
	Players []*Player `json:"players"`

	rules       Rules
	currentTime time.Time
}

type Rules struct {
	Friction     float64 `json:"friction"`
	Acceleration float64 `json:"acceleration"`
}

func NewWorld() *World {
	return &World{
		Players: []*Player{},

		currentTime: time.Now(),
		rules: Rules{
			Friction:     FRICTION,
			Acceleration: ACCELERATION,
		},
	}
}

func (w *World) Tick() {
	timeSinceLastTick := time.Since(w.currentTime)
	for _, p := range w.Players {
		p.Travel(timeSinceLastTick)
		//log.Printf("%+v", p)
	}
	w.currentTime = time.Now()
}

func (w *World) AddPlayer(player *Player) {
	log.Printf("Player '%s' has joined!", player.Name)
	w.Players = append(w.Players, player)
}

func (w *World) RemovePlayer(player *Player) {
	log.Printf("Kicking player '%s'!", player.Name)

	for i, p := range w.Players {
		if p == player {
			copy(w.Players[i:], w.Players[i+1:])     // shift
			w.Players[len(w.Players)-1] = nil        // remove reference
			w.Players = w.Players[:len(w.Players)-1] // reslice
			return
		}
	}
}
