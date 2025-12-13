import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useMessage } from "../contexts/MessageContext";
import { useAuth } from "../contexts/AuthContext";
import {getMessageApi} from "../services/chatService";

export function useMessageListener() {
    const { setUser } = useAuth()
    const { addMessage, addMessages } = useMessage();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const username = localStorage.getItem("username");
        if (!username) return;

        getMessageApi("long",1)

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data)
            if (data.type === "GET_PEOPLE_CHAT_MES" && data.messages) {

                addMessages(data.messages);
            }

            if (data.type === "NEW_MESSAGE" && data.message) {
                addMessage(data.message);
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [setUser]);
}
