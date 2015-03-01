package main

import (
	"time"
)

const (
	SPEED = 1
)

type Player struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Points int64   `json:"points"`
	Name   string  `json:"name"`

	goingUp    bool `json:"-"`
	goingDown  bool `json:"-"`
	goingLeft  bool `json:"-"`
	goingRight bool `json:"-"`
}

func (p *Player) SetDirection(up, down, left, right bool) {
	p.goingUp = up
	p.goingDown = down
	p.goingLeft = left
	p.goingRight = right
}

func (p *Player) Travel(duration time.Duration) {
	distance := float64(duration) * SPEED
	if p.goingUp {
		p.Y -= distance
	}
	if p.goingDown {
		p.Y += distance
	}
	if p.goingLeft {
		p.X -= distance
	}
	if p.goingRight {
		p.X += distance
	}
}
