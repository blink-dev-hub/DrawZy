import { useRef } from "react"
import stars from '@/public/stars-colors.gif'
import Image from "next/image";
import chari from '@/public/chari.gif'

export default function Header(){

    return (
        <div className="w-screen h-screen flex bg-white">
            <Image className="w-full h-full mix-blend-screen" src={stars} alt="" ></Image>
        </div>
    );
}