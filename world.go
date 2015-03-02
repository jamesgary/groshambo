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
