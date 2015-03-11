package main

import (
	"time"
)

const (
	FRICTION     = 0.0005
	ACCELERATION = 0.0004
	MAP_WIDTH    = 8000
	MAP_HEIGHT   = 6000
)

type World struct {
	Players map[string]*Player `json:"players"`

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
		Players: map[string]*Player{},

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
	w.checkforCollisions()

	w.currentTime = time.Now()
}

func (w *World) checkforCollisions() {
	// need to convert map to slice to iterate and avoid unnecessary checks
	players := []*Player{}
	for _, player := range w.Players {
		if player.Alive {
			players = append(players, player)
		}
	}

	i := 0
	for i < len(players) {
		p1 := players[i]
		k := i + 1
		for k < len(players) {
			p2 := players[k]
			if p1.collidesWith(p2) {
				if p1.canEat(p2) {
					p1.Eat(p2)
				}
				if p2.canEat(p1) {
					p2.Eat(p1)
				}
			}
			k++
		}
		i++
	}
}

func (w *World) AddPlayer(player *Player) {
	w.Players[player.Name] = player
}

func (w *World) RemovePlayer(player *Player) {
	delete(w.Players, player.Name)
}
