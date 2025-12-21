import {useAuth} from "../contexts/AuthContext";
import "../styles/header.css";
import "../styles/base.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCommentDots, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";


export default function Header() {
    const {logout} = useAuth();


    return (
        <div className="header">
            <div className="grid header-content">
                {/* Left: Logo + Title */}
                <div className="header__left">
                    <div className="header-logo">
                        <FontAwesomeIcon icon={faCommentDots} className="logo-icon"/>
                    </div>
                    <h1 className="header-title">
                        <span className="title-gradient">MESSAGING</span>
                    </h1>
                </div>


                {/* Right: Logout Button */}
                <div className="header__right">
                    <button
                        className="header__logout-btn"
                        onClick={() => logout()}
                        aria-label="Đăng xuất"
                        type="button"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="btn-icon"/>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

