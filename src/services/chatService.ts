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
    const socket = getSocket()

    socket.send(JSON.stringify(
        {
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: {
                    name: targetUser,
                    page: page
                }
            }
        }
    ))

}