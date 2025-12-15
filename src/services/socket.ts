let socket: WebSocket | null = null;

export function connectSocket() {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        return socket;
    }

    socket = new WebSocket("wss://chat.longapp.site/chat/chat");

    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onclose = () => {
        console.log("WebSocket closed");
        socket = null; // ⭐ rất quan trọng
    };

    socket.onerror = (e) => {
        console.error("WebSocket error", e);
    };

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}

export function getSocket() {
    return socket;
}
