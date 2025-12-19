import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useMessage } from "../contexts/MessageContext";
import { useAuth } from "../contexts/AuthContext";
import {getMessageApi, sendMessageApi} from "../services/chatService";

export function useMessageListener() {
    const { user,setUser } = useAuth()
    const { addMessage, addMessages } = useMessage();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const username = localStorage.getItem("username");
        if (!username) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.event === "GET_PEOPLE_CHAT_MES" && data.status === "success") {
                addMessages(data.data);
            }

            if (data.event === "NEW_MESSAGE" && data.status === "success") {
                addMessage(data.data);
            }
            /* ===== TẠO NHÓM CHAT ===== */
            if (data.event === "CREATE_ROOM") {
                if (data.status === "success") {
                    // phát event để ChatPage / Sidebar cập nhật UI
                    window.dispatchEvent(
                        new CustomEvent("CREATE_ROOM_SUCCESS", {
                            detail: data.data,
                        })
                    );
                } else {
                    alert(data.message || "Tạo nhóm thất bại");
                }
            }
        };


        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [addMessages]);
}
