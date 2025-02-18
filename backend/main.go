package main

import (
	"fmt"
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var (
	upgrader = websocket.Upgrader{}
)

func helloWS (c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()
	
	err = ws.WriteMessage(websocket.TextMessage, []byte("Hello from server!"))
	if err != nil {
		return err
	}


	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				// Handle normal close gracefully
				fmt.Println("Connection closed normally")
			} else {
				// Log other errors
				c.Logger().Error(err)
			}
			break
		}
		fmt.Printf("%s\n", msg)
	}
	return nil
}

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "hello from echo server")
	})
	e.GET("/ws", helloWS)
	e.Logger.Fatal(e.Start(":8080"))
}