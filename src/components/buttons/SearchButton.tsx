import "../../styles/SearchButton.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons"
import {useEffect, useState} from "react";
import {useMessage} from "../../contexts/MessageContext";
import {useCheckUserExist} from "../../hooks/useCheckUserExist";
import {isFriend, sendFriendRequest} from "../../services/friendService";

export default function SearchButton(){
    const [text,setText] = useState("")
    const {searchState,selectConversation,searchUser,resetSearch} = useMessage()
    const [isFriendState, setIsFriendState] = useState(false);

    const me = localStorage.getItem("username");

    useEffect(() => {
        if (!me) return;
        if (!searchState.result) return;

        isFriend(me, text).then(res => {
            setIsFriendState(res);
        });
    }, [searchState.result, text, me]);
    useCheckUserExist()
    return (
        <div>

            <div className="sidebar__search-head">
                <button onClick={() => searchUser(text)}  className="sidebar__search-btn">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
                <input
                    className="sidebar__search-inp"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => resetSearch()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (!text.trim()) return;
                            searchUser(text);
                        }
                    }}
                    placeholder="Tìm kiếm"
                />

            </div>
            {searchState.loadding && <p className="search-result search-result-error">Đang tìm kiếm...</p>}
            {searchState.result === false && !searchState.loadding && <p className="search-result search-result--error">
                User <span className="search-result-usname"> {text} </span> không tồn tại</p>}
            {searchState.result === true && !searchState.loadding &&
                (
                    <div className="search-actions">
                            {!isFriendState ? (
                                <button onClick={() => sendFriendRequest(me!, text)}>
                                    Kết bạn
                                </button>
                            ) : (
                                <button disabled className="btn-disabled">
                                    Đã là bạn
                                </button>
                            )}

                            <button onClick={() => selectConversation(text, 1)}>
                                Nhắn tin
                            </button>

                    </div>
                )

            }
        </div>
    )
}