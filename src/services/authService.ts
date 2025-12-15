import { getSocket } from "./socket";

export function registerApi(username: string, password: string) {
    const socket = getSocket();

    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

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

