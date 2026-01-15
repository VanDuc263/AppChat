import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useMessage } from "../contexts/MessageContext";

export function useCheckUserExist() {
    const { onSearchResult } = useMessage();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleCheck = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                if (
                    data.event === "CHECK_USER_EXIST" &&
                    data.status === "success"
                ) {
                    const res: boolean = data.data.status;
                    onSearchResult(res);
                }
            } catch (err) {
                console.error("❌ CHECK_USER_EXIST parse error", err);
            }
        };

        socket.addEventListener("message", handleCheck);

        return () => {
            socket.removeEventListener("message", handleCheck);
        };
    }, [onSearchResult]);
}
