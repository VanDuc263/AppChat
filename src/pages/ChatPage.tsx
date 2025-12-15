import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import { MessageProvider } from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";
import "../styles/ChatPage.css"
import Header from "../components/Header";

function ChatAppContent() {

    useMessageListener();
    return (
        <div>
            <div className="app">
                <Header />
                <div className="container">

                    <div className="sidebar">

                    </div>
                    <div className="content">
                        <MessageList />
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
