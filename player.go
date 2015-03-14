package main

import (
	"math"
	"math/rand"
	"time"
)

const (
	RADIUS = 10
)

type Player struct {
	Name    string  `json:"name"`
	Element string  `json:"element"`
	Alive   bool    `json:"alive"`
	Points  int64   `json:"points"`
	Radius  float64 `json:"radius"`

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
		p.Radius = RADIUS
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

	// wrap!
	if p.X < 0 {
		p.X += MAP_WIDTH
	}
	if p.X > MAP_WIDTH {
		p.X -= MAP_WIDTH
	}
	if p.Y < 0 {
		p.Y += MAP_HEIGHT
	}
	if p.Y > MAP_HEIGHT {
		p.Y -= MAP_HEIGHT
	}

}

func (p *Player) collidesWith(p2 *Player) bool {
	// TODO handle wrapping
	distance := math.Sqrt(math.Pow(p.X-p2.X, 2) + math.Pow(p.Y-p2.Y, 2))
	return distance < p.Radius+p2.Radius
}

func (p *Player) canEat(p2 *Player) bool {
	return p.Element == "flame" && p2.Element == "earth" ||
		p.Element == "earth" && p2.Element == "water" ||
		p.Element == "water" && p2.Element == "flame"
}

func (p *Player) Eat(p2 *Player) {
	p.Radius *= 2
	p2.Alive = false
	p.Points++
}
