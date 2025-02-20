package server

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type SignalServer struct {
	clients map[string]*websocket.Conn
	mu sync.Mutex
}

func NewServer() *SignalServer {
	return &SignalServer{
		clients: make(map[string]*websocket.Conn),
	}
}

func (s *SignalServer) HandleConnection(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	// make client and add connection to signal server struct
	_, msg, err := conn.ReadMessage()
	if err != nil {
		log.Println("Error reading msg!")
		conn.Close()
		return nil
	}

	clientType := string(msg)

	s.mu.Lock()
	if _, exists := s.clients[clientType]; exists {
		s.mu.Unlock()
		conn.WriteMessage(websocket.TextMessage, []byte("client already exists!"))
		conn.Close()
		return nil
	}

	s.clients[clientType] = conn
	s.mu.Unlock()

	log.Println(clientType, " connected!")

	// send messages to and fro inside for loop
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		target := "receiver"
		if clientType == "receiver" {
			target = "sender"
		}

		s.mu.Lock()
		if targetClient, exists := s.clients[target]; exists {
			targetClient.WriteMessage(websocket.TextMessage, msg)
		} else {
			conn.WriteMessage(websocket.TextMessage, []byte("other client hasn't yet connected!"))
		}
		s.mu.Unlock()
	}

	// disconnect user and close connection
	s.mu.Lock()
	conn.Close()
	log.Println(clientType, " disconnected!")
	delete(s.clients, clientType)
	s.mu.Unlock()

	return nil
}