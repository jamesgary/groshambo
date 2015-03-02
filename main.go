package main

import (
	"log"
	"net/http"

	//"github.com/jamesgary/game/namer"
)

var world *World

func main() {
	world = NewWorld()
	go h.run()
	http.HandleFunc("/ws", serveWs)
	//hub := hubber.NewHub("/ws", "8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
