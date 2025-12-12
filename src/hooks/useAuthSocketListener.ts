import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";

interface LoginResponse {
    event: string;
    status: "success" | "error";
    data: {
        RE_LOGIN_CODE: string;
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

                if (res.event === "LOGIN" && res.status === "success") {
                    const code = res.data.RE_LOGIN_CODE;

                    setUser(prev => ({
                        username: localStorage.getItem("username") || "",
                        code: code,
                        ...prev
                    }));


                    localStorage.setItem("re_login",code)

                }
                if(res.event === "LOGIN" && res.status === "error"){
                    localStorage.removeItem("re_login");
                    localStorage.removeItem("username");

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
