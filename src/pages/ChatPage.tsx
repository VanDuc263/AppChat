import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import {MessageProvider} from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";
import "../styles/ChatPage.css";
import Header from "../components/Header";
import "../styles/base.css";
import ConversationItem from "../components/conversations/ConversationItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {faIcons, faImage, faPaperPlane,faPlus} from "@fortawesome/free-solid-svg-icons";
import { createRoomApi } from "../services/chatService";

function ChatAppContent() {
    const {user} = useAuth();
    useMessageListener();
    /* ===== CREATE ROOM STATE ===== */
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomName, setRoomName] = useState("");

    const handleCreateRoom = () => {
        if (!roomName.trim()) {
            alert("Vui lòng nhập tên nhóm");
            return;
        }
        createRoomApi(roomName);
        setRoomName("");
        setShowCreateRoom(false);
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
                                <input
                                    className="sidebar__search-inp"
                                    type="text"
                                    placeholder="Tìm kiếm"
                                />
                                <div className="create-room-wrap">
                                    <button
                                        className="create-room-btn"
                                        onClick={() => setShowCreateRoom(true)}
                                    >
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </button>
                                    <span className="create-room-text">Tạo nhóm</span>
                                </div>
                            </div>
                        </div>
                        <div className="sidebar__bottom">
                            <div className="conversations">
                                <ConversationItem name="VanDuc" isActive={true}/>
                                {/* Thêm các item khác ở đây */}
                            </div>
                        </div>
                    </div>


                    {/* Content Area */}
                    <div className="content">
                        <div className="content-head">VanDuc</div>


                        <MessageList/>


                        <div className="content-bottom">
                            <div className="bottom-toolbar">
                                <FontAwesomeIcon className="toolbar-icon" icon={faImage}/>
                                <FontAwesomeIcon className="toolbar-icon" icon={faIcons}/>
                            </div>
                            <div className="bottom__message">
                                <input
                                    className="send-mes-inp"
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                />
                                <button className="send-mes-btn">
                                    <FontAwesomeIcon className="send__mes-icon" icon={faPaperPlane}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ========== CREATE ROOM MODAL ========== */}
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
                            <button onClick={() => setShowCreateRoom(false)}>
                                Hủy
                            </button>
                            <button
                                className="primary"
                                onClick={handleCreateRoom}
                            >
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

