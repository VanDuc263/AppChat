import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getSocket } from "../services/socket";
import { sendMessageApi,getMessageApi } from "../services/chatService"

interface Message {
    id : number;
    name: string;
    to: string;
    mes: string;
    type : number;
}

interface Conversation{
    name : string;
    type : 1;
    actionTime : string;
}

interface MessageContextType {
    conversations : Conversation[]
    messages: Message[];
    page: number;
    setPage: (page: number) => void;
    currentConversation : string | null;

    sendMessage: (to: string, text: string) => void;
    addMessage: (message: Message) => void;
    addMessages: (messages: Message[]) => void;
    addConversations : (conversatins : Conversation[]) => void;
    selectConversation: (username: string, page?: number) => void;
}



const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations,setConversations] = useState<Conversation[]>([])
    const [page,setPage] = useState<number>(1)
    const [currentConversation,setCurrentConversation] = useState<string | null>(null)

    const sendMessage = (to: string, text: string) => {
        const username = localStorage.getItem("username")
        if(!username) return
        const newMes : Message ={
            id : Date.now(),
            name : username,
            to : to,
            mes : text,
            type : 1,
        }

        addMessage(newMes)
        sendMessageApi(to,text)
    };

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
        console.log(messages)
    };

    const addMessages = (newMessages: Message[]) => {
        setMessages(prev => [...prev, ...newMessages]);
    };
    const addConversations = (newConversations : Conversation[]) =>{
        setConversations(prev => [...prev,...newConversations])
    }
    const selectConversation = (name : string,pageParam? : number) => {
        try{
            const p = pageParam ?? page
            setCurrentConversation(name);
            setPage(p)
            setMessages([])
            getMessageApi(name,p)

        }catch (e){

        }
    }
    return (
        <MessageContext.Provider value={{ conversations,selectConversation,currentConversation,addConversations,messages,page, sendMessage,addMessage,addMessages,setPage }}>
            {children}
        </MessageContext.Provider>
    );
}

export const useMessage = () => useContext(MessageContext);
