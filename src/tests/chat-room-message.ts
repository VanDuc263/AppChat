const WS_URL = "wss://chat.longapp.site/chat/chat";
const username = "22130081@st.hcmuaf.edu.vn";
const password = "minhhieu";
const roomName = "Nhom_10";
const page = 1;

let ws: WebSocket | null = null;

/* ================= SOCKET ================= */

export function connectSocket(): WebSocket {
    if (!ws) {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => console.log("✅ WebSocket connected");
        ws.onclose = () => {
            console.log("❌ WebSocket closed");
            ws = null;
        };
        ws.onerror = (e) => console.error("WebSocket error:", e);
    }
    return ws;
}

/* ================= LOGIN ================= */

function login(user: string, pass: string) {
    const socket = connectSocket();

    const payload = {
        action: "onchat",
        data: {
            event: "LOGIN",
            data: { user, pass }
        }
    };

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    } else {
        socket.addEventListener("open", () => {
            socket.send(JSON.stringify(payload));
        }, { once: true });
    }
}

/* ================= JOIN ROOM ================= */

function joinRoom(roomName: string) {
    const socket = connectSocket();

    socket.send(JSON.stringify({
        action: "onchat",
        data: {
            event: "JOIN_ROOM",
            data: {
                name: roomName
            }
        }
    }));
}

/* ================= GET ROOM MESSAGES ================= */

function getRoomMessages(roomName: string, page: number) {
    const socket = connectSocket();

    socket.send(JSON.stringify({
        action: "onchat",
        data: {
            event: "GET_ROOM_CHAT_MES",
            data: {
                name: roomName,
                page
            }

        }
        //     action : "onchat",
        //     data : {
        //         event : "SEND_CHAT",
        //         data : {
        //             type : "room",
        //             // to : "22131@st.hcmuaf.edu.vn",
        //             to : "Nhom_10",
        //             mes : "test --- hihihi"
        //         }
        //     }
    }
    ));
}

/* ================= LISTEN MESSAGE ================= */

const socket = connectSocket();

socket.addEventListener("message", (event) => {
    const res = JSON.parse(event.data);
    console.log("📩 Received:", res);

    // Login OK → Join room
    if (res.event === "LOGIN" && res.status === "success") {
        console.log("🔐 Login success → Join room");
        joinRoom(roomName);
    }

    // Join room OK → Get messages
    if (res.event === "JOIN_ROOM" && res.status === "success") {
        console.log("👥 Joined room → Get room messages");
        getRoomMessages(roomName, page);
    }

    // Nhận tin nhắn room
    if (res.event === "GET_ROOM_CHAT_MES") {
        console.log("💬 Room messages:", res.data);
    }
});

/* ================= START ================= */

login(username, password);
