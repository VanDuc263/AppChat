import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import { reLoginApi } from "../services/authService";
import { getConversationApi } from "../services/chatService";

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
        console.warn(" Auth timeout → force login");

        localStorage.removeItem("username");
        localStorage.removeItem("re_login");

        hasSuccessRef.current = false;
        setRetryCount(0);
        setAuthStatus("unauthenticated");
    };

    useEffect(() => {
        const socket = getSocket();
        console.log("🎧 listener socket:", socket);

        const username = localStorage.getItem("username");
        const reLoginCode = localStorage.getItem("re_login");

        /* =====================
           1 SOCKET LISTENER (LUÔN LUÔN GẮN)
        ====================== */
        const onMessage = (ev: MessageEvent) => {
            try {
                const res = JSON.parse(ev.data);
                console.log(" SOCKET:", res);

                // ===== REGISTER =====
                if (res.event === "REGISTER") {
                    window.dispatchEvent(
                        new CustomEvent("REGISTER_RESULT", { detail: res })
                    );
                    return;
                }

                // ===== LOGIN / RE_LOGIN SUCCESS =====
                if (
                    (res.event === "LOGIN" || res.event === "RE_LOGIN") &&
                    res.status === "success"
                ) {
                    console.log(" Auth success");

                    hasSuccessRef.current = true;
                    retryTimeoutRef.current &&
                    clearTimeout(retryTimeoutRef.current);

                    const newCode = res.data.RE_LOGIN_CODE;
                    localStorage.setItem("re_login", newCode);

                    setUser({ username: username!, code: newCode });
                    setAuthStatus("authenticated");
                    getConversationApi();
                }

                // ===== LOGIN / RE_LOGIN ERROR =====
                if (
                    res.status === "error" &&
                    (res.event === "LOGIN" || res.event === "RE_LOGIN")
                ) {
                    console.error(" Auth error");
                    forceRelogin();
                }
            } catch (err) {
                console.error("Socket parse error", err);
            }
        };

        socket.addEventListener("message", onMessage);

        /* =====================
           2️ AUTH / RELOGIN LOGIC
        ====================== */
        const attemptRelogin = async () => {
            if (!username || !reLoginCode) {
                setAuthStatus("unauthenticated");
                return;
            }

            if (hasSuccessRef.current) return;

            if (retryCount >= MAX_RETRY) {
                console.error(" Max retry reached");
                forceRelogin();
                return;
            }

            try {
                console.log(" Waiting socket...");
                await waitForSocketOpen(socket);

                console.log(` RE_LOGIN attempt ${retryCount + 1}`);
                reLoginApi(username, reLoginCode);

                retryTimeoutRef.current = setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, RETRY_DELAY);
            } catch {
                forceRelogin();
            }
        };

        if (authStatus === "checking") {
            attemptRelogin();
        }

        /* =====================
           CLEANUP
        ====================== */
        return () => {
            socket.removeEventListener("message", onMessage);
            retryTimeoutRef.current &&
            clearTimeout(retryTimeoutRef.current);
        };
    }, [authStatus, retryCount, setAuthStatus, setUser]);
}
