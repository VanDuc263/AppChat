import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getSocket } from "../services/socket";
import { sendMessageApi,getMessageApi } from "../services/chatService"

interface Message {
    id : bigint;
    name: string;
    type : bigint;
    to: string;
    mes: string;
}

interface MessageContextType {
    messages: Message[];
    page: number;
    sendMessage: (to: string, text: string) => void;
    getMessage: (username: string, page?: number) => void;
    addMessage: (message: Message) => void;
    addMessages: (messages: Message[]) => void;
    setPage: (page: number) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [page,setPage] = useState<number>(1)

    const sendMessage = (to: string, text: string) => {
        sendMessageApi(to,text)
    };
    const getMessage = (user : string,pageParam? : number) => {
        try{
            const p = pageParam ?? page
            setPage(p)
            getMessageApi(user,p)
        }catch (e){

        }
    }
    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const addMessages = (newMessages: Message[]) => {
        setMessages(prev => [...prev, ...newMessages]);
    };

    return (
        <MessageContext.Provider value={{ messages,page, sendMessage,getMessage,addMessage,addMessages,setPage }}>
            {children}
        </MessageContext.Provider>
    );
}

export const useMessage = () => useContext(MessageContext);
