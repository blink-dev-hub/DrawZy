"use client"
import OpenDrawerButton from "@/components/OpenDrawerButton";
import Header from "@/components/Header";
import chari from "@/public/chari.gif";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    console.log("hello!!!");
  }, [])
  return (
    <main className="select-none flex min-h-screen flex-col items-center justify-center w-screen">
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