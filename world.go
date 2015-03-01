package main

import (
	"time"
)

type World struct {
	Players     []Player  `json:"players"`
	currentTime time.Time `json:"currentTime"`
}

func NewWorld() *World {
	return &World{
		Players:     []Player{},
		currentTime: time.Now(),
	}
}

func (w *World) Tick() {
	timeSinceLastTick := time.Since(w.currentTime)
	for _, p := range w.Players {
		p.Travel(timeSinceLastTick)
	}
	w.currentTime = time.Now()
}
