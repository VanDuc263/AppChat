import {createContext, useContext, useState, ReactNode, useRef} from "react";
import { sendMessageApi, getMessageApi,sendRoomMessageApi, getRoomMessageApi, } from "../services/chatService";
import {checkUserExistApi,checkUserOnlineApi} from "../services/chatService";
import { UserService } from "../services/firebase/user.service";
import {generateUserId} from "../utils/userId";

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
    loadding : boolean;
    result : boolean | null;
}
interface MessageContextType {
    conversations: Conversation[];
    messages: Message[];
    page: number;
    setPage: (page: number) => void;
    currentConversation: string | null;
    currentOnline : boolean | null;
    setCurrentOnline : (status : boolean) => void;

    setCurrentConversation: (name: string | null) => void;

    sendMessage: (to: string, text: string) => void;
    addMessage: (message: Message) => void;

    replaceMessages: (messages: Message[]) => void;
    appendMessages: (messages: Message[]) => void;
    replaceConversations: (conversations: Conversation[]) => void;

    selectConversation: (username: string, page?: number) => void;

    searchUser : (username : string) => void;

    searchState : SearchState;
    onSearchResult: (status: boolean) => Promise<void>;
    resetSearch : () => void;
    loadMessage : (page : number) => void;
    handleMessageResponse: (messages: Message[]) => void;
    shouldAutoScroll: boolean;
    foundUser : any;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [page, setPage] = useState(1);
    const [currentConversation, setCurrentConversation] = useState<string | null>(null);
    const [currentOnline, setCurrentOnline] = useState<boolean | null>(null);
    const [searchState,setSearchState] = useState<SearchState>({loadding : false,result : null})
    const currentUsernameSearchRef = useRef("");
    const loadModeRef = useRef<"INIT" | "LOAD_MORE">("INIT");
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [foundUser, setFoundUser] = useState<any>(null);

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
    const appendMessages = (newMessages : Message[]) => {
        setMessages(prev =>
            [...prev,...newMessages].sort((a,b) => a.id - b.id)
        )
    }
    const loadMessage = (page : number) =>{
        if (!currentConversation) return;
        const nextPage = page + 1;
        const isRoom = isRoomConversation(currentConversation);
        if (isRoom) {
            getRoomMessageApi(currentConversation, nextPage);
        } else {
            getMessageApi(currentConversation, nextPage);
        }
        loadModeRef.current = "LOAD_MORE"
        setPage(nextPage)
        setShouldAutoScroll(false)
    }
    const replaceConversations = (newConversations: Conversation[]) => {
        setConversations(newConversations);
    };
    const isRoomConversation = (name: string): boolean => {
        if (!name) return false;
        const conv = conversations.find((c) => c.name === name);
        return conv ? conv.type == 1 : false;
    };

    const sendMessage = (to: string, text: string) => {
        const username = localStorage.getItem("username");
        if (!username) return;

        const isRoom = isRoomConversation(to);

        const newMes: Message = {
            id: Date.now(),
            name: username,
            to,
            mes: text,
            type: isRoom ? 1 : 0,
        };

        addMessage(newMes);
        if (isRoom) {
            sendRoomMessageApi(to, text);
        } else {
            sendMessageApi(to, text);
        }
    };

    const selectConversation = (name: string, pageParam = 1) => {
        setCurrentConversation(name);
        setPage(pageParam);
        setMessages([]);
        const isRoom = isRoomConversation(name);

        if (isRoom) {
            getRoomMessageApi(name, pageParam);
        } else {
            getMessageApi(name, pageParam);
        }

        loadModeRef.current = "INIT"
        setShouldAutoScroll(true)
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
    const onSearchResult = async (status: boolean) => {

        setSearchState({
            loadding : false,
            result : status,
        })
        if (!status) {
            setFoundUser(null);
            return;
        }
        selectConversation(currentUsernameSearchRef.current,1)
        const username = currentUsernameSearchRef.current;
        const userId = generateUserId(username);

        await UserService.ensureUser(userId, username);

        setFoundUser({
            id: userId,
            username,
        });
    }
    const resetSearch = () => {
        setSearchState({
            loadding : false,
            result: null,
        });
    };
    const handleMessageResponse = (newMessages: Message[]) => {
        if (loadModeRef.current === "INIT") {
            replaceMessages(newMessages);
        } else {
            appendMessages(newMessages);
        }
    };

    return (
        <MessageContext.Provider
            value={{
                conversations,
                messages,
                page,
                setPage,
                currentOnline,
                setCurrentOnline,
                currentConversation,

                setCurrentConversation,

                sendMessage,
                addMessage,
                replaceMessages,
                appendMessages,
                replaceConversations,
                selectConversation,
                handleMessageResponse,

                searchUser,
                searchState,
                onSearchResult,
                resetSearch,
                loadMessage,
                shouldAutoScroll,
                foundUser,
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