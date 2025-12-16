import { getSocket } from "./socket";

export function registerApi(
    username: string,
    password: string,
    callback: (success: boolean, message?: string) => void
) {
    const socket = getSocket();

    if (!socket) {
        callback(false, "WebSocket chưa sẵn sàng");
        return;
    }

    const handleMessage = (event: MessageEvent) => {
        try {
            const msg = JSON.parse(event.data);

            console.log("REGISTER RESPONSE:", msg);

            if (msg.event === "REGISTER") {
                socket.removeEventListener("message", handleMessage);

                if (msg.status === "success") {
                    callback(true, msg.data);
                } else {
                    callback(false, msg.data || "Đăng ký thất bại");
                }
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    };

    socket.addEventListener("message", handleMessage);

    const sendRegister = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "REGISTER",
                    data: {
                        user: username,
                        pass: password
                    }
                }
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendRegister();
    } else {
        socket.addEventListener("open", sendRegister, { once: true });
    }
}

export function loginApi(username: string, password: string) {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendLogin = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "LOGIN",
                data: { user: username, pass: password }
            }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendLogin();
    } else {
        socket.addEventListener("open", sendLogin, { once: true });
    }
}

export function reLoginApi(username: string, code: string) {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendReLogin = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: { user: username, code }
            }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendReLogin();
    } else {
        socket.addEventListener("open", sendReLogin, { once: true });
    }
}

export function logoutApi() {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendLogout = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: { event: "LOGOUT" }
        }));
    };
    if (socket.readyState === WebSocket.OPEN) {
        sendLogout();
    } else {
        socket.addEventListener("open", sendLogout, { once: true });
    }
}

