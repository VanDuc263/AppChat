import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import {reLoginApi,loginApi} from "../services/authService";
import {sendMessageApi,getMessageApi} from "../services/chatService";



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
    const { user, setUser } = useAuth();



    useEffect(() => {
        if (!socket) return;

        const tryReLogin = () => {
            const username = localStorage.getItem("username");
            const reLoginCode = localStorage.getItem("re_login");
            if (!username || !reLoginCode) return;

            if (socket.readyState === WebSocket.OPEN) {
                reLoginApi(username,reLoginCode)
            } else {
                socket.addEventListener(
                    "open",
                    () => {
                        reLoginApi(username,reLoginCode)
                    },
                    { once: true }
                );
            }
        };

        tryReLogin();




        const listener = (ev: MessageEvent<string>) => {
            try {
                const res: LoginResponse = JSON.parse(ev.data);
                if ((res.event === "LOGIN" || res.event === "RE_LOGIN") && res.status === "success") {



                    const code = res.data.RE_LOGIN_CODE;
                    setUser(prev => ({
                        username: localStorage.getItem("username") || "",
                        code,
                        ...prev
                    }));
                    localStorage.setItem("re_login", code);


                    getMessageApi("long",1)

                }

                if (res.event === "LOGIN" && res.status === "error") {
                    localStorage.removeItem("username");
                    localStorage.removeItem("re_login");
                }
            } catch (e) {
                console.error("Invalid JSON from WebSocket:", e);
            }
        };

        socket.addEventListener("message", listener);

        return () => {
            socket.removeEventListener("message", listener);
        };
    }, [socket, setUser]);
}
