package main

import (
	"flag"
	"log"
	"net/http"
)

var addr = flag.String("addr", ":8080", "http service address")
var world *World

func main() {
	world = NewWorld()
	flag.Parse()
	go h.run()
	http.HandleFunc("/ws", serveWs)
	log.Printf("Running on localhost%s...\n", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
