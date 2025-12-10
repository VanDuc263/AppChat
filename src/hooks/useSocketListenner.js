import {useEffect} from "react";
import {getSocket} from "../services/socket";
import {useAuth} from "../contexts/AuthContext";

export function useSocketListenner(){
    const socket = getSocket()
    const { setUser } = useAuth()
    const {user} = useAuth()

    useEffect(() => {
        if(!socket) return

        socket.onmessage = (ev) => {
            const res = JSON.parse(ev.data)
            console.log(res)


            if(res.event === "LOGIN" && res.status === "success"){
                setUser(res.data.user)
                console.log(user)
            }
        }
    }, [socket]);
}