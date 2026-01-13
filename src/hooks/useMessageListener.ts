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
    const { addMessage, replaceMessages, replaceConversations,handleMessageResponse,setCurrentOnline, currentConversation, } = useMessage();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const username = localStorage.getItem("username");
        if (!username) return;

        const handleMessage = (event: MessageEvent) => {
            // const data = JSON.parse(event.data);
            // console.log("[WS_RECEIVE]", data.event, data);
            // if ((data.event === "GET_PEOPLE_CHAT_MES" || data.event === "GET_ROOM_CHAT_MES") && data.status === "success") {
            //     const list = Array.isArray(data.data) ? data.data : [];
            //     const decoded = list.map((m: any) => ({
            //         ...m,
            //         mes: safeDecode(m?.mes),
            //     }));
            //
            //     handleMessageResponse(decoded);
            // 1) Raw payload từ WS
            const raw = event.data;
            // 2) Parse an toàn
            let data: any;
            try {
                data = typeof raw === "string" ? JSON.parse(raw) : raw;
            } catch (err) {
                console.groupCollapsed("%c[WS_RECEIVE] Non-JSON payload", "color:#ff6b6b;font-weight:bold;");
                console.log("raw =", raw);
                console.error("parse error =", err);
                console.groupEnd();
                return;
            }

            // 3) Log FULL JSON (raw + parsed + pretty)
            const evt = data?.event ?? data?.data?.event ?? "UNKNOWN_EVENT";
            console.groupCollapsed(
                `%c[WS_RECEIVE] ${evt} | status=${data?.status ?? "?"}`,
                "color:#4dabf7;font-weight:bold;"
            );
            console.log("raw string =", raw);
            console.log("parsed object =", data);
            try {
                console.log("pretty JSON =\n", JSON.stringify(data, null, 2));
            } catch {}
            console.groupEnd();

            if ((data.event === "GET_PEOPLE_CHAT_MES" || data.event === "GET_ROOM_CHAT_MES") && data.status === "success") {
                console.log("ROOM raw data.data =", data.data);
                const isRoom = data.event === "GET_ROOM_CHAT_MES";

                const list = isRoom
                    ? (Array.isArray(data?.data?.chatData) ? data.data.chatData : [])
                    : (Array.isArray(data?.data) ? data.data : []);

                const roomNameFromRes =
                    isRoom ? (data?.data?.name ?? data?.data?.roomName ?? "") : "";

                const decoded = list.map((m: any) => ({
                    ...m,
                    mes: safeDecode(m?.mes),
                    type: isRoom ? 1 : 0,
                    to: isRoom ? (m?.to ?? roomNameFromRes) : m?.to,
                }));

                handleMessageResponse(decoded);
            }

            if (data.event === "GET_USER_LIST" && data.status === "success") {
                const list = Array.isArray(data.data) ? data.data : [];
                replaceConversations(list);
            }
            if(data.event === "CHECK_USER_ONLINE" && data.status === "success"){
                const res = data.data.status
                setCurrentOnline(res)
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

            if (data.event === "JOIN_ROOM") {
                if (data.status === "success") {
                    window.dispatchEvent(
                        new CustomEvent("JOIN_ROOM_SUCCESS", {
                            detail: data.data,
                        })
                    );
                } else {
                    alert(data.message || "Join room thất bại");
                }
            }

        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [addMessage, replaceMessages, replaceConversations,handleMessageResponse,
        setCurrentOnline,
        currentConversation,]);
}