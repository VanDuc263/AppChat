import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";

interface LoginResponse {
    event: string;
    status: "success" | "error";
    data: {
        user: string;
        [key: string]: any;
    };
}

export function useAuthSocketListener() {
    const socket: WebSocket | null = getSocket();
    const {  user,setUser } = useAuth();

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (ev: MessageEvent<string>) => {
            try {
                const res: LoginResponse = JSON.parse(ev.data);

                console.log(res);

                if (res.event === "LOGIN" && res.status === "success") {

                }
            } catch (e) {
                console.error("Invalid JSON from WebSocket:", e);
            }
        };

        return () => {
            socket.onmessage = null;
        };
    }, [socket]);
}
