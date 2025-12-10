const socket = new WebSocket("wss://chat.longapp.site/chat/chat");

socket.onopen = () => {

    socket.send(JSON.stringify({
        action: "onchat",
        data: {
            event: "LOGIN",
            data: {
                user: "22130030@st.hcmuaf.edu.vn",
                pass: "ducvan263"
            }
        }
    }));
};

socket.onmessage = (ev) => {
    const res = JSON.parse(ev.data);
    console.log("📩", res);

    if (res.event === "LOGIN" && res.status === "success") {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data : {
                    name : "long",
                    page : "1"
                }
            }
        }));
    }
};
