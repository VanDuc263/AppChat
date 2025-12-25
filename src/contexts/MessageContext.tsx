import {createContext, useContext, useState, ReactNode, useRef} from "react";
import { sendMessageApi, getMessageApi } from "../services/chatService";
import {checkUserExistApi} from "../services/chatService";

export interface Message {
    id: number;
    name: string;
    to: string;
    mes: string;
    type: number;
}

export interface Conversation {
    name: string;
    type: number;
    actionTime: string;
}
type SearchState = {
    loadding : boolean
    result : boolean | null;
}
interface MessageContextType {
    conversations: Conversation[];
    messages: Message[];
    page: number;
    currentConversation: string | null;

    setPage: (page: number) => void;
    setCurrentConversation: (name: string | null) => void;

    sendMessage: (to: string, text: string) => void;
    addMessage: (message: Message) => void;

    replaceMessages: (messages: Message[]) => void;
    replaceConversations: (conversations: Conversation[]) => void;

    selectConversation: (username: string, page?: number) => void;

    searchUser : (username : string) => void;

    searchState : SearchState;
    onSearchResult : (status : boolean) => void;
    resetSearch : () => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [page, setPage] = useState(1);
    const [currentConversation, setCurrentConversation] = useState<string | null>(null);
    const [searchState,setSearchState] = useState<SearchState>({loadding : false,result : null})
    const currentUsernameSearchRef = useRef("");

    // ========= ACTIONS =========

    const addMessage = (message: Message) => {
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (
                last &&
                last.name === message.name &&
                last.to === message.to &&
                last.mes === message.mes &&
                Math.abs(message.id - last.id) < 1500
            ) {
                return prev;
            }
            return [...prev, message];
        });
    };

    const replaceMessages = (newMessages: Message[]) => {
        const sorted = [...newMessages].sort((a, b) => a.id - b.id);
        setMessages(sorted);
    };

    const replaceConversations = (newConversations: Conversation[]) => {
        setConversations(newConversations);
    };

    const sendMessage = (to: string, text: string) => {
        const username = localStorage.getItem("username");
        if (!username) return;

        const newMes: Message = {
            id: Date.now(),
            name: username,
            to,
            mes: text,
            type: 1,
        };

        addMessage(newMes);
        sendMessageApi(to, text);
    };

    const selectConversation = (name: string, pageParam = 1) => {
        setCurrentConversation(name);
        setPage(pageParam);
        setMessages([]); // messages sẽ do persistence hook load
        getMessageApi(name, pageParam);
    };
    const searchUser = (username : string) =>{
        currentUsernameSearchRef.current = username
        if(!username.trim()) return
        setSearchState({
            loadding : true,
            result : null
        })

        checkUserExistApi(username)
    }
    const onSearchResult = (status : boolean) =>{

        setSearchState({
            loadding : false,
            result : status,
        })
        if(status){
            selectConversation(currentUsernameSearchRef.current,1)
        }

    }
    const resetSearch = () => {
        setSearchState({
            loading: false,
            result: null,
        });
    };
    return (
        <MessageContext.Provider
            value={{
                conversations,
                messages,
                page,
                currentConversation,

                setPage,
                setCurrentConversation,

                sendMessage,
                addMessage,
                replaceMessages,
                replaceConversations,
                selectConversation,

                searchUser,
                searchState,
                onSearchResult,
                resetSearch,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
}

export const useMessage = () => {
    const ctx = useContext(MessageContext);
    if (!ctx) throw new Error("useMessage must be used within MessageProvider");
    return ctx;
};
