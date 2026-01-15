import WebSocket from "ws";

const WS_URL = "wss://chat.longapp.site/chat/chat";
const USER = "22130081@st.hcmuaf.edu.vn";
const PASS = "minhhieu";
const ROOM_NAME = "Nhóm 32";

let ws: WebSocket;

function send(event: string, data?: any) {
    ws.send(JSON.stringify({
        action: "onchat",
        data: { event, data }
    }));
    console.log(`📤 SEND ${event}`);
}

ws = new WebSocket(WS_URL);

ws.on("open", () => {
    console.log("✅ Connected");
    send("LOGIN", { user: USER, pass: PASS });
});

ws.on("message", (buffer) => {
    const res = JSON.parse(buffer.toString());
    console.log(`📩 EVENT: ${res.event} | STATUS: ${res.status}`);

    if (res.status === "error") {
        console.error("❌ Error:", res.mes);
        return;
    }

    switch (res.event) {

        case "LOGIN": {
            console.log("🔐 Login OK, RE_LOGIN_CODE =", res.data?.RE_LOGIN_CODE);

            // 👉 THEO LUỒNG WEB: KHÔNG JOIN_ROOM
            send("JOIN_ROOM", {
                name: "abcxyz",
            });
            break;
        }

        case "GET_USER_LIST": {
            console.log("👤 User list:", res.data.length);
            break;
        }

        case "GET_ROOM_CHAT_MES": {
            console.log("💬 Room messages:");
            console.dir(res.data, { depth: null });
            break;
        }

        default:
            console.log("ℹ️ Ignore event:", res.event);
    }
});

ws.on("close", (c) => {
    console.log("❌ Closed:", c);
});

ws.on("error", (e) => {
    console.error("❗ WS error:", e.message);
});

setInterval(() => {}, 10000);
