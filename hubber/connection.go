package hubber

import (
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read a message from the peer.
	// If no input from player is received, kick 'em!
	readWait = 300 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// It's up to the client to close all 3 channels
type Connection struct {
	// Channel to send message to client
	// Send messages to me to speak to the client!
	OutputChan chan []byte

	// Channel to receive message from client
	// Receive messages from me to listen to the client!
	InputChan chan []byte

	// Whenever a connection goes bad
	DisconnectChan chan error

	// The original request
	Request http.Request

	ws *websocket.Conn
}

func (c *Connection) readPump() error {
	for {
		_, msg, err := c.ws.ReadMessage()
		if err == nil {
			c.InputChan <- msg
			// player is still active, so bump their readDeadline
			c.ws.SetReadDeadline(time.Now().Add(readWait))
		} else {
			return err
		}
	}
}

func (c *Connection) writePump() error {
	for {
		select {
		case message, ok := <-c.OutputChan:
			if ok {
				err := c.write(message)
				if err != nil {
					return err
				}
			} else {
				return nil
			}
		}
	}
}

// write writes a message with the given message type and payload.
func (c *Connection) write(payload []byte) error {
	// we are still active, so bump our writeDeadline
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(websocket.TextMessage, payload)
}
