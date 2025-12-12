import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getSocket } from "../services/socket";

interface Message {
    from: string;
    to: string;
    message: string;
}

interface MessageContextType {
    messages: Message[];
    sendMessage: (to: string, text: string) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const socket = getSocket();

    const sendMessage = (to: string, text: string) => {
        socket?.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "SEND_MESSAGE",
                data: { to, message: text }   // gửi đúng field "message"
            }
        }));
    };

   

    return (
        <MessageContext.Provider value={{ messages, sendMessage }}>
            {children}
        </MessageContext.Provider>
    );
}

export const useMessage = () => useContext(MessageContext);
