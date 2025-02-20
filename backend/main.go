package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swayamduhan/p2p-video/backend/server"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	s := server.NewServer()

	e.GET("/", s.HandleConnection)

	e.Start(":8080")
}