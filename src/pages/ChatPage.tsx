import MessageList from "../components/messages/MessageList";
import { useMessageListener } from "../hooks/useMessageListener";
import { MessageProvider, useMessage } from "../contexts/MessageContext";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ChatPage.css";
import Header from "../components/Header";
import "../styles/base.css";
import ConversationItem from "../components/conversations/ConversationItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { faIcons, faImage, faPaperPlane, faPlus, faCircle } from "@fortawesome/free-solid-svg-icons";
import { createRoomApi } from "../services/chatService";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Room {
    id: number;
    name: string;
    own: string;
    userList: any[];
    chatData: any[];
}

function ChatAppContent() {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const { sendMessage, currentConversation, selectConversation, conversations } = useMessage();

    useMessageListener();

    /* ===== CREATE ROOM STATE ===== */
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomName, setRoomName] = useState("");

    /* ===== EMOJI PICKER ===== */
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiWrapRef = useRef<HTMLDivElement | null>(null);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    useEffect(() => {
        if (!showEmoji) return;

        const onClickOutside = (e: MouseEvent) => {
            if (!emojiWrapRef.current) return;
            if (!emojiWrapRef.current.contains(e.target as Node)) {
                setShowEmoji(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [showEmoji]);

    const handleCreateRoom = () => {
        if (!roomName.trim()) {
            alert("Vui lòng nhập tên nhóm");
            return;
        }
        createRoomApi(roomName);
        setRoomName("");
        setShowCreateRoom(false);
    };

    useEffect(() => {
        const handleCreateRoomSuccess = (e: any) => {
            const newRoom: Room = e.detail;
            console.log("CREATE_ROOM_SUCCESS:", newRoom);
        };

        window.addEventListener("CREATE_ROOM_SUCCESS", handleCreateRoomSuccess);
        return () => window.removeEventListener("CREATE_ROOM_SUCCESS", handleCreateRoomSuccess);
    }, []);

    return (
        <div className="app">
            <Header />
            <div className="grid">
                <div className="container">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="sidebar__head">
                            <h2 className="sidebar__title">
                                Tin nhắn - <span>{user?.username}</span>
                            </h2>
                            <div className="sidebar__search">
                                <input className="sidebar__search-inp" type="text" placeholder="Tìm kiếm" />
                                <div className="create-room-wrap">
                                    <button className="create-room-btn" onClick={() => setShowCreateRoom(true)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <span className="create-room-text">Tạo nhóm</span>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar__bottom">
                            <div className="conversations">
                                {conversations.map((conversation) => (
                                    <ConversationItem
                                        key={conversation.name}
                                        onClick={() => selectConversation(conversation.name, 1)}
                                        name={conversation.name}
                                        actionTime={conversation.actionTime}
                                        type={conversation.type}
                                        isActive={currentConversation === conversation.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="content">
                        <div className="content-head">
                            <span>{currentConversation}</span>
                            <FontAwesomeIcon icon={faCircle} className="user-status" />
                        </div>

                        <MessageList />

                        <div className="content-bottom" style={{ position: "relative" }}>
                            {/* Emoji picker popup */}
                            {showEmoji && (
                                <div
                                    ref={emojiWrapRef}
                                    style={{
                                        position: "absolute",
                                        bottom: "65px",
                                        left: "10px",
                                        zIndex: 9999,
                                    }}
                                >
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}

                            <div className="bottom-toolbar">
                                <FontAwesomeIcon className="toolbar-icon" icon={faImage} />
                                <FontAwesomeIcon
                                    className="toolbar-icon"
                                    icon={faIcons}
                                    onClick={() => setShowEmoji((v) => !v)}
                                />
                            </div>

                            <div className="bottom__message">
                                <input
                                    className="send-mes-inp"
                                    type="text"
                                    value={text}
                                    placeholder="Nhập tin nhắn..."
                                    onChange={(e) => setText(e.target.value)}
                                />

                                <button
                                    onClick={() => {
                                        if (!text.trim()) return;

                                        if (!currentConversation) {
                                            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
                                            return;
                                        }

                                        sendMessage(currentConversation, text);
                                        setText("");
                                    }}
                                    className="send-mes-btn"
                                >
                                    <FontAwesomeIcon className="send__mes-icon" icon={faPaperPlane} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE ROOM MODAL */}
            {showCreateRoom && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Tạo nhóm chat</h3>
                        <input
                            type="text"
                            placeholder="Nhập tên nhóm..."
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button onClick={() => setShowCreateRoom(false)}>Hủy</button>
                            <button className="primary" onClick={handleCreateRoom}>
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() {
    return (
        <MessageProvider>
            <ChatAppContent />
        </MessageProvider>
    );
}
