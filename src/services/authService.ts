import {getSocket} from "./socket";

export function loginApi (username : string,password : string) {
    const socket = getSocket()
    socket.send(JSON.stringify(
        {
            action : "onchat",
            data : {
                event : "LOGIN",
                data : {
                    user : username,
                    pass : password
                }
            }
        }
    ))
}

export function logoutApi () {
    const socket = getSocket()
    socket.send(JSON.stringify(
        {
            action : "onchat",
            data : {
                event : "LOGOUT",
            }
        }
    ))
}