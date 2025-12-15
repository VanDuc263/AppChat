const WS_URL = "wss://chat.longapp.site/chat/chat";
const username = "22130030@st.hcmuaf.edu.vn";
const password = "ducvan263";
const targetUser = "22130081@st.hcmuaf.edu.vn";
const page = 1;

let ws: WebSocket | null = null;

function connectSocket(): WebSocket {
    if (!ws) {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onclose = () => {
            console.log("WebSocket closed");
            ws = null;
        };
        ws.onerror = (e) => console.error("WebSocket error:", e);
    }
    return ws;
}

function login(username: string, password: string) {
    const socket = connectSocket();

    const sendLogin = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: { event: "LOGIN", data: { user: username, pass: password } }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendLogin();
    } else {
        socket.addEventListener("open", sendLogin, { once: true });
    }
}

function getMessages(targetUser: string, page: number) {
    const socket = connectSocket();

    const sendGetMessages = () => {
        socket.send(JSON.stringify({
            // action : "onchat",
            // data : {
            //     event : "SEND_CHAT",
            //     data : {
            //         type : "people",
            //         to : "22130081@st.hcmuaf.edu.vn",
            //         mes : "test ---"
            //     }
            // }
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: {
                    name: targetUser,
                    page: page
                }
            }
        //     action: "onchat",
        //     data: {
        //         event: "GET_USER_LIST"
        //     }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendGetMessages();
    } else {
        socket.addEventListener("open", sendGetMessages, { once: true });
    }
}

// Kết hợp: login trước, sau đó get messages khi login thành công
const socket = connectSocket();

socket.addEventListener("message", (event) => {
    const res = JSON.parse(event.data);
    console.log("Received:", res);

    // Khi login thành công mới gửi GET_PEOPLE_CHAT_MES
    if (res.event === "LOGIN" && res.status === "success") {
        getMessages(targetUser, page);
    }
});

// Start login
login(username, password);