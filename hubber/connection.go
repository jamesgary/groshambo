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
	readWait = 30 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

type Connection struct {
	// Channel to send message to client
	// Send messages to me to speak to the client!
	// Make sure you defer to close me!
	OutputChan chan []byte

	// Channel to receive message from client
	// Receive messages from me to listen to the client!
	// If I'm closed, that means something horrific happened and we're disconnected.
	InputChan chan []byte

	// Whenever a connection goes bad
	DisconnectChan chan error

	// The original request, cloned to avoid race condition?
	Request http.Request

	ws *websocket.Conn
}

func (c *Connection) readPump() error {
	defer func() {
		//close(c.OutputChan)
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(readWait))

	for {
		_, msg, err := c.ws.ReadMessage()
		if err != nil {
			return err
		}
		c.InputChan <- msg
	}
}

func (c *Connection) writePump() error {
	defer func() {
		close(c.InputChan)
		c.ws.Close()
	}()

	for {
		select {
		case message, ok := <-c.OutputChan:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return nil
			}
			err := c.write(websocket.TextMessage, message)
			if err != nil {
				return err
			}
		}
	}
}

// write writes a message with the given message type and payload.
func (c *Connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}
