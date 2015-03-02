package main

import (
	"time"
)

const (
	SPEED = 0.00000001
)

type PlayerInput struct {
	GoingUp    bool `json:"goingUp"`
	GoingDown  bool `json:"goingDown"`
	GoingLeft  bool `json:"goingLeft"`
	GoingRight bool `json:"goingRight"`
}

type Player struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Points int64   `json:"points"`
	Name   string  `json:"name"`

	GoingUp    bool `json:"-"`
	GoingDown  bool `json:"-"`
	GoingLeft  bool `json:"-"`
	GoingRight bool `json:"-"`
}

func NewPlayer(name string) *Player {
	return &Player{
		X:      10, // TODO randomize
		Y:      10, // TODO randomize
		Points: 0,
		Name:   name,
	}
}

func (p *Player) SetDirection(up, down, left, right bool) {
	p.GoingUp = up
	p.GoingDown = down
	p.GoingLeft = left
	p.GoingRight = right
}

func (p *Player) Travel(duration time.Duration) {
	distance := float64(duration) * SPEED
	if p.GoingUp {
		p.Y -= distance
	}
	if p.GoingDown {
		p.Y += distance
	}
	if p.GoingLeft {
		p.X -= distance
	}
	if p.GoingRight {
		p.X += distance
	}
}
