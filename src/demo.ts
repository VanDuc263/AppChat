function getReLoginCode(username, password, callback) {
    const socket = new WebSocket("wss://chat.longapp.site/chat/chat");

    socket.onopen = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "LOGIN",
                data: { user: username, pass: password }
            }
        }));
    };

    socket.onmessage = (e) => {
        const res = JSON.parse(e.data);
        console.log("LOGIN response:", res);

        if (res.event === "LOGIN" && res.status === "success") {
            callback(res.data.RE_LOGIN_CODE);
            socket.close();
        }
    };
}
function sendReLogin(username, code) {
    const socket = new WebSocket("wss://chat.longapp.site/chat/chat");

    socket.onopen = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: { user: username, code: code }
            }
        }));
    };

    socket.onmessage = (e) => {
        const res = JSON.parse(e.data);
        console.log("RE_LOGIN response:", res);
    };
}
getReLoginCode("22130081@st.hcmuaf.edu.vn", "minhhieu", (code) => {
    console.log("Received RE_LOGIN_CODE:", code);
    sendReLogin("22130081@st.hcmuaf.edu.vn", code);
});
