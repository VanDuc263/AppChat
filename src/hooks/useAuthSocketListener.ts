import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import {loginApi, reLoginApi} from "../services/authService";
import { getConversationApi } from "../services/chatService";
import { generateUserId } from "../utils/userId";

const MAX_RETRY = 2;
const RETRY_DELAY = 8000;
const SOCKET_TIMEOUT = 10000;

function waitForSocketOpen(socket: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
        if (socket.readyState === WebSocket.OPEN) return resolve();

        const timeout = setTimeout(() => {
            reject(new Error("WebSocket connection timeout"));
        }, SOCKET_TIMEOUT);

        socket.addEventListener(
            "open",
            () => {
                clearTimeout(timeout);
                resolve();
            },
            { once: true }
        );
    });
}

export function useAuthSocketListener() {
    const { setUser, setAuthStatus, authStatus } = useAuth();
    const [retryCount, setRetryCount] = useState(0);
    const hasSuccessRef = useRef(false);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const forceRelogin = () => {
        console.warn("⛔ Auth timeout → force login");

        localStorage.removeItem("username");
        localStorage.removeItem("re_login");

        hasSuccessRef.current = false;
        setRetryCount(0);

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        setAuthStatus("unauthenticated");
    };


    useEffect(() => {
        if (authStatus === "checking") {
            console.log("🔄 Reset auth retry state");

            hasSuccessRef.current = false;
            setRetryCount(0);

             if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
        }
    }, [authStatus]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const username = localStorage.getItem("username");
        const reLoginCode = localStorage.getItem("re_login");

        if (!username && !reLoginCode) {
            setAuthStatus("unauthenticated");
            return;
        }


        const onMessage = (ev: MessageEvent) => {
            try {
                const res = JSON.parse(ev.data);

                if (
                    (res.event === "LOGIN" || res.event === "RE_LOGIN") &&
                    res.status === "success"
                ) {
                    console.log("✅ Auth success");

                    hasSuccessRef.current = true;
                    if (retryTimeoutRef.current) {
                        clearTimeout(retryTimeoutRef.current);
                        retryTimeoutRef.current = null;
                    }

                    const newCode = res.data.RE_LOGIN_CODE;
                    localStorage.setItem("re_login", newCode);

                    setUser({
                        id: generateUserId(username!),
                        username,
                        code: res.data.RE_LOGIN_CODE
                    });
                    console.log()
                    setAuthStatus("authenticated");
                    getConversationApi();
                }

                if (
                    res.status === "error" &&
                    (res.event === "LOGIN" || res.event === "RE_LOGIN")
                ) {

                    console.error("❌ Auth error from server");
                    forceRelogin();

                }
            } catch (err) {
                console.error("Socket parse error", err);
            }
        };

        socket.addEventListener("message", onMessage);

        /* =======================
           2️⃣ LOGIN / RE-LOGIN LOGIC
        ======================== */
        const attemptRelogin = async () => {
            if (hasSuccessRef.current) return;

            if (retryCount >= MAX_RETRY) {
                console.error("❌ Max retry reached");
                forceRelogin();
                return;
            }

            try {
                await waitForSocketOpen(socket);

                console.log(`📡 RE_LOGIN attempt ${retryCount + 1}`);
                reLoginCode ?
                    reLoginApi(username!, reLoginCode) :

                retryTimeoutRef.current = setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, RETRY_DELAY);
            } catch (err) {
                console.error("❌ Socket not connected", err);
            }
        };

        if (authStatus === "checking") {
            attemptRelogin();
        }

        /* =======================
           CLEANUP
        ======================== */
        return () => {
            socket.removeEventListener("message", onMessage);
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [authStatus, retryCount, setAuthStatus, setUser]);
}
