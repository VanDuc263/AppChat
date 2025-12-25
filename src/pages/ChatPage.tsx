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
import {faIcons, faImage, faPaperPlane, faPlus, faCircle,faVideo, faPaperclip, faFaceSmileBeam,faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {createRoomApi, joinRoomApi} from "../services/chatService";
import {uploadFileToCloudinary} from "../services/cloudinaryUpload";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import { useChatPersistence } from "../hooks/useChatPersistence";
import { useTheme } from "../contexts/ThemeContext";

import SearchButton from "../components/buttons/SearchButton";

interface Room {
    id: number;
    name: string;
    own: string;
    userList: any[];
    chatData: any[];
}

function ChatAppContent() {
    useChatPersistence();
    const {user} = useAuth();
    const [text, setText] = useState("");
    const {sendMessage, currentConversation, selectConversation, conversations} = useMessage();

    useMessageListener();

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef  = useRef<HTMLInputElement | null>(null);

    const handlePickImage = () => imageInputRef.current?.click();
    const handlePickVideo = () => videoInputRef.current?.click();
    const handlePickFile  = () => fileInputRef.current?.click();


    /*CREATE ROOM STATE*/
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomName, setRoomName] = useState("");

    /* JOIN ROOM STATE*/
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [joinRoomName, setJoinRoomName] = useState("");


    /* ===== EMOJI PICKER ===== */
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiWrapRef = useRef<HTMLDivElement | null>(null);

    /* ===== THEME DARK/LIGHT ===== */
    const { theme, toggleTheme } = useTheme();

    const IMAGE_PREFIX = "__IMG__:";
    const VIDEO_PREFIX = "__VID__:";
    const FILE_PREFIX  = "__FILE__:";
    const STICKER_PREFIX = "__STK__:";
    const RECENT_STICKER_KEY = "recent_stickers_v1";

    type PendingKind = "image" | "video" | "file";
    const getKind = (f: File): PendingKind => {
        if (f.type?.startsWith("image/")) return "image";
        if (f.type?.startsWith("video/")) return "video";
        return "file";
    };
    const [showSticker, setShowSticker] = useState(false);
    const stickerWrapRef = useRef<HTMLDivElement | null>(null);
    const [stickerTab, setStickerTab] = useState<"recent" | "all">("all");
    const stickerCtx = (require as any).context("../assets/img/stickers", false, /\.png$/i);
    const ALL_STICKER_KEYS: string[] = stickerCtx.keys().sort();

    const [recentStickerKeys, setRecentStickerKeys] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(RECENT_STICKER_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.filter((k) => ALL_STICKER_KEYS.includes(k)) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(RECENT_STICKER_KEY, JSON.stringify(recentStickerKeys));
        } catch {}
    }, [recentStickerKeys]);

    useEffect(() => {
        if (!showSticker) return;
        const onDown = (e: MouseEvent) => {
            if (!stickerWrapRef.current?.contains(e.target as Node)) setShowSticker(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [showSticker]);

    const handleStickerClick = (key: string) => {
        if (!currentConversation) return alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
        setRecentStickerKeys((p) => [key, ...p.filter((k) => k !== key)].slice(0, 24));
        sendMessage(currentConversation, `${STICKER_PREFIX}${key}`);
        setShowSticker(false);
    };

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
    const handleJoinRoom = () => {
        const roomNameInput = joinRoomName.trim();

        if (!roomNameInput) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        const found = conversations.find(
            (c) => c.name === roomNameInput
        );
        if (!found) {
            alert("Nhóm không tồn tại");
            return;
        }
        joinRoomApi(roomNameInput);
        selectConversation(roomNameInput, 1);
        setShowJoinRoom(false);
        setJoinRoomName("");
    }

    useEffect(() => {
        const handleCreateRoomSuccess = (e: any) => {
            const newRoom: Room = e.detail;
            console.log("CREATE_ROOM_SUCCESS:", newRoom);
        };

        window.addEventListener("CREATE_ROOM_SUCCESS", handleCreateRoomSuccess);
        return () => window.removeEventListener("CREATE_ROOM_SUCCESS", handleCreateRoomSuccess);
    }, []);

    useEffect(() => {
        const handleJoinRoomSuccess = (e: any) => {
            console.log("JOIN_ROOM_SUCCESS:", e.detail);
        };

        window.addEventListener("JOIN_ROOM_SUCCESS", handleJoinRoomSuccess);
        return () =>
            window.removeEventListener("JOIN_ROOM_SUCCESS", handleJoinRoomSuccess);
    }, []);

    const closeUploadModal = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        setPendingFile(null);
        setShowUploadModal(false);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        if (!currentConversation) {
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            input.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File quá lớn (tối đa 10MB)");
            input.value = "";
            return;
        }

        const kind = getKind(file);
        const url = (kind === "image" || kind === "video") ? URL.createObjectURL(file) : "";
        setPendingFile(file);
        setPreviewUrl(url);
        setShowUploadModal(true);

        input.value = "";
    };
    const confirmSendAttachment = async () => {
        if (!pendingFile) return;
        if (!currentConversation) {
            closeUploadModal();
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            return;
        }

        const file = pendingFile;
        const kind = getKind(file);
        closeUploadModal();

        setUploading(true);
        setUploadProgress(0);

        try {
            const url = await uploadFileToCloudinary(file, setUploadProgress);
            if (kind === "image") {
                sendMessage(currentConversation, `${IMAGE_PREFIX}${url}`);
            } else if (kind === "video") {
                sendMessage(currentConversation, `${VIDEO_PREFIX}${url}`);
            } else {
                sendMessage(currentConversation, `${FILE_PREFIX}${url}||${encodeURIComponent(file.name)}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(err?.message || "Upload thất bại");
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
                            <div className="sidebar__title-row">
                                <h2 className="sidebar__title">
                                    Tin nhắn - <span>{user?.username}</span>
                                </h2>

                                <FontAwesomeIcon
                                    icon={theme === "dark" ? faSun : faMoon}
                                    onClick={toggleTheme}
                                    className="theme-toggle-icon"
                                    title="Đổi giao diện"
                                />
                            </div>
                            <div className="sidebar__search">

                                {/*input search*/}
                                <SearchButton/>

                                <div className="room-action-row">
                                    <div
                                        className="room-action-item"
                                        onClick={() => setShowCreateRoom(true)}
                                    >
                                        <button className="create-room-btn">
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </button>
                                        <span className="create-room-text">Tạo nhóm</span>
                                    </div>

                                    <div
                                        className="room-action-item"
                                        onClick={() => setShowJoinRoom(true)}
                                    >
                                        <button className="create-room-btn">
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </button>
                                        <span className="create-room-text">Tham gia nhóm</span>
                                    </div>
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
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileChange}
                            />

                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={handleFileChange}
                            />

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                                hidden
                                onChange={handleFileChange}
                            />


                            {showEmoji && (
                                <div ref={emojiWrapRef} className="emoji-picker-popup">
                                    <EmojiPicker onEmojiClick={handleEmojiClick}/>
                                </div>
                            )}
                            {showSticker && (
                                <div ref={stickerWrapRef} className="sticker-picker-popup">
                                    <div className="sticker-tabs">
                                        <button
                                            type="button"
                                            className={`sticker-tab ${stickerTab === "recent" ? "active" : ""}`}
                                            onClick={() => setStickerTab("recent")}
                                        >
                                            Gần đây
                                        </button>
                                        <button
                                            type="button"
                                            className={`sticker-tab ${stickerTab === "all" ? "active" : ""}`}
                                            onClick={() => setStickerTab("all")}
                                        >
                                            Tất cả
                                        </button>
                                    </div>
                                    <div className="sticker-grid">
                                        {(stickerTab === "recent" ? recentStickerKeys : ALL_STICKER_KEYS).map((key) => {
                                            const src = stickerCtx(key);
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    className="sticker-item"
                                                    onClick={() => handleStickerClick(key)}
                                                    title={key.replace("./", "")}
                                                >
                                                    <img src={src} alt={key} />
                                                </button>
                                            );
                                        })}
                                        {stickerTab === "recent" && recentStickerKeys.length === 0 && (
                                            <div className="sticker-empty">Chưa có sticker gần đây</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bottom-toolbar">
                                <FontAwesomeIcon
                                    className={`toolbar-icon ${uploading ? "toolbar-icon--disabled" : ""}`}
                                    icon={faImage}
                                    onClick={uploading ? undefined : handlePickImage}
                                    title="Gửi ảnh"
                                />

                                <FontAwesomeIcon
                                    className="toolbar-icon"
                                    icon={faIcons}
                                    title="Sticker"
                                    onClick={() => {
                                        setShowSticker((v) => !v);
                                        setStickerTab("all");
                                        setShowEmoji(false);
                                    }}
                                />

                                <FontAwesomeIcon
                                    className={`toolbar-icon ${uploading ? "toolbar-icon--disabled" : ""}`}
                                    icon={faVideo}
                                    onClick={uploading ? undefined : handlePickVideo}
                                    title="Gửi video"
                                />

                                <FontAwesomeIcon
                                    className={`toolbar-icon ${uploading ? "toolbar-icon--disabled" : ""}`}
                                    icon={faPaperclip}
                                    onClick={uploading ? undefined : handlePickFile}
                                    title="Gửi file"
                                />

                                <FontAwesomeIcon
                                    className="toolbar-icon"
                                    icon={faFaceSmileBeam} onClick={() => setShowEmoji((v) => !v)}
                                    title="Emoji"
                                />
                                {uploading && (
                                    <span className="upload-progress">{Math.round(uploadProgress)}%</span>
                                )}
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
                                    disabled={uploading}>
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
                        <h3>Gửi tệp?</h3>

                        <div className="upload-preview">
                            {getKind(pendingFile) === "image" && previewUrl && (
                                <img src={previewUrl} alt="preview" />
                            )}

                            {getKind(pendingFile) === "video" && previewUrl && (
                                <video src={previewUrl} controls style={{ maxWidth: 320, width: "100%", borderRadius: 12 }} />
                            )}
                            {getKind(pendingFile) === "file" && (
                                <div style={{ padding: 12 }}>Không có preview cho file này.</div>
                            )}
                        </div>

                        <div className="upload-file-name">{pendingFile.name}</div>

                        <div className="modal-actions">
                            <button onClick={closeUploadModal}>Hủy</button>
                            <button className="primary" onClick={confirmSendAttachment}>
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showJoinRoom && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Tham gia phòng chat</h3>

                        <input
                            type="text"
                            placeholder="Nhập tên phòng..."
                            value={joinRoomName}
                            onChange={(e) => setJoinRoomName(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button onClick={() => setShowJoinRoom(false)}>
                                Hủy
                            </button>

                            <button
                                className="primary" onClick={handleJoinRoom}>
                                Tham gia
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
