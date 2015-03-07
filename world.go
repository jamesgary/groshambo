package main

import (
	"log"
	"time"
)

type World struct {
	Players     []*Player `json:"players"`
	currentTime time.Time `json:"currentTime"`
}

func NewWorld() *World {
	return &World{
		Players:     []*Player{},
		currentTime: time.Now(),
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
