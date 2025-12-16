import {useAuth} from "../contexts/AuthContext";
import "../styles/header.css"
import "../styles/base.css"

export default function Header(){
    const {logout} = useAuth()
    return (
        <div>
            <div className="header">
                <div className="grid header-content">
                        <div className="header__left">
                            <span className="header-left__title">
                                MESSAGING
                            </span>
                        </div>
                        <div className="header__right">
                            <button className="header__logout-btn" onClick={() => logout()}>Logout</button>
                    </div>
                </div>

            </div>

        </div>
    )
}