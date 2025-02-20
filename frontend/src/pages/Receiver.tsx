import { useEffect, useRef } from "react"

export function Receiver(){
    const ws = useRef<WebSocket | null>(null)
    const pc = useRef<RTCPeerConnection | null>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(()=>{
        ws.current = new WebSocket("ws://localhost:8080/")
        ws.current.onopen = () => {
            ws.current?.send("receiver")
        }
        startReceiving(ws.current)

    }, [])

    function startReceiving(ws : WebSocket){
        if( remoteVideoRef.current ){
            remoteVideoRef.current.autoplay = true
            remoteVideoRef.current.muted = true;
        }
        pc.current = new RTCPeerConnection()
        pc.current.ontrack = (event) => {
            console.log("received track : ", event)
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = event.streams[0]
                remoteVideoRef.current.play().catch((err)=> console.error("error playing video : ", err))
            }
        }

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data)
            if(msg.type === "createOffer"){
                await pc.current?.setRemoteDescription(msg.sdp)
                const answer = await pc.current?.createAnswer()
                await pc.current?.setLocalDescription(answer)
                ws.send(JSON.stringify({
                    type : "createAnswer",
                    sdp : answer
                }))
            } else if ( msg.type === "iceCandidate"){
                pc.current?.addIceCandidate(msg.candidate)
            }
        }

        pc.current.onicecandidate = (event) => {
            if(event.candidate){
                ws.send(JSON.stringify({
                    type : "iceCandidate",
                    candidate : event.candidate
                }))
            }
        }

        getStreamAndSend(pc.current)

    }

    function getStreamAndSend(pc : RTCPeerConnection){
        navigator.mediaDevices.getUserMedia({video : true}).then((stream) => {
            console.log("got stream")
            if(localVideoRef.current){
                localVideoRef.current.srcObject = stream
                localVideoRef.current.play()
            }
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream)
                console.log("added track to connection!")
            })
        })
    }

    return (
        <div>
            Receiver
            <div>
                Your Video
                <video id="localVideo" ref={localVideoRef} autoPlay playsInline></video>
            </div>
            <div>
                Other Side Video
                <video id="remoteVideo" ref={remoteVideoRef} autoPlay playsInline></video>
            </div>
        </div>
    )
}