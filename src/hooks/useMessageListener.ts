import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useMessage } from "../contexts/MessageContext";

const safeDecode = (s: any) => {
    if (typeof s !== "string") return s;
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
};

export function useMessageListener() {
    const { addMessage, replaceMessages, replaceConversations } = useMessage();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const username = localStorage.getItem("username");
        if (!username) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.event === "GET_PEOPLE_CHAT_MES" && data.status === "success") {
                const list = Array.isArray(data.data) ? data.data : [];
                const decoded = list.map((m: any) => ({
                    ...m,
                    mes: safeDecode(m?.mes),
                }));

                replaceMessages(decoded);
            }

            if (data.event === "GET_USER_LIST" && data.status === "success") {
                const list = Array.isArray(data.data) ? data.data : [];
                replaceConversations(list);
            }

            if (data.event === "SEND_CHAT") {
                addMessage({
                    id: Date.now(),
                    name: data.data.name,
                    to: data.data.to,
                    mes: safeDecode(data.data.mes),
                    type: data.data.type,
                });
            }

            if (data.event === "CREATE_ROOM") {
                if (data.status === "success") {
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
        return () => socket.removeEventListener("message", handleMessage);
    }, [addMessage, replaceMessages, replaceConversations]);
}
