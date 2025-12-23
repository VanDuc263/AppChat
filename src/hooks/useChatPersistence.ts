import { useEffect } from "react";
import { useMessage } from "../contexts/MessageContext";
import { getConversationApi } from "../services/chatService";

function safeParse<T>(raw: string | null, fallback: T): T {
    try {
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function useChatPersistence() {
    const {
        conversations,
        messages,
        currentConversation,
        replaceConversations,
        replaceMessages,
        selectConversation,
    } = useMessage();

    const me = localStorage.getItem("username");

    const keyConvs = me ? `chat:conversations:${me}` : null;
    const keyCurrent = me ? `chat:lastConversation:${me}` : null;
    const keyMessages = (c: string) =>
        me ? `chat:messages:${me}:${c}` : null;

    // 1️⃣ LOAD khi app mở
    useEffect(() => {
        if (!me || !keyConvs || !keyCurrent) return;

        const cachedConvs = safeParse(
            localStorage.getItem(keyConvs),
            []
        );
        if (cachedConvs.length) replaceConversations(cachedConvs);

        const lastConv = safeParse<string | null>(
            localStorage.getItem(keyCurrent),
            null
        );

        if (lastConv) {
            const cachedMsgs = safeParse(
                localStorage.getItem(keyMessages(lastConv)!),
                []
            );
            replaceMessages(cachedMsgs);
            selectConversation(lastConv, 1);
        }

        getConversationApi();
    }, [me]);

    // 2️⃣ SAVE conversations
    useEffect(() => {
        if (!me || !keyConvs) return;
        localStorage.setItem(keyConvs, JSON.stringify(conversations));
    }, [me, conversations]);

    // 3️⃣ SAVE current conversation
    useEffect(() => {
        if (!me || !keyCurrent || !currentConversation) return;
        localStorage.setItem(keyCurrent, JSON.stringify(currentConversation));
    }, [me, currentConversation]);

    // 4️⃣ SAVE messages
    useEffect(() => {
        if (!me || !currentConversation) return;

        const key = keyMessages(currentConversation);
        if (!key) return;

        localStorage.setItem(key, JSON.stringify(messages));
    }, [me, currentConversation, messages]);
}
