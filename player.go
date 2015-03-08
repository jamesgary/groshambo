package main

import (
	//"math"
	"time"
)

type Player struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Points int64   `json:"points"`
	Name   string  `json:"name"`
	XSpeed float64 `json:"x_speed"`
	YSpeed float64 `json:"y_speed"`

	GoingUp    bool `json:"going_up"`
	GoingDown  bool `json:"going_down"`
	GoingLeft  bool `json:"going_left"`
	GoingRight bool `json:"going_right"`
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
	// d = vt + (1/2)at^2

	t := float64(duration / time.Millisecond)
	a := ACCELERATION

	var x_a, y_a float64
	if p.GoingUp {
		y_a = -a
	}
	if p.GoingDown {
		y_a = a
	}
	if p.GoingLeft {
		x_a = -a
	}
	if p.GoingRight {
		x_a = a
	}

	p.X += (p.XSpeed * t) + (0.5 * x_a * t * t)
	p.Y += (p.YSpeed * t) + (0.5 * y_a * t * t)
	p.XSpeed += (x_a * t)
	p.YSpeed += (y_a * t)

	//p.XSpeed *= math.Pow(FRICTION, ms)
	//p.YSpeed *= math.Pow(FRICTION, ms)
}
