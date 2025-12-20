import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import { MessageProvider } from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";
import "../styles/ChatPage.css"
import Header from "../components/Header";
import "../styles/base.css"
import ConversationItem from "../components/conversations/ConversationItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faIcons,faImage,faPaperPlane} from "@fortawesome/free-solid-svg-icons";


function ChatAppContent() {
    const {user} = useAuth()
    useMessageListener();
    return (
        <div>
            <div className="app">
                <Header />
                <div className="grid">

                    <div className="container">

                        <div className="sidebar">
                            <div className="sidebar__head">

                                <h2 className="sidebar__title">
                                    NLU Chat -
                                    <span className="">{user.username}</span>
                                </h2>
                                <div className="sidebar__search">
                                    <input className="sidebar__search-inp" type="text" placeholder="Tìm kiếm"/>
                                </div>
                            </div>
                            <div className="sidebar__bottom">
                                <div className="conversations">
                                    <ConversationItem/>
                                </div>
                            </div>
                        </div>
                        <div className="content">
                            <h1 className="content-head">VanDuc</h1>
                            <MessageList />
                            <div className="content-bottom">
                                <div className="bottom-toolbar">

                                    <FontAwesomeIcon className="toolbar-icon" icon={faIcons} />
                                    <FontAwesomeIcon className="toolbar-icon" icon={faImage} />
                                </div>
                                <div className="bottom__message">
                                    <input className="send-mes-inp" type="text" placeholder="Nhập tin nhắn"/>
                                    <button className="send-mes-btn">
                                        <FontAwesomeIcon className="send__mes-icon" icon={faPaperPlane} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
