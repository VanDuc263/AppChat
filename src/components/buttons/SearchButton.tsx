import "../../styles/SearchButton.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useMessage } from "../../contexts/MessageContext";
import { FriendRequestService } from "../../services/firebase/friend-request.service";
import { useAuth } from "../../contexts/AuthContext";

export default function SearchButton() {
    const [text, setText] = useState("");
    const { user } = useAuth();
    const { searchState, searchUser, resetSearch, foundUser } = useMessage();

    const sendFriendRequest = async () => {
        if (!user || !foundUser) return;

        await FriendRequestService.send(user.id, foundUser.id);
        alert("✅ Đã gửi lời mời kết bạn");
        resetSearch();
        setText("");
    };

    return (
        <div>
            <div className="sidebar__search-head">
                <button
                    onClick={() => text.trim() && searchUser(text)}
                    className="sidebar__search-btn"
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>

                <input
                    className="sidebar__search-inp"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={resetSearch}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && text.trim()) {
                            searchUser(text);
                        }
                    }}
                    placeholder="Tìm kiếm"
                />
            </div>

            {searchState.loadding && (
                <p className="search-result">Đang tìm kiếm...</p>
            )}

            {!searchState.loadding && searchState.result === false && (
                <p className="search-result search-result--error">
                    User <b>{text}</b> không tồn tại
                </p>
            )}

            {!searchState.loadding && searchState.result === true && foundUser && (
                <button
                    className="search-result"
                    onClick={sendFriendRequest}
                >
                    ➕ Gửi lời mời kết bạn cho <b>{foundUser.username}</b>
                </button>
            )}
        </div>
    );
}
