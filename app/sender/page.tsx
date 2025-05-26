"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export default function sender(){

    const webCam = useRef<HTMLVideoElement | null>(null);
    const searchParams = useSearchParams()
    const videoRef = useRef<HTMLVideoElement | null>(null);


    useEffect(()=>{
        const roomId:string | null = searchParams.get('roomId')
        const socket = new WebSocket('ws://localhost:8080')
        socket.onopen = () => {
            socket.send( JSON.stringify({type:'sender', roomId}))
        }
        startConnection(socket ,roomId)
    },[])

    function startConnection(socket: WebSocket, roomId: string | null){
        if (!socket) {
            toast("Something went wrong in backend")
            return;
        }

        console.log("Rtc Peer connection established");
        
        

        socket.onmessage = async (event:any) => {
            const message = JSON.parse(event.data);
            console.log('message:', message.type);
            
            if(message.type === 'createOffer'){
                console.log('Setting the sdp');
                await pc.setRemoteDescription(message.sdp); 
            }else if(message.type === 'iceCandidate'){
                pc.addIceCandidate(message.candidate)
            }
        }

        const pc = new RTCPeerConnection()

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sender generated ICE candidate:', event.candidate);
                socket.send(JSON.stringify({
                    type: 'iceCandidate',
                    roomId,
                    candidate: event.candidate
                }));
            }
        };
        
        pc.ontrack = async (event) =>{
            if(videoRef.current){
                videoRef.current.srcObject = new MediaStream([event.track])
                await videoRef.current.play();    
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer({offerToReceiveVideo:true});

            await pc.setLocalDescription(offer);

            socket.send(JSON.stringify({
                type: 'createAnswer',
                sdp:offer,
                roomId
            }))

            console.log('sending offer to the receiver');
            
        }


        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            if(webCam.current){
                webCam.current.srcObject = stream;
                webCam.current.play();
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track);
                });
            }
        });
    }


    return(
        <div>
            <video ref={webCam}></video>
            <video ref={videoRef}></video>
        </div>
    )
}