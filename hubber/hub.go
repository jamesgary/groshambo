package hubber

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Hub struct {
	// Incoming connections from clients
	ConnectionChan chan *Connection
}

func NewHub(route string, port int) *Hub {
	hub := &Hub{
		ConnectionChan: make(chan *Connection),
	}

	wsHandler := func(w http.ResponseWriter, r *http.Request) {
		var requestCopy http.Request
		requestCopy = *r
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("Could not upgrade?! %+v", err)
			return
		}
		ws.SetReadLimit(maxMessageSize)
		ws.SetReadDeadline(time.Now().Add(readWait))

		conn := &Connection{
			OutputChan:     make(chan []byte, 256),
			InputChan:      make(chan []byte, 256),
			DisconnectChan: make(chan error, 1), // don't block if we disconnect during setup
			Request:        requestCopy,
			ws:             ws,
		}

		hub.ConnectionChan <- conn

		readWriteErrChan := make(chan error, 2)
		go func() {
			err = conn.writePump()
			if err != nil {
				log.Printf(`writePump stopped. Error: "%+v"`, err)
			}
			readWriteErrChan <- err
		}()

		go func() {
			err = conn.readPump()
			log.Printf(`readPump stopped. Error: "%+v"`, err)
			readWriteErrChan <- err
		}()

		// wait for some error to come from either pump
		err = <-readWriteErrChan
		conn.DisconnectChan <- err
		conn.ws.Close()
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
