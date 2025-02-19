package main

import (
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var (
	upgrader = websocket.Upgrader{}
)

func serveWs (hub *Hub, c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	client := &Client{
		hub: hub,
		conn: conn,
		send: make(chan []byte, 256),
	}

	client.hub.register <- client

	// go routines for read and write here
	go client.Read()
	go client.Write()
	return c.JSON(http.StatusOK, "")
}

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	hub := NewHub()
	go hub.Run()
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "hello from echo server")
	})
	e.GET("/ws", func(c echo.Context) error {
		return serveWs(hub, c)
	})
	e.Logger.Fatal(e.Start(":8080"))
}