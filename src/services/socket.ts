type SocketStatus =
    | "idle"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "disconnected";

let socket: WebSocket | null = null;
let status: SocketStatus = "idle";
let reconnectTimer: any = null;

const RECONNECT_DELAY = 3000;


let listeners: ((status: SocketStatus) => void)[] = [];

function notify() {
    listeners.forEach(cb => cb(status));
}

export function subscribeSocketStatus(cb: (status: SocketStatus) => void) {
    listeners.push(cb);
    cb(status); // emit ngay lần đầu

    return () => {
        listeners = listeners.filter(l => l !== cb);
    };
}

export function connectSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    }

    status = socket ? "reconnecting" : "connecting";
    notify();

    socket = new WebSocket("wss://chat.longapp.site/chat/chat");

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
        status = "connected";
        notify();
        
        window.dispatchEvent(new Event("SOCKET_CONNECTED"));

    };

    socket.onclose = () => {
        console.log("❌ WebSocket closed");
        socket = null;
        status = "disconnected";
        notify();
        autoReconnect();
    };

    socket.onerror = (e) => {
        console.error("⚠️ WebSocket error", e);
    };

    return socket;
}

function autoReconnect() {
    if (reconnectTimer) return;

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectSocket();
    }, RECONNECT_DELAY);
}

export function disconnectSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
    status = "disconnected";
    notify();
}

export function getSocket() {
    return socket;
}
