package main

import (
	"encoding/json"
	"time"
)

const (
	TICK_LENGTH = time.Millisecond * 100
)

// hub maintains the set of active connections
// and broadcasts messages to the connections.
type hub struct {
	// Registered connections.
	connections map[*connection]bool

	// Inbound messages from the connections.
	BroadcastChan chan []byte

	// Register requests from the connections.
	RegisterChan chan *connection

	// Unregister requests from connections.
	UnregisterChan chan *connection
}

var h = hub{
	BroadcastChan:  make(chan []byte),
	RegisterChan:   make(chan *connection),
	UnregisterChan: make(chan *connection),
	connections:    make(map[*connection]bool),
}

//func NewHub(route, port) {
//	http.HandleFunc(route, serveWs)
//	go func() {
//		err := http.ListenAndServe(*addr, nil)
//		if err != nil {
//			log.Fatal("ListenAndServe: ", err)
//		}
//	}
//}

func (h *hub) run() {
	ticker := time.NewTicker(TICK_LENGTH)
	go func() {
		for range ticker.C {
			world.Tick()
			worldJson, _ := json.Marshal(world)
			for c := range h.connections {
				select {
				case c.sendChan <- worldJson:
				default:
					close(c.sendChan)
					delete(h.connections, c)
				}
			}
		}
	}()

	for {
		select {
		case c := <-h.RegisterChan:
			h.connections[c] = true
		case c := <-h.UnregisterChan:
			if _, ok := h.connections[c]; ok {
				delete(h.connections, c)
				close(c.sendChan)
			}
		case m := <-h.BroadcastChan:
			for c := range h.connections {
				select {
				case c.sendChan <- m:
				default:
					close(c.sendChan)
					delete(h.connections, c)
				}
			}
		}
	}
}
