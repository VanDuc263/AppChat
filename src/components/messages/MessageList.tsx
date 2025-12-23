import {useMessage} from "../../contexts/MessageContext";
import {useAuth} from "../../contexts/AuthContext";
import "./MessageList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

import {useEffect, useRef} from "react";

const IMAGE_PREFIX = "__IMG__:";
const VIDEO_PREFIX = "__VID__:";
const FILE_PREFIX = "__FILE__:";

function renderMessageContent(text: string) {
    if (typeof text === "string" && text.startsWith(IMAGE_PREFIX)) {
        const url = text.slice(IMAGE_PREFIX.length).trim();
        if (!url) return null;

        return (
            <img
                src={url}
                alt="uploaded"
                loading="lazy"
                style={{
                    maxWidth: 260,
                    width: "100%",
                    borderRadius: 12,
                    cursor: "pointer",
                }}
                onClick={() => window.open(url, "_blank")}
            />
        );
    }

    if (typeof text === "string" && text.startsWith(VIDEO_PREFIX)) {
        const url = text.slice(VIDEO_PREFIX.length).trim();
        if (!url) return null;

        return (
            <video
                src={url}
                controls
                preload="metadata"
                style={{maxWidth: 320, width: "100%", borderRadius: 12}}
            />
        );
    }

    if (typeof text === "string" && text.startsWith(FILE_PREFIX)) {
        const payload = text.slice(FILE_PREFIX.length).trim();
        const [url, encodedName] = payload.split("||");
        if (!url) return null;

        const name = encodedName ? decodeURIComponent(encodedName) : "Tải file";

        return (
            <a
                className="file-attach"
                href={url}
                download={name}
                target="_self"
                rel="noreferrer"
                title={name}
            >
    <span className="file-attach__icon">
      <FontAwesomeIcon icon={faFileArrowDown} />
    </span>
                <span className="file-attach__name">{name}</span>
            </a>
        );
    }

    return <>{text}</>;
}

export default function MessageList() {
    const {messages} = useMessage();
    const {user} = useAuth();
    const mesEndRef = useRef<HTMLDivElement | null>(null);
    const sortedMes = [...messages].sort((a, b) => a.id - b.id);
    const scrollToBottom = () => {
        mesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const groupedMessages: any[] = [];
    sortedMes.forEach((msg) => {
        const lastGroup = groupedMessages[groupedMessages.length - 1];

        if (lastGroup && lastGroup.name === msg.name) {
            lastGroup.messages.push(msg.mes);
        } else {
            groupedMessages.push({
                id: msg.id,
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

                        {group.messages.map((text: string, index: number) => (
                            <div key={index} className="message-bubble">
                                {renderMessageContent(text)}
                            </div>
                        ))}
                    </div>
                );
            })}

            <div ref={mesEndRef}></div>
        </div>
    );
}
