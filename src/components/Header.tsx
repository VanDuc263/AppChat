import { useAuth } from "../contexts/AuthContext";
import {useState, useRef, useEffect} from "react";
import { useFriendRequests } from "../hooks/useFriendRequests";
import { acceptFriendRequest } from "../services/friendService";

import "../styles/header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCommentDots,
    faSignOutAlt,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    const { logout } = useAuth();
    const username = localStorage.getItem("username");
    const requests = useFriendRequests(username);

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const handleClickOutside = (ev : MouseEvent) => {
            if(dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)){
                setOpen(false)
            }
        }
        document.addEventListener("mousedown",handleClickOutside)
        return () => {
            document.removeEventListener("mousedown",handleClickOutside)
        }
    }, []);
    return (
        <div className="header">
            <div className="grid header-content">

                {/* LEFT */}
                <div className="header__left">
                    <FontAwesomeIcon icon={faCommentDots} className="logo-icon" />
                    <h1 className="header-title">
                        <span className="title-gradient">MESSAGING</span>
                    </h1>
                </div>

                {/* RIGHT */}
                <div className="header__right">

                    {/* 🔔 Notification */}
                    <div className="notify-wrapper" ref={dropdownRef}>
                        <button
                            className="icon-btn"
                            onClick={() => setOpen(!open)}
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            {requests.length > 0 && (
                                <span className="badge">{requests.length}</span>
                            )}
                        </button>

                        {open && (
                            <div className="dropdown">
                                {requests.length === 0 && (
                                    <p className="empty">Không có lời mời</p>
                                )}

                                {requests.map(req => (
                                    <div key={req.id} className="dropdown-item">
                                        <span className="username">{req.from}</span>

                                        <button
                                            className="accept-btn"
                                            onClick={() =>
                                                acceptFriendRequest(req.id, req.from, req.to)
                                            }
                                        >
                                            Chấp nhận
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* 🚪 Logout */}
                    <button className="header__logout-btn" onClick={logout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
