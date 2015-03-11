package main

import (
	//"math"
	"math/rand"
	"time"
)

type Player struct {
	Name    string `json:"name"`
	Element string `json:"element"`
	Alive   bool   `json:"alive"`
	Points  int64  `json:"points"`

	X float64 `json:"x"`
	Y float64 `json:"y"`

	XSpeed float64 `json:"x_speed"`
	YSpeed float64 `json:"y_speed"`

	GoingUp    bool `json:"going_up"`
	GoingDown  bool `json:"going_down"`
	GoingLeft  bool `json:"going_left"`
	GoingRight bool `json:"going_right"`
}

func NewPlayer(name string) *Player {
	return &Player{
		Name: name,
	}
}

func (p *Player) SetDirection(up, down, left, right bool) {
	p.GoingUp = up
	p.GoingDown = down
	p.GoingLeft = left
	p.GoingRight = right
}

func (p *Player) SpawnAsElement(element string) {
	if !p.Alive { // only spawn if already dead
		p.Alive = true
		p.Element = element
		p.X = (rand.Float64() * (MAP_WIDTH - 20)) + 10
		p.Y = (rand.Float64() * (MAP_HEIGHT - 20)) + 10
	}
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

	// May not be correct algorithm
	x_a -= FRICTION * p.XSpeed
	y_a -= FRICTION * p.YSpeed

	p.X += (p.XSpeed * t) + (0.5 * x_a * t * t)
	p.Y += (p.YSpeed * t) + (0.5 * y_a * t * t)
	p.XSpeed += (x_a * t)
	p.YSpeed += (y_a * t)

	//p.XSpeed *= math.Pow(FRICTION, ms)
	//p.YSpeed *= math.Pow(FRICTION, ms)
}
