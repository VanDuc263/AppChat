import {useMessage} from "../contexts/MessageContext";
import {useEffect, useRef} from "react";
import { checkUserOnlineApi } from "../services/chatService";


export function useOnlineChecker(){
    const {currentConversation} = useMessage()
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        if(!currentConversation) return

        if(intervalRef.current){
            clearInterval(intervalRef.current)
        }

        checkUserOnlineApi(currentConversation)

        intervalRef.current = window.setInterval(() =>{
            checkUserOnlineApi(currentConversation)
        },1000)

        return () =>{
            if(intervalRef.current){
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [currentConversation]);
}