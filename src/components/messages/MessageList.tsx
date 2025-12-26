import {useMessage} from "../../contexts/MessageContext";
import {useAuth} from "../../contexts/AuthContext";
import "./MessageList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown,faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
import {useEffect, useRef} from "react";
const IMAGE_PREFIX = "__IMG__:";
const VIDEO_PREFIX = "__VID__:";
const FILE_PREFIX = "__FILE__:";
const STICKER_PREFIX = "__STK__:";

const stickerCtx = (require as any).context("../../assets/img/stickers", false, /\.png$/i);
const stickerSrc = (key: string) => {
    const k = key.startsWith("./") ? key : `./${key}`;
    try {
        return stickerCtx(k);
    } catch {
        return "";
    }
};

const isSticker = (t: string) => typeof t === "string" && t.startsWith(STICKER_PREFIX);

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
    if (typeof text === "string" && text.startsWith(STICKER_PREFIX)) {
        const key = text.slice(STICKER_PREFIX.length).trim();
        const src = stickerSrc(key);
        if (!src) return <>{text}</>;

        return <img src={src} alt="sticker" loading="lazy" className="sticker-img" />;
    }

    return <>{text}</>;
}

export default function MessageList() {
    const {messages,page,loadMessage,currentConversation,shouldAutoScroll} = useMessage();
    const {user} = useAuth();
    const mesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollBtnRef = useRef<HTMLDivElement|null>(null)
    const containerRef = useRef<HTMLDivElement|null>(null)
    const sortedMes = [...messages].sort((a, b) => a.id - b.id);
    const prevScrollHeightRef = useRef(0);


    const scrollToBottom = () => {
        mesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    const handleScroll = () => {
        const el = containerRef.current
        if(el.scrollTop === 0){
            prevScrollHeightRef.current = el.scrollHeight
            loadMessage(page)
        }
        el.scrollHeight - el.scrollTop < 1500 ? scrollBtnRef.current.style.display = 'none' : scrollBtnRef.current.style.display = 'flex'
       console.log(el.scrollHeight - el.scrollTop)
    }
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (shouldAutoScroll) {
            scrollToBottom();
        } else {
            const newScrollHeight = el.scrollHeight;
            const delta = newScrollHeight - prevScrollHeightRef.current;
            el.scrollTop += delta;
        }
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
        <div className="messages" ref={containerRef} onScroll={handleScroll}>
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
                        {(() => {
                            const segments: { type: "sticker" | "bubble"; items: string[] }[] = [];

                            group.messages.forEach((t: string) => {
                                if (isSticker(t)) {
                                    const last = segments[segments.length - 1];
                                    if (last?.type === "sticker") last.items.push(t);
                                    else segments.push({ type: "sticker", items: [t] });
                                } else {
                                    segments.push({ type: "bubble", items: [t] });
                                }
                            });

                            return segments.map((seg, si) =>
                                seg.type === "sticker" ? (
                                    <div key={`stk-${si}`} className="sticker-pack">
                                        {seg.items.map((t, i) => (
                                            <div key={i} className="sticker-cell">
                                                {renderMessageContent(t)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div key={`msg-${si}`} className="message-bubble">
                                        {renderMessageContent(seg.items[0])}
                                    </div>
                                )
                            );
                        })()}
                    </div>
                );
            })}
            <div onClick={scrollToBottom} ref={scrollBtnRef} className="messages--scroll-bottom">
                <FontAwesomeIcon className="scroll-bottom__icon" icon={faCircleChevronDown}/>

            </div>
            <div ref={mesEndRef}></div>
        </div>
    );
}
