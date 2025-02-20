# P2P Video
Uses WebRTC to initiate a peer connection between Sender and Receiver using a Websocket signalling server in Go.

## Setup
1. git clone
2. ```bash
    cd backend
    go run main.go
    ```
3. ```bash
    cd frontend
    npm run dev
    ```
4. select sender on one window and receiver on second window.
5. initiate connection on sender
6. check websocket connection in network tab to see data transmitted via signalling server.
7. check webrtc-internals on browser to see the peer connection

## Authors
Swayam Duhan <3  
