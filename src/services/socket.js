let socket = null

export function connectSocket(){
    if(!socket){
        socket = new WebSocket("wss://chat.longapp.site/chat/chat")
    }
    return socket
}
export function getSocket(){
    return socket
}