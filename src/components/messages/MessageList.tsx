import { useMessage } from "../../contexts/MessageContext";
import { useAuth } from "../../contexts/AuthContext";

export default function MessageList() {
    const { messages } = useMessage();
    const { user } = useAuth();

    return (
        <div>
            <h1>hi</h1>

            {messages.map((msg) => {
                const isMe = user?.username === msg.name;

                return (
                    <div
                        key={msg.id}
                        style={{
                            textAlign: isMe ? "right" : "left",
                            marginBottom: "8px",
                        }}
                    >
                        <b>{isMe ? "Bạn" : msg.name}:</b> {msg.mes}
                    </div>
                );
            })}
        </div>
    );
}
