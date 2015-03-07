package main

import (
	"time"
)

const (
	SPEED    = 0.00000001
	FRICTION = 0.9
)

type Player struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Points int64   `json:"points"`
	Name   string  `json:"name"`
	XSpeed float64 `json:"x_speed"`
	YSpeed float64 `json:"y_speed"`

	GoingUp    bool `json:"-"`
	GoingDown  bool `json:"-"`
	GoingLeft  bool `json:"-"`
	GoingRight bool `json:"-"`
}

func NewPlayer(name string) *Player {
	return &Player{
		X:    10, // TODO randomize
		Y:    10, // TODO randomize
		Name: name,
	}
}

func (p *Player) SetDirection(up, down, left, right bool) {
	p.GoingUp = up
	p.GoingDown = down
	p.GoingLeft = left
	p.GoingRight = right
}

func (p *Player) Travel(duration time.Duration) {
	acceleration := float64(duration) * SPEED
	if p.GoingUp {
		p.YSpeed -= acceleration
	}
	if p.GoingDown {
		p.YSpeed += acceleration
	}
	if p.GoingLeft {
		p.XSpeed -= acceleration
	}
	if p.GoingRight {
		p.XSpeed += acceleration
	}

	p.XSpeed *= FRICTION
	p.YSpeed *= FRICTION
	p.X += p.XSpeed
	p.Y += p.YSpeed
}
