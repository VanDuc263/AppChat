let socket: WebSocket | null = null;

export function connectSocket(): WebSocket {
    if (!socket) {
        socket = new WebSocket("wss://chat.longapp.site/chat/chat");

        // Tùy chọn: log đơn giản
        socket.onopen = () => console.log("WebSocket connected");
        socket.onclose = () => {
            console.log("WebSocket closed");
            socket = null; 
        };
        socket.onerror = (e) => console.error("WebSocket error:", e);
    }

    return socket;
}

export function getSocket(): WebSocket | null {
    return socket;
}
