import { useMessage } from "../../contexts/MessageContext";

export default function MessageList(){
    const {messages} = useMessage()
    return (
        <div>
            <h1>hi</h1>
            {
                messages.map(msg => (
                    <div key={msg.id}>
                        <b>{msg.to}:</b> {msg.mes}
                    </div>
                ))

            }
        </div>
    )
}