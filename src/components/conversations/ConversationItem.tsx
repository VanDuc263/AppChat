import groupAvatar from "../../assets/img/group-avatar.png";
import userAvatar from "../../assets/img/user-avatar.png";
import "../../styles/ConversationItem.css";


interface ConversationItemProps {
    name?: string;
    type : number;
    actionTime : string;
    status?: string;
    avatar?: string;
    isActive?: boolean;
    isUnread?: boolean;
    onClick?: () => void;
}


export default function ConversationItem({
                                             name = "VanDuc",
                                            type,
                                            actionTime,
                                             status = "Hoạt động 3 phút trước",
                                             isActive = false,
                                             isUnread = false,
                                             onClick
                                         }: ConversationItemProps) {
    const isOnline = status.includes("Hoạt động") || status.includes("online");
    const convertTime = (timeStr: string) => {
        if (!timeStr) return "";

        // "2025-12-21 08:37:20" → Date
        const time = new Date(timeStr.replace(" ", "T"));
        const now = new Date();

        const diffMs = now.getTime() - time.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return "Vừa xong";
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 4) return `${diffWeeks} tuần trước`;

        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} tháng trước`;

        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears} năm trước`;
    };

    return (
        <div
            className={`conversation__item ${isActive ? "active" : ""} ${isUnread ? "unread" : ""}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
            aria-label={`Cuộc trò chuyện với ${name}`}
        >
            <div className="conversation-avatar-wrapper">
                <img
                    className="conversation-img"
                    src={type === 0 ? userAvatar : groupAvatar}
                    alt={`Avatar của ${name}`}
                />
            </div>


            <div className="conversation-detail">
                <div className="conversation-name">{name}</div>
                <div className="conversation-status">
                    {convertTime(actionTime)}
                </div>
            </div>



            {isUnread && <div className="unread-badge"></div>}
        </div>
    );
}

