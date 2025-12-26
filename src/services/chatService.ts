import { getSocket } from "./socket";

export function sendMessageApi(toUser: string, mes: string) {
    const socket = getSocket();
    if (!socket) return;

    const safeMes = encodeURIComponent(mes);

    const sendMessage = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "SEND_CHAT",
                    data: {
                        type: "people",
                        to: toUser,
                        mes: safeMes,
                    },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendMessage();
    } else {
        socket.addEventListener("open", sendMessage, { once: true });
    }
}

export function getMessageApi(targetUser: string, page: number) {
    const socket = getSocket();

    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendGetMessage = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "GET_PEOPLE_CHAT_MES",
                    data: {
                        name: targetUser,
                        page: page,
                    },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendGetMessage();
    } else {
        socket.addEventListener("open", sendGetMessage, { once: true });
    }
}

export function getConversationApi() {
    const socket = getSocket();

    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendGetConversation = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "GET_USER_LIST",
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendGetConversation();
    } else {
        socket.addEventListener("open", sendGetConversation, { once: true });
    }
}

export function createRoomApi(name: string) {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng");
        return;
    }

    const send = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "CREATE_ROOM",
                    data: { name },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        send();
    } else {
        socket.addEventListener("open", send, { once: true });
    }
}
export function joinRoomApi(name: string) {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng");
        return;
    }

    const send = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "JOIN_ROOM",
                    data: { name },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        send();
    } else {
        socket.addEventListener("open", send, { once: true });
    }
}
export function checkUserExistApi(user : string) {
    const socket = getSocket();
    if (!socket) return;

    console.log(user)
    const sendCheckUserExist = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "CHECK_USER_EXIST",
                    data: {
                        user: user,
                    },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendCheckUserExist();
    } else {
        socket.addEventListener("open", sendCheckUserExist, { once: true });
    }
}
export function checkUserOnlineApi(user : string) {
    const socket = getSocket();
    if (!socket) return;

    console.log(user)
    const sendCheckUserOnline = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "CHECK_USER_ONLINE",
                    data: {
                        user: user,
                    },
                },
            })
        );
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendCheckUserOnline();
    } else {
        socket.addEventListener("open", sendCheckUserOnline, { once: true });
    }
}
