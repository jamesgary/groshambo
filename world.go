package main

import (
	"time"
)

const (
	FRICTION     = 0.999
	ACCELERATION = 0.0004
	MAP_WIDTH    = 800
	MAP_HEIGHT   = 600
)

type World struct {
	Players []*Player `json:"players"`

	rules       Rules
	currentTime time.Time
}

type Rules struct {
	Friction     float64 `json:"friction"`
	Acceleration float64 `json:"acceleration"`
	MapWidth     int     `json:"map_width"`
	MapHeight    int     `json:"map_height"`
}

func NewWorld() *World {
	return &World{
		Players: []*Player{},

		currentTime: time.Now(),
		rules: Rules{
			Friction:     FRICTION,
			Acceleration: ACCELERATION,
			MapWidth:     MAP_WIDTH,
			MapHeight:    MAP_HEIGHT,
		},
	}
}

func (w *World) Tick() {
	timeSinceLastTick := time.Since(w.currentTime)
	for _, p := range w.Players {
		if p.Alive {
			p.Travel(timeSinceLastTick)
		}
	}
	w.currentTime = time.Now()
}

func (w *World) AddPlayer(player *Player) {
	w.Players = append(w.Players, player)
}

func (w *World) RemovePlayer(player *Player) {
	for i, p := range w.Players {
		if p == player {
			copy(w.Players[i:], w.Players[i+1:])     // shift
			w.Players[len(w.Players)-1] = nil        // remove reference
			w.Players = w.Players[:len(w.Players)-1] // reslice
			return
		}
	}
}
