import {getSocket} from "./socket";

export function sendMessageApi(toUser : string,mes : string){
    const socket = getSocket()

    socket.send(JSON.stringify(
        {
            action : "onchat",
            data : {
                event : "SEND_CHAT",
                data : {
                    type : "people",
                    to : toUser,
                    mes : mes
                }
            }
        }
    ))
}

export function getMessageApi(targetUser : string,page : number){
    const socket = getSocket();

    console.log("target user : "  + targetUser)

    if (!socket) {
        console.error("WebSocket chưa sẵn sàng. Hãy gọi connectSocket trước.");
        return;
    }

    const sendGetMessage = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: {
                    name: targetUser,
                    page: page
                }
            }
            // action: "onchat",
            // data: {
            //     event: "GET_USER_LIST"
            // }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        sendGetMessage();
    } else {
        socket.addEventListener("open", sendGetMessage, { once: true });
    }


}
export function createRoomApi(name: string) {
    const socket = getSocket();
    if (!socket) {
        console.error("WebSocket chưa sẵn sàng");
        return;
    }

    const send = () => {
        socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CREATE_ROOM",
                data: { name }
            }
        }));
    };

    if (socket.readyState === WebSocket.OPEN) {
        send();
    } else {
        socket.addEventListener("open", send, { once: true });
    }
}