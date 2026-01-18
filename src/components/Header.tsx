import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useFriendRequests } from "../hooks/useFriendRequests";
import { useFriends } from "../hooks/useFriends";
import { acceptFriendRequest } from "../services/friendService";

import "../styles/header.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCommentDots,
    faSignOutAlt,
    faUserPlus,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    const { logout } = useAuth();
    const username = localStorage.getItem("username");

    const requests = useFriendRequests(username);
    const friends = useFriends(username);

    const [openRequests, setOpenRequests] = useState(false);
    const [openFriends, setOpenFriends] = useState(false);

    const requestRef = useRef<HTMLDivElement | null>(null);
    const friendsRef = useRef<HTMLDivElement | null>(null);

    // đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (ev: MouseEvent) => {
            if (
                requestRef.current &&
                !requestRef.current.contains(ev.target as Node)
            ) {
                setOpenRequests(false);
            }

            if (
                friendsRef.current &&
                !friendsRef.current.contains(ev.target as Node)
            ) {
                setOpenFriends(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="header">
            <div className="grid header-content">
                {/* LEFT */}
                <div className="header__left">
                    <FontAwesomeIcon
                        icon={faCommentDots}
                        className="logo-icon"
                    />
                    <h1 className="header-title">
                        <span className="title-gradient">MESSAGING</span>
                    </h1>
                </div>

                {/* RIGHT */}
                <div className="header__right">
                    {/* 🔔 Friend Requests */}
                    <div className="notify-wrapper" ref={requestRef}>
                        <button
                            className="icon-btn"
                            onClick={() =>
                                setOpenRequests(prev => !prev)
                            }
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            {requests.length > 0 && (
                                <span className="badge">
                                    {requests.length}
                                </span>
                            )}
                        </button>

                        {openRequests && (
                            <div className="dropdown">
                                {requests.length === 0 && (
                                    <p className="empty">
                                        Không có lời mời
                                    </p>
                                )}

                                {requests.map(req => (
                                    <div
                                        key={req.id}
                                        className="dropdown-item"
                                    >
                                        <span className="username">
                                            {req.from}
                                        </span>

                                        <button
                                            className="accept-btn"
                                            onClick={() =>
                                                acceptFriendRequest(
                                                    req.id,
                                                    req.from,
                                                    req.to
                                                )
                                            }
                                        >
                                            Chấp nhận
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 👥 Friends */}
                    <div className="notify-wrapper" ref={friendsRef}>
                        <button
                            className="icon-btn"
                            onClick={() =>
                                setOpenFriends(prev => !prev)
                            }
                        >
                            <FontAwesomeIcon icon={faUsers} />
                            {friends.length > 0 && (
                                <span className="badge">
                                    {friends.length}
                                </span>
                            )}
                        </button>

                        {openFriends && (
                            <div className="dropdown">
                                {friends.length === 0 && (
                                    <p className="empty">
                                        Chưa có bạn bè
                                    </p>
                                )}

                                {friends.map(friend => (
                                    <div
                                        key={friend}
                                        className="dropdown-item"
                                    >
                                        <span className="username">
                                            {friend}
                                        </span>

                                        <button className="accept-btn">
                                            Nhắn tin
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 🚪 Logout */}
                    <button
                        className="header__logout-btn"
                        onClick={logout}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
