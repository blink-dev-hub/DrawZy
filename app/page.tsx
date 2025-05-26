"use client"
import OpenDrawerButton from "@/components/OpenDrawerButton";
import Header from "@/components/Header";
import chari from "@/public/chari.gif";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (event: MouseEvent) => {
      if(gridRef.current) {
        const { clientX: mouseX, clientY: mouseY } = event;
        const { clientWidth: width, clientHeight: height } gridRef.current;

        const xPercent = (mouseX / width) * 100;
        const yPercent = (mouseY / height) * 100;
        const maxSkew = 3; // Maximum skew value in degrees
        const skewX = ((mouseX / width) - 0.5) * maxSkew;
        const skewY = ((mouseY / height) - 0.5) * maxSkew;

        const updateBackgroundPosition = () => {
          if(gridRef.current) {
            gridRef.current.style.backgroundPosition = `${xPercent}px ${yPercent}px`;
            gridRef.current.style.transform = `skew(${skewX}deg, ${skewY}deg)`;
          }
        }

        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateBackgroundPosition);
      }
    };

    return () => {
      window.addEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }
  }, [])

  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <main className="select-none flex min-h-screen flex-col items-center justify-center w-screen">
      <div className="grid-overlay w-screen h-screen" ref={gridRef}></div>
      <style jsx>{`
        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: 40px 40px;
          background-image: 
            /* Subtle grid lines */
            linear-gradient(to right, rgba(0, 0, 0, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px);
          background-blend-mode: overlay;
          pointer-events: none; /* Allows clicking through the grid */
          transition: background-position 0.4s ease-out; /* Smooth transition for background movement */
        }
      `}</style>
      <div className="w-full h-1/2 flex items-center justify-center ">
        <OpenDrawerButton/>
      </div>
      <div className="w-full h-1/2">
          <Image
              
              src={chari}
              alt="Hello!!!"
              className="select-none absolute bottom-0 right-0 w-28"
          />
      </div>
      </main>
  );
}