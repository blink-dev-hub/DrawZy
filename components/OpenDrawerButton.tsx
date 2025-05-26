"use client"
import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

import { toast } from "sonner"


import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import {useForm} from  'react-hook-form'

export default function DrawerDemo() {
    const router = useRouter()

    const createQueryString = (name:string, value:string) => {
        const params = new URLSearchParams();
        params.set(name, value);
    
        return params.toString();
    };

    const {register, handleSubmit}  = useForm();

    const handleRoomCreate = (data:any ):void => {
        if (data.roomId.length !== 3) {
            toast("Event has been created.")

        }
        router.push("/receiver" + "?" + createQueryString("roomId", data.roomId));

    }

    const handleRoomJoin = (data: any) => {
        if (data.roomId.length !== 3) {
            toast("Event has been created.")
        }
        router.push("/sender" + "?" + createQueryString("roomId", data.roomId));
    }

  return (
        <Drawer>
        <DrawerTrigger>Start</DrawerTrigger>
        <DrawerContent className="items-center flex justify-center">
            <DrawerHeader>
                <DrawerTitle> Create or Join Room For Video Call</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
                <Tabs defaultValue="Create" className="w-[400px] h-60">
                    <TabsList>
                        <TabsTrigger value="Create">Create</TabsTrigger>
                        <TabsTrigger value="Join">Join</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Create" className=" mb-10">
                        <div  className="h-full w-full rounded-lg shadow-lg p-5 outline-1 outline-zinc-200 outline">
                            <form onSubmit={handleSubmit(handleRoomCreate)}>
                                <Input  {...register("roomId", {required:true})} placeholder="Room Id"></Input>
                                <Button className="mt-2" type="submit">Create Room</Button>
                            </form>
                        </div>
                    </TabsContent>
                    <TabsContent value="Join" className=" mb-10">
                        <div className="h-full w-full rounded-lg shadow-lg p-5 outline-1 outline-zinc-200 outline">
                            <form onSubmit={handleSubmit(handleRoomJoin)}>
                                <Input  {...register("roomId", {required:true})} placeholder="Room Id"></Input>
                                <Button className="mt-2" type="submit">Join Room</Button>
                            </form>
                        </div>
                    </TabsContent>
                </Tabs>
            </DrawerFooter>
            </DrawerContent>
        </Drawer>
  
    )
}


interface formData {
    roomId: Number
}