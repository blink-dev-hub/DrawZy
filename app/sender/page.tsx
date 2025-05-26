"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Fullscreen, Video } from "lucide-react";
import { VideoOff } from "lucide-react";
import { Mic } from "lucide-react";
import { MicOff } from "lucide-react";
import { useDraw } from "../../hooks/useDraw"
import { Slider } from "@/components/ui/slider"
import { Camera } from "lucide-react";
import { senderDraw } from "@/hooks.senderDraw";

export default function sender(){
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [camera, setCamera] = useState(true);
    const [mic, setMic] = useState(true);
    const webCam = useRef<HTMLVideoElement | null>(null);
    const searchParams = useSearchParams()
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [color, setColor] = useState<string>("#000");
    const { canvasRef, onMouseDown, clear } = useDraw(drawLine);
    const senderCanvasRef = useRef<HTMLCanvasElement>(null)
    const [mode, setMode] = useState<'draw' | 'erase'>('draw');
    const [lineWidth ,setLineWidth] = useState(5)
    const [socket, setSocket] = useState<WebSocket | null>(null)

    function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = color
    
        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        
        ctx.lineWidth = lineWidth
    
        if (mode === 'draw') {
            ctx.globalCompositeOperation = 'source-over'
            ctx.strokeStyle = lineColor
        } else {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.strokeStyle = 'rgba(0,0,0,1)'
        }
    
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()
    
        if (mode === 'draw') {
            ctx.fillStyle = lineColor
            ctx.beginPath()
            ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
            ctx.fill()
        }
        if (socket) {
            socket.send(JSON.stringify({
                type:'draw',
                prevPoint,
                currentPoint,
                color,
                lineWidth
            }))
        }
    }

    function drawReceivedLine({ prevPoint, currentPoint, ctx, color, lineWidth }: senderDraw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = color
    
        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        
        ctx.lineWidth = lineWidth
    
        if (mode === 'draw') {
            ctx.globalCompositeOperation = 'source-over'
            ctx.strokeStyle = lineColor
        } else {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.strokeStyle = 'rgba(0,0,0,1)'
        }
    
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()
    
        if (mode === 'draw') {
            ctx.fillStyle = lineColor
            ctx.beginPath()
            ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
            ctx.fill()
        }
    }

    function clearSenderCanvas(ctx:any){
        if (senderCanvasRef) {
            const canvas = senderCanvasRef.current;
            if (canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)    
            }
        }
    }

    useEffect(()=>{
        const roomId:string | null = searchParams.get('roomId')
        const socket = new WebSocket('ws://localhost:8080')
        let ctx: CanvasRenderingContext2D | null = null;
        socket.onopen = () => {
            socket.send( JSON.stringify({type:'sender', roomId}))
        }
        setSocket(socket)
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        if (senderCanvasRef.current) {
            const canvas = senderCanvasRef.current;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx = senderCanvasRef.current?.getContext('2d')
        
        }
        startConnection(socket ,roomId, ctx!)
    },[])

    function startConnection(socket: WebSocket, roomId: string | null, ctx: CanvasRenderingContext2D){
        if (!socket) {
            toast("Something went wrong in backend")
            return;
        }

        console.log("Rtc Peer connection established");
        
        

        socket.onmessage = async (event:any) => {
            const message = JSON.parse(event.data);
            
            if(message.type === 'createOffer'){
                console.log('Setting the sdp');
                await pc.setRemoteDescription(message.sdp); 
            }else if(message.type === 'iceCandidate'){
                pc.addIceCandidate(message.candidate)
            }else if(message.type === 'clear'){
                clearSenderCanvas(ctx);
            }
        }

        const pc = new RTCPeerConnection()

        pc.onicecandidate = (event) => {
            if (event.candidate) {
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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if(webCam.current){
                setStream(stream)
                webCam.current.srcObject = stream;
                webCam.current.play();
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track);
                });
            }
        });
    }

    const handleVideo = () => {
        if (stream) {
            stream.getTracks()[1].enabled = !stream.getTracks()[1].enabled;
            setCamera(stream.getTracks()[1].enabled)

        }
    }

    const handleMic = () => {
        if(stream){
            stream.getTracks()[0].enabled = !stream.getTracks()[0].enabled;
            setMic(stream.getTracks()[0].enabled)
        }
    }


    const handleClear = () => {
        clear()
        socket?.send(JSON.stringify({type:'clear'}));
    }

    const takeScreenShot = () => {
        navigator.mediaDevices.getDisplayMedia({video:true})
    }

    return(
        <div className="w-screen h-screen flex flex-row">
            <div className="h-screen w-4/5 p-5 relative"> {/* Set relative positioning for the container */}
                <div className="dotted-grid w-full h-full rounded-xl shadow-lg bg-white outline-zinc-400 outline-3 outline relative"> {/* Set relative positioning here too */}
                    <canvas 
                        ref={senderCanvasRef}
                        className="w-full h-full absolute top-0 left-0"
                    ></canvas>  
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        className="w-full h-full absolute top-0 left-0"
                    ></canvas>  
                </div>
            </div>
           <div className="w-1/5 shadow-md bg-gray-100 h-screen flex-col flex" >
                <div className="h-1/2 flex-col flex w-full p-5">
                    <div className="w-full bg-gray-200 rounded-md shadow-sm p-1 hover:bg-blue-300 hover:shadow-lg  hover:animate-pulse">
                        <h1 className="font-bold text-zinc-700">Sender</h1>
                        <video className="object-fill rounded-sm shadow-md"  ref={videoRef}></video>
                    </div>    
                    <div className="mt-6 w-full bg-zinc-200 rounded-md shadow-sm p-1 hover:bg-blue-300 hover:shadow-lg hover:animate-pulse">
                        <h1 className="font-bold text-zinc-700">WebCam</h1>
                        <video className="object-fill rounded-sm shadow-md" ref={webCam} ></video>
                    </div>
                </div>
                <div className="h-1/2  items-end p-5 justify-center flex-row mt-20 ">
                    <div className="mt-10 bg-zinc-200 p-5 rounded-xl shadow-lg items-center justify-center flex flex-col">
                        <h1>Colors:</h1>
                        <div className="flex mt-2">
                            <button onClick={ () => setColor("#5fa5fa")} className="mr-5 w-8 h-8 rounded-full bg-blue-400"></button>
                            <div onClick={ () => setColor("#f04343")} className="mr-5 w-8 h-8 rounded-full bg-red-500"></div>
                            <div onClick={ () => setColor("#000000")} className="mr-5 w-8 h-8 rounded-full bg-black"></div>
                            <div onClick={ () => setColor("#facc14")} className="mr-5 w-8 h-8 rounded-full bg-yellow-400"></div>
                            <div onClick={ () => setColor("#49de80")} className="mr-5 w-8 h-8 rounded-full bg-green-400"></div>

                        </div>
                        <h1 className="mt-5 mb-2">lineWidth: {lineWidth}</h1>
                        <Slider onValueChange={(e) => setLineWidth(e[0])
                        } defaultValue={[5]} min={1} max={50} step={1} />

                        <div className="mt-5 flex flex-row ">
                            
                            <button onClick={handleClear} className="mr-5 bg-red-500 w-20 h-10 hover:bg-red-400 rounded-lg">clear</button>
                            <button onClick={takeScreenShot} className=" bg-red-500 w-20 h-10 hover:bg-red-400 rounded-lg items-center justify-center flex"><Camera/></button>
                        </div>
                    </div>
                <div className="bg-zinc-200  shadow-sm rounded-2xl p-2 flex mt-3 items-center justify-center">
                    <button 
                        onClick={handleVideo} 
                        className={`m-3 outline outline-2 ${camera ? 'outline-red-500' : 'outline-zinc-800'} rounded-full p-2`}
                        >
                        {
                            camera? <Video color="#FF0000"/> : <VideoOff/>
                        }
                    </button>                    
                    <button onClick={handleMic} 
                        className={`m-3 outline outline-2 ${mic ? 'outline-red-500' : 'outline-zinc-800'} rounded-full p-2`}
                        >
                        {
                            mic? <Mic color="#FF0000"/> : <MicOff/>
                        }
                    </button>
                </div>
                </div>
               </div>
        </div>
    )
}