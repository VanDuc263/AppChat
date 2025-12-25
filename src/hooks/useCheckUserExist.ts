import {useEffect, useState} from "react";
import {getSocket} from "../services/socket";
import {useMessage} from "../contexts/MessageContext";

export function useCheckUserExist() {

    const socket = getSocket();
    const {onSearchResult} = useMessage();

    useEffect(() => {
        if (!socket) return


        const handleCheck = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            if (data.event === "CHECK_USER_EXIST" && data.status === "success") {
                const res: boolean = data.data.status

                onSearchResult(res)
            }
        }
        socket.addEventListener("message", handleCheck);

        return () =>{
            socket.removeEventListener("message",handleCheck)
        }
    }, [socket]);

}