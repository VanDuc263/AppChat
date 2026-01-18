import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import {useOnlineChecker} from "../hooks/useOnlineChecker";
import {MessageProvider, useMessage} from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";
import "../styles/ChatPage.css";
import Header from "../components/Header";
import "../styles/base.css";
import ConversationItem from "../components/conversations/ConversationItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {faIcons, faImage, faPaperPlane, faPlus, faCircle, faVideo, faPaperclip, faFaceSmileBeam, faMoon, faSun, faMicrophone, faStop} from "@fortawesome/free-solid-svg-icons";
import {createRoomApi, getConversationApi, joinRoomApi} from "../services/chatService";
import {uploadFileToCloudinary} from "../services/cloudinaryUpload";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import {useChatPersistence} from "../hooks/useChatPersistence";
import {useTheme} from "../contexts/ThemeContext";

import SearchButton from "../components/buttons/SearchButton";
import SocketOverlay from "../components/SocketOverlay";
import RoomMemberInfo from "../components/RoomMemberInfo";

interface Room {
    id: number;
    name: string;
    own: string;
    userList: any[];
    chatData: any[];
}

function ChatAppContent() {
    useChatPersistence();
    useMessageListener();
    useOnlineChecker();

    const {user} = useAuth();
    const {sendMessage, currentConversation, selectConversation, conversations,currentOnline,isRoom,totalMember,members} = useMessage();


    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handlePickImage = () => imageInputRef.current?.click();
    const handlePickVideo = () => videoInputRef.current?.click();
    const handlePickFile = () => fileInputRef.current?.click();


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
    const {theme, toggleTheme} = useTheme();

    const IMAGE_PREFIX = "__IMG__:";
    const VIDEO_PREFIX = "__VID__:";
    const FILE_PREFIX = "__FILE__:";
    const AUDIO_PREFIX = "__AUD__:";
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
    const username = localStorage.getItem("username")

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
        } catch {
        }
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
    const [text, setText] = useState("");
    const handleSendText = () => {
        if (!text.trim()) return;

        if (!currentConversation) {
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            return;
        }

        sendMessage(currentConversation, text);
        getConversationApi();
        setText("");
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
    // ===== AVATAR (READY FOR IMAGE UPLOAD) =====
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const handlePickAvatar = () => avatarInputRef.current?.click();

    const getAvatarKey = () => {
        const identity = user?.id ?? user?.username ?? localStorage.getItem("username") ?? "guest";
        return `user_avatar_url_v1:${identity}`;
    };
    const getAvatarByIdentity = (identity: string) => {
        try {
            return localStorage.getItem(`user_avatar_url_v1:${identity}`) || "";
        } catch {
            return "";
        }
    };

    const [avatarUrl, setAvatarUrl] = useState<string>("");

    useEffect(() => {
        try {
            const key = getAvatarKey();
            setAvatarUrl(localStorage.getItem(key) || "");
        } catch {
            setAvatarUrl("");
        }
    }, [user?.id, user?.username]);

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);

    const closeAvatarModal = () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
        setPendingAvatar(null);
        setShowAvatarModal(false);
        setAvatarUploading(false);
        setAvatarUploadProgress(0);
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        // Chỉ nhận ảnh
        if (!file.type?.startsWith("image/")) {
            alert("Vui lòng chọn đúng file hình ảnh.");
            input.value = "";
            return;
        }

        // Giới hạn dung lượng (tuỳ bạn chỉnh)
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh quá lớn (tối đa 5MB)");
            input.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        setPendingAvatar(file);
        setAvatarPreviewUrl(url);
        setShowAvatarModal(true);

        input.value = "";
    };

    const confirmUploadAvatar = async () => {
        if (!pendingAvatar) return;

        setAvatarUploading(true);
        setAvatarUploadProgress(0);

        try {
            const url = await uploadFileToCloudinary(pendingAvatar, setAvatarUploadProgress);

            setAvatarUrl(url);
            try {
                localStorage.setItem(getAvatarKey(), url);
            } catch {
            }

            closeAvatarModal();
        } catch (err: any) {
            console.error(err);
            alert(err?.message || "Upload avatar thất bại");
            setAvatarUploading(false);
            setAvatarUploadProgress(0);
        }
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

        joinRoomApi(roomNameInput);
        selectConversation(roomNameInput, 1);
        setShowJoinRoom(false);
        setJoinRoomName("");
    }

    useEffect(() => {
        const handleCreateRoomSuccess = (e: any) => {
            const newRoom: Room = e.detail;
            console.log("CREATE_ROOM_SUCCESS:", newRoom);
            getConversationApi();
            joinRoomApi(newRoom.name)
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
    // ===== VOICE (MIC) =====
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceSeconds, setVoiceSeconds] = useState(0);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [voicePreviewUrl, setVoicePreviewUrl] = useState<string>("");
    const [voiceUploading, setVoiceUploading] = useState(false);
    const [voiceUploadProgress, setVoiceUploadProgress] = useState(0);
    const [voiceError, setVoiceError] = useState<string>("");

    const voiceStreamRef = useRef<MediaStream | null>(null);
    const voiceRecorderRef = useRef<MediaRecorder | null>(null);
    const voiceChunksRef = useRef<BlobPart[]>([]);
    const voiceTimerRef = useRef<number | null>(null);
    const autoSendRef = useRef(false);

    const formatMMSS = (s: number) => {
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    };

    const pickVoiceMimeType = () => {
        const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
        if (typeof MediaRecorder === "undefined") return "";
        return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    };

    const resetVoiceState = () => {
        if (voiceTimerRef.current) {
            window.clearInterval(voiceTimerRef.current);
            voiceTimerRef.current = null;
        }
        voiceRecorderRef.current = null;
        voiceChunksRef.current = [];
        voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
        voiceStreamRef.current = null;

        if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
        setVoicePreviewUrl("");
        setVoiceBlob(null);
        setVoiceSeconds(0);
        setVoiceError("");
        setVoiceUploading(false);
        setVoiceUploadProgress(0);
        setIsRecording(false);
    };

    const startVoiceRecord = async () => {
        if (!currentConversation) {
            alert("Bạn hãy chọn 1 cuộc trò chuyện trước.");
            return;
        }
        if (voiceUploading || uploading) return;

        setShowVoiceModal(true);
        setVoiceError("");
        setVoiceBlob(null);
        if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
        setVoicePreviewUrl("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            voiceStreamRef.current = stream;

            const mimeType = pickVoiceMimeType();
            const recorder = new MediaRecorder(
                stream,
                mimeType
                    ? {mimeType, audioBitsPerSecond: 24000}
                    : {audioBitsPerSecond: 24000}
            );
            voiceRecorderRef.current = recorder;
            voiceChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) voiceChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(voiceChunksRef.current, {type: recorder.mimeType || "audio/webm"});

                if (autoSendRef.current) {
                    autoSendRef.current = false;

                    if (!currentConversation) {
                        setVoiceError("Chưa chọn cuộc trò chuyện.");
                        return;
                    }

                    if (blob.size < 1500) {
                        setVoiceError("Voice quá ngắn, hãy thử lại.");
                        setTimeout(() => closeVoiceModal(), 500);
                        return;
                    }

                    void (async () => {
                        try {
                            setVoiceUploading(true);
                            setVoiceUploadProgress(0);
                            setVoiceError("");

                            const ext = blob.type.includes("ogg") ? "ogg" : "webm";
                            const file = new File([blob], `voice_${Date.now()}.${ext}`, {type: blob.type || "audio/webm"});

                            const url = await uploadFileToCloudinary(file, setVoiceUploadProgress);
                            sendMessage(currentConversation, `${AUDIO_PREFIX}${url}`);

                            closeVoiceModal();
                        } catch (err: any) {
                            setVoiceError(err?.message || "Upload voice thất bại");
                            setVoiceUploading(false);
                        }
                    })();

                    return;
                }

                // chế độ preview + bấm Gửi (nếu bạn muốn giữ)
                setVoiceBlob(blob);
                const url = URL.createObjectURL(blob);
                setVoicePreviewUrl(url);
            };

            // BẮT ĐẦU GHI ÂM
            recorder.start();
            setIsRecording(true);
            setVoiceSeconds(0);

            voiceTimerRef.current = window.setInterval(() => {
                setVoiceSeconds((s) => s + 1);
            }, 1000);
        } catch (err: any) {
            setVoiceError(err?.message || "Không bật được micro. Hãy cấp quyền mic cho trình duyệt.");
            setIsRecording(false);
        }
    };

    const stopVoiceRecord = () => {
        if (!isRecording) return;

        if (voiceTimerRef.current) {
            window.clearInterval(voiceTimerRef.current);
            voiceTimerRef.current = null;
        }

        try {
            voiceRecorderRef.current?.stop();
        } catch {
        }

        setIsRecording(false);

        voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
        voiceStreamRef.current = null;
    };

    const stopAndSendVoice = () => {
        if (!isRecording) return;
        autoSendRef.current = true;
        stopVoiceRecord();
    };

    const closeVoiceModal = () => {
        if (isRecording) stopVoiceRecord();
        resetVoiceState();
        setShowVoiceModal(false);
    };

    const confirmSendVoice = async () => {
        if (!currentConversation) return;
        if (!voiceBlob) return;

        setVoiceUploading(true);
        setVoiceUploadProgress(0);
        setVoiceError("");

        try {
            const ext = voiceBlob.type.includes("ogg") ? "ogg" : "webm";
            const file = new File([voiceBlob], `voice_${Date.now()}.${ext}`, {type: voiceBlob.type || "audio/webm"});

            const url = await uploadFileToCloudinary(file, setVoiceUploadProgress);
            sendMessage(currentConversation, `${AUDIO_PREFIX}${url}`);

            closeVoiceModal();
        } catch (err: any) {
            setVoiceError(err?.message || "Upload voice thất bại");
            setVoiceUploading(false);
        }
    };

