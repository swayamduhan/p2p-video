import { useEffect, useRef } from "react"

export function Sender(){
    const ws = useRef<WebSocket | null>(null)
    const pc = useRef<RTCPeerConnection | null>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(()=>{
        ws.current = new WebSocket("ws://localhost:8080/")
        ws.current.onopen = () => {
            ws.current?.send("sender")
        }
    }, [])

    async function initiateConnection(){
        if ( !ws.current ){
            alert("socket connection not found")
            return
        }

        ws.current.onmessage = async(event) => {
            const message = JSON.parse(event.data)
            if ( message.type === 'createAnswer'){
                await pc.current?.setRemoteDescription(message.sdp)
            } else if ( message.type === 'iceCandidate'){
                pc.current?.addIceCandidate(message.candidate)
            }
        }

        pc.current = new RTCPeerConnection()
        pc.current.onicecandidate = (event) => {
            if(event.candidate){
                ws.current?.send(JSON.stringify({
                    type : "iceCandidate",
                    candidate : event.candidate
                }))
            }
        }

        pc.current.onnegotiationneeded = async() => {
            const offer = await pc.current?.createOffer()
            await pc.current?.setLocalDescription(offer)
            ws.current?.send(JSON.stringify({
                type : "createOffer",
                sdp : pc.current?.localDescription
            }))
        }

        pc.current.ontrack = (event) => {
            console.log("received track : ", event)
            if (remoteVideoRef.current){
                remoteVideoRef.current.srcObject = event.streams[0]
                remoteVideoRef.current.play().catch((err)=> console.error("error playing video : ", err))
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
            Sender
            <button onClick={initiateConnection}>Inititate Connection</button>
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