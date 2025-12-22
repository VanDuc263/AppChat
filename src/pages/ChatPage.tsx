import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import {MessageProvider, useMessage} from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";
import "../styles/ChatPage.css";
import Header from "../components/Header";
import "../styles/base.css";
import ConversationItem from "../components/conversations/ConversationItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {faIcons, faImage, faPaperPlane, faPlus, faCircle} from "@fortawesome/free-solid-svg-icons";
import {createRoomApi} from "../services/chatService";
import {uploadImageToCloudinary} from "../services/cloudinaryUpload";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";

interface Room {
    id: number;
    name: string;
    own: string;
    userList: any[];
    chatData: any[];
}

function ChatAppContent() {
    const {user} = useAuth();
    const [text, setText] = useState("");
    const {sendMessage, currentConversation, selectConversation, conversations} = useMessage();

    useMessageListener();

    /* ===== CREATE ROOM STATE ===== */
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomName, setRoomName] = useState("");

    /* ===== EMOJI PICKER ===== */
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiWrapRef = useRef<HTMLDivElement | null>(null);

    const IMAGE_PREFIX = "__IMG__:";
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    useEffect(() => {
        if (!showEmoji) return;

        const onClickOutside = (e: MouseEvent) => {
            if (!emojiWrapRef.current) return;
            if (!emojiWrapRef.current.contains(e.target as Node)) setShowEmoji(false);
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

    const handlePickImage = () => fileInputRef.current?.click();

    const closeUploadModal = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        setPendingFile(null);
        setShowUploadModal(false);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        if (!currentConversation) {
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            input.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Ảnh quá lớn (tối đa 10MB)");
            input.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        setPendingFile(file);
        setPreviewUrl(url);
        setShowUploadModal(true);

        input.value = "";
    };

    const confirmSendImage = async () => {
        if (!pendingFile) return;
        if (!currentConversation) {
            closeUploadModal();
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            return;
        }

        const file = pendingFile;
        closeUploadModal();

        setUploading(true);
        setUploadProgress(0);

        try {
            const url = await uploadImageToCloudinary(file, setUploadProgress);
            sendMessage(currentConversation, `${IMAGE_PREFIX}${url}`);
        } catch (err: any) {
            console.error(err);
            alert(err?.message || "Upload ảnh thất bại");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="app">
            <Header/>
            <div className="grid">
                <div className="container">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="sidebar__head">
                            <h2 className="sidebar__title">
                                Tin nhắn - <span>{user?.username}</span>
                            </h2>
                            <div className="sidebar__search">
                                <input className="sidebar__search-inp" type="text" placeholder="Tìm kiếm"/>
                                <div className="create-room-wrap">
                                    <button className="create-room-btn" onClick={() => setShowCreateRoom(true)}>
                                        <FontAwesomeIcon icon={faPlus}/>
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
                            <FontAwesomeIcon icon={faCircle} className="user-status"/>
                        </div>

                        <MessageList/>

                        <div className="content-bottom">
                            {/* Hidden file input for image upload */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageChange}
                            />

                            {/* Emoji picker popup */}
                            {showEmoji && (
                                <div ref={emojiWrapRef} className="emoji-picker-popup">
                                    <EmojiPicker onEmojiClick={handleEmojiClick}/>
                                </div>
                            )}

                            <div className="bottom-toolbar">
                                <div className="upload-toolbar">
                                    <FontAwesomeIcon
                                        className={`toolbar-icon ${uploading ? "toolbar-icon--disabled" : ""}`}
                                        icon={faImage}
                                        onClick={uploading ? undefined : handlePickImage}
                                        title="Gửi ảnh"
                                    />
                                    {uploading && (
                                        <span className="upload-progress">{Math.round(uploadProgress)}%</span>
                                    )}
                                </div>

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
                                    disabled={uploading}
                                >
                                    <FontAwesomeIcon className="send__mes-icon" icon={faPaperPlane}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showUploadModal && pendingFile && (
                <div className="modal-overlay">
                    <div className="modal upload-modal">
                        <h3>Gửi ảnh?</h3>

                        <div className="upload-preview">
                            <img src={previewUrl} alt="preview"/>
                        </div>

                        <div className="upload-file-name">{pendingFile.name}</div>

                        <div className="modal-actions">
                            <button onClick={closeUploadModal}>Hủy</button>
                            <button className="primary" onClick={confirmSendImage}>
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            <ChatAppContent/>
        </MessageProvider>
    );
}
