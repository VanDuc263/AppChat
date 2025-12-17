import logo from "../../assets/img/logo_nlu.png";
import "../../styles/ConversationItem.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle} from "@fortawesome/free-solid-svg-icons";


interface ConversationItemProps {
    name?: string;
    status?: string;
    avatar?: string;
    isActive?: boolean;
    isUnread?: boolean;
    onClick?: () => void;
}

export default function ConversationItem({
                                             name = "VanDuc",
                                             status = "Hoạt động 3 phút trước",
                                             avatar = logo,
                                             isActive = false,
                                             isUnread = false,
                                             onClick
                                         }: ConversationItemProps) {
    const isOnline = status.includes("Hoạt động") || status.includes("online");


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
                    src={avatar}
                    alt={`Avatar của ${name}`}
                />
                {isOnline && <FontAwesomeIcon icon={faCircle} className="online-indicator"/>}
            </div>


            <div className="conversation-detail">
                <div className="conversation-name">{name}</div>
                <div className="conversation-status">
                    {isOnline && <FontAwesomeIcon icon={faCircle} className="status-dot"/>}
                    {status}
                </div>
            </div>


            {isUnread && <div className="unread-badge"></div>}
        </div>
    );
}

