import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useMessage } from "../contexts/MessageContext";
import { useAuth } from "../contexts/AuthContext";

export function useMessageListener() {
    const { user,setUser } = useAuth()
    const { messages,addMessage, addMessages,addConversations } = useMessage();


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
            if(data.event === "GET_USER_LIST" && data.status === "success"){
                addConversations(data.data)
            }
            if (data.event === "SEND_CHAT") {
                    addMessage({
                        id : Date.now(),
                        name : data.data.name,
                        to : data.data.to,
                        mes : data.data.mes,
                        type : data.data.type,
                    });
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
