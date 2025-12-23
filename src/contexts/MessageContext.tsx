import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { sendMessageApi, getMessageApi, getConversationApi } from "../services/chatService";

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

interface MessageContextType {
    conversations: Conversation[];
    messages: Message[];
    page: number;
    setPage: (page: number) => void;
    currentConversation: string | null;

    sendMessage: (to: string, text: string) => void;

    addMessage: (message: Message) => void;
    replaceMessages: (messages: Message[]) => void;

    replaceConversations: (conversations: Conversation[]) => void;
    selectConversation: (username: string, page?: number) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

function safeParse<T>(raw: string | null, fallback: T): T {
    try {
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function uniqByName(convs: Conversation[]) {
    const map = new Map<string, Conversation>();
    convs.forEach((c) => map.set(c.name, c));
    return Array.from(map.values());
}

export function MessageProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [page, setPage] = useState<number>(1);
    const [currentConversation, setCurrentConversation] = useState<string | null>(null);

    const me = useMemo(() => localStorage.getItem("username") ?? "", []);

    const keyCurrent = useMemo(() => (me ? `chat:lastConversation:${me}` : ""), [me]);
    const keyMessages = (conv: string) => (me ? `chat:messages:${me}:${conv}` : "");
    const keyConvs = useMemo(() => (me ? `chat:conversations:${me}` : ""), [me]);

    useEffect(() => {
        if (!me) return;

        const cachedConvs = safeParse<Conversation[]>(localStorage.getItem(keyConvs), []);
        if (cachedConvs.length) setConversations(uniqByName(cachedConvs));

        const lastConv = safeParse<string | null>(localStorage.getItem(keyCurrent), null);
        if (!lastConv) return;

        setCurrentConversation(lastConv);

        const cachedMsgs = safeParse<Message[]>(localStorage.getItem(keyMessages(lastConv)), []);
        setMessages(cachedMsgs);

        getMessageApi(lastConv, 1);
    }, [me, keyConvs, keyCurrent]);

    useEffect(() => {
        getConversationApi();
    }, []);

    useEffect(() => {
        if (!me || !keyConvs) return;
        localStorage.setItem(keyConvs, JSON.stringify(conversations));
    }, [me, keyConvs, conversations]);

    useEffect(() => {
        if (!me || !keyCurrent) return;
        if (!currentConversation) return;
        localStorage.setItem(keyCurrent, JSON.stringify(currentConversation));
    }, [me, keyCurrent, currentConversation]);

    useEffect(() => {
        if (!me || !currentConversation) return;
        localStorage.setItem(keyMessages(currentConversation), JSON.stringify(messages));
    }, [me, currentConversation, messages]);

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
        setConversations(uniqByName(newConversations));
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

    const selectConversation = (name: string, pageParam?: number) => {
        const p = pageParam ?? 1;
        setCurrentConversation(name);
        setPage(p);

        if (me) {
            const cachedMsgs = safeParse<Message[]>(localStorage.getItem(keyMessages(name)), []);
            setMessages(cachedMsgs);
        } else {
            setMessages([]);
        }

        getMessageApi(name, p);
    };

    return (
        <MessageContext.Provider
            value={{
                conversations,
                messages,
                page,
                setPage,
                currentConversation,
                sendMessage,
                addMessage,
                replaceMessages,
                replaceConversations,
                selectConversation,
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