// cleanup khi unmount
    useEffect(() => {
        return () => {
            try {
                if (isRecording) stopVoiceRecord();
                resetVoiceState();
            } catch {
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!showUploadModal) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (!pendingFile) return;
                if (uploading) return;
                confirmSendAttachment();
            }
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                closeUploadModal();
            }
        };

        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [showUploadModal, pendingFile, uploading]);

    return (
        <div className="app">
            <Header/>
            <div className="grid">
                <div className="container">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="sidebar__head">
                            {/* Avatar upload input */}
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleAvatarChange}
                            />

                            <div className="sidebar__profile">
                                {/* Avatar circle */}
                                <button
                                    type="button"
                                    className="sidebar__avatar-btn"
                                    onClick={handlePickAvatar}
                                    title="Đổi ảnh đại diện"
                                    aria-label="Đổi ảnh đại diện"
                                >
                                    {avatarUrl ? (
                                        <img className="sidebar__avatar-img" src={avatarUrl} alt="avatar"/>
                                    ) : (
                                        <span className="sidebar__avatar-fallback">
                                      {(user?.username || "U").slice(0, 1).toUpperCase()}
                                    </span>
                                    )}

                                    <span className="sidebar__avatar-badge">
                                    <FontAwesomeIcon icon={faImage}/>
                                    </span>
                                </button>

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
                                {conversations
                                    .filter(c => c.name !== username)
                                    .map((conversation) => (
                                        <ConversationItem
                                            key={conversation.name}
                                            onClick={() => selectConversation(conversation.name, 1)}
                                            name={conversation.name}
                                            actionTime={conversation.actionTime}
                                            type={conversation.type}
                                            avatar={getAvatarByIdentity(conversation.name)}
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

                            {currentOnline && !isRoom &&  <FontAwesomeIcon icon={faCircle} className="user-status user-status--online"/>}
                            {!currentOnline && !isRoom &&  <FontAwesomeIcon icon={faCircle} className="user-status user-status--offline"/>}
                            <RoomMemberInfo/>
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
                                                    <img src={src} alt={key}/>
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
                                <FontAwesomeIcon
                                    className={`toolbar-icon ${((uploading || voiceUploading) && !isRecording) ? "toolbar-icon--disabled" : ""}`}
                                    icon={isRecording ? faStop : faMicrophone}
                                    onClick={() => {
                                        if (uploading || voiceUploading) return;
                                        if (isRecording) stopAndSendVoice();
                                        else startVoiceRecord();
                                    }}
                                    title={isRecording ? "Dừng ghi âm" : "Ghi âm"}
                                />
                                {uploading && (
                                    <span className="upload-progress">{Math.round(uploadProgress)}%</span>
                                )}
                                {voiceUploading && (
                                    <span className="upload-progress">Voice {Math.round(voiceUploadProgress)}%</span>
                                )}
                            </div>

                            <div className="bottom__message">
                                <input
                                    className="send-mes-inp"
                                    type="text"
                                    value={text}
                                    placeholder="Nhập tin nhắn..."
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (!uploading) handleSendText();
                                        }
                                    }}
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
                                <img src={previewUrl} alt="preview"/>
                            )}

                            {getKind(pendingFile) === "video" && previewUrl && (
                                <video src={previewUrl} controls
                                       style={{maxWidth: 320, width: "100%", borderRadius: 12}}/>
                            )}
                            {getKind(pendingFile) === "file" && (
                                <div style={{padding: 12}}>Không có preview cho file này.</div>
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
            {showAvatarModal && pendingAvatar && (
                <div className="modal-overlay">
                    <div className="modal upload-modal">
                        <h3>Cập nhật ảnh đại diện?</h3>

                        <div className="upload-preview">
                            {avatarPreviewUrl && (
                                <img src={avatarPreviewUrl} alt="avatar-preview"/>
                            )}
                        </div>

                        <div className="upload-file-name">{pendingAvatar.name}</div>

                        {avatarUploading && (
                            <span className="upload-progress">{Math.round(avatarUploadProgress)}%</span>
                        )}
                        {showVoiceModal && (
                            <div className="modal-overlay">
                                <div className="modal upload-modal">
                                    <h3>{isRecording ? "Đang ghi âm..." : (voiceBlob ? "Gửi ghi âm?" : "Ghi âm")}</h3>

                                    <div className="upload-preview" style={{padding: 12, width: "100%"}}>
                                        <div style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            textAlign: "center",
                                            marginBottom: 10
                                        }}>
                                            {formatMMSS(voiceSeconds)}
                                        </div>

                                        {!isRecording && voicePreviewUrl && (
                                            <audio controls preload="metadata" src={voicePreviewUrl}
                                                   style={{width: "100%"}}/>
                                        )}

                                        {voiceUploading && (
                                            <div style={{marginTop: 10, textAlign: "center"}}>
                                                Đang upload: {Math.round(voiceUploadProgress)}%
                                            </div>
                                        )}

                                        {voiceError && (
                                            <div style={{marginTop: 10, color: "red", textAlign: "center"}}>
                                                {voiceError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-actions">
                                        <button onClick={closeVoiceModal} disabled={voiceUploading}>Hủy</button>

                                        {isRecording ? (
                                            <button className="primary" onClick={stopAndSendVoice}
                                                    disabled={voiceUploading}>
                                                Dừng
                                            </button>
                                        ) : (
                                            <button className="primary" onClick={confirmSendVoice}
                                                    disabled={!voiceBlob || voiceUploading}>
                                                Gửi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button onClick={closeAvatarModal} disabled={avatarUploading}>
                                Hủy
                            </button>
                            <button className="primary" onClick={confirmUploadAvatar} disabled={avatarUploading}>
                                Lưu
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
            <SocketOverlay/>
            <ChatAppContent/>
        </MessageProvider>
    );
}
