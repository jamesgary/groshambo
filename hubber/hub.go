package hubber

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Hub struct {
	// Incoming connections from clients
	ConnectionChan chan *Connection
}

func NewHub(route string, port int) *Hub {
	hub := &Hub{
		ConnectionChan: make(chan *Connection, 256),
	}

	wsHandler := func(w http.ResponseWriter, r *http.Request) {
		var requestCopy http.Request
		requestCopy = *r
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Could not upgrade?!", err)
			return
		}

		conn := &Connection{
			OutputChan:     make(chan []byte, 256),
			InputChan:      make(chan []byte, 256),
			DisconnectChan: make(chan error),
			Request:        requestCopy,
			ws:             ws,
		}

		hub.ConnectionChan <- conn

		go func() {
			err := conn.writePump()
			log.Println("Error in the writePump:", err)
		}()

		go func() {
			err = conn.readPump()
			log.Println("Error in the readPump:", err)
		}()

		//hub.UnregisterChan <- conn

		//conn.destroy()
	}

	http.HandleFunc(route, wsHandler)
	go func() {
		err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
		if err != nil {
			log.Fatal("ListenAndServe: ", err)
		}
	}()

	return hub
}

// private

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}
