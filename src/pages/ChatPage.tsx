import MessageList from "../components/messages/MessageList";
import {useMessageListener} from "../hooks/useMessageListener";
import { MessageProvider } from "../contexts/MessageContext";
import {useAuth} from "../contexts/AuthContext";

function ChatAppContent() {

    useMessageListener();
    const {logout} = useAuth()
    return (
        <div>
            <MessageList />
            <button onClick={() => logout()}>Logout</button>
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
