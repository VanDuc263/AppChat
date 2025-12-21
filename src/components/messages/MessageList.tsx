import {useMessage} from "../../contexts/MessageContext";
import {useAuth} from "../../contexts/AuthContext";
import "./MessageList.css";
import {useEffect, useRef} from "react";


export default function MessageList() {
    const {messages} = useMessage();
    const {user} = useAuth();

    const mesEndRef = useRef(null)

    const sortedMes = [...messages].sort((a,b) => a.id - b.id)



    const scrollToBottom = () => {
        mesEndRef.current?.scrollIntoView({behavior : "smooth"})
    }

    useEffect(() => scrollToBottom,[messages])

    const groupedMessages = [];
    sortedMes.forEach((msg) => {
        const lastGroup = groupedMessages[groupedMessages.length - 1];


        if (lastGroup && lastGroup.name === msg.name) {
            lastGroup.messages.push(msg.mes);
        } else {
            groupedMessages.push({
                id : msg.id,
                name: msg.name,
                messages: [msg.mes],
            });
        }
    });


    return (
        <div className="messages">
            {groupedMessages.map((group) => {
                const isMe = user?.username === group.name;


                return (
                    <div
                        key={group.id}
                        className={`message-group ${isMe ? "me" : "other"}`}
                    >
                        {!isMe && (
                            <div className="sender">{group.name}</div>
                        )}


                        {group.messages.map((text, index) => (
                            <div key={index} className="message-bubble">
                                {text}
                            </div>
                        ))}
                    </div>
                );
            })}

            <div ref={mesEndRef}></div>
        </div>
    );
}

