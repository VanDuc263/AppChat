import logo from "../../assets/img/logo_nlu.png";
import "../../styles/ConversationItem.css"

export default function ConversationItem(){
    return (
        <div>
            <div className="conversation__item">
                <img className="conversation-img" src={logo} alt=""/>
                <div className="conversation-detail">
                    <span className="conversation-name">VanDuc</span>
                    <span className="conversation-status">Hoạt động 3 phút trước</span>
                </div>
            </div>
        </div>
    )
}