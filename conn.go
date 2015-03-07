package main

//
//import (
//	"encoding/json"
//	"log"
//	"net/http"
//	"time"
//
//	"github.com/gorilla/websocket"
//)
//
//const (
//	// Time allowed to write a message to the peer.
//	writeWait = 10 * time.Second
//
//	// Time allowed to read a message from the peer.
//	readWait = 60 * time.Second
//
//	// Maximum message size allowed from peer.
//	maxMessageSize = 512
//)
//
//var upgrader = websocket.Upgrader{
//	ReadBufferSize:  1024,
//	WriteBufferSize: 1024,
//	CheckOrigin:     func(r *http.Request) bool { return true },
//}
//
//// connection is a middleman between the websocket connection and the hub.
//type connection struct {
//	// The websocket connection.
//	ws *websocket.Conn
//
//	// Buffered channel of outbound messages.
//	sendChan chan []byte
//	player   *Player
//}
//
//// readPump pumps messages from the websocket connection to the hub.
//func (c *connection) readPump() {
//	defer func() {
//		h.UnregisterChan <- c
//		c.ws.Close()
//	}()
//	c.ws.SetReadLimit(maxMessageSize)
//	c.ws.SetReadDeadline(time.Now().Add(readWait))
//
//	var playerInput PlayerInput
//	for {
//		_, playerInputBytes, err := c.ws.ReadMessage()
//		if err != nil {
//			log.Print(err)
//			break
//		}
//
//		err = json.Unmarshal(playerInputBytes, &playerInput)
//		if err != nil {
//			log.Println("error parsing player input:", err)
//		}
//		c.player.SetDirection(
//			playerInput.GoingUp,
//			playerInput.GoingDown,
//			playerInput.GoingLeft,
//			playerInput.GoingRight,
//		)
//	}
//}
//
//// write writes a message with the given message type and payload.
//func (c *connection) write(mt int, payload []byte) error {
//	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
//	return c.ws.WriteMessage(mt, payload)
//}
//
//// writePump pumps messages from the hub to the websocket connection.
//func (c *connection) writePump() {
//	defer func() {
//		c.ws.Close()
//	}()
//	for {
//		select {
//		case message, ok := <-c.sendChan:
//			if !ok {
//				c.write(websocket.CloseMessage, []byte{})
//				return
//			}
//			err := c.write(websocket.TextMessage, message)
//			if err != nil {
//				return
//			}
//		}
//	}
//}
//
//// serverWs handles websocket requests from the peer.
//func serveWs(w http.ResponseWriter, r *http.Request) {
//	if r.Method != "GET" {
//		http.Error(w, "Method not allowed", 405)
//		return
//	}
//	ws, err := upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Println(err)
//		return
//	}
//	// make new player
//	player := NewPlayer("POOPY")
//	world.AddPlayer(player)
//
//	c := &connection{
//		sendChan: make(chan []byte, 256),
//		ws:       ws,
//		player:   player,
//	}
//	h.RegisterChan <- c
//	go c.writePump()
//	go c.readPump()
//}
