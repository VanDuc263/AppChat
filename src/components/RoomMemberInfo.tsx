import { useState } from "react";
import { useMessage } from "../contexts/MessageContext";
import "../styles/RoomMemberInfo.css";

export default function RoomMemberInfo() {
    const { isRoom, totalMember, members,selectConversation } = useMessage();

    const [open, setOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    if (!isRoom) return null;

    const closePopup = () => {
        setSelectedMember(null);
    };

    return (
        <div className="room-member-box">
            {/* Header */}
            <div
                className="room-member-count"
                onClick={() => setOpen((prev) => !prev)}
            >
                {totalMember ?? 0} thành viên
                <span className={`arrow ${open ? "open" : ""}`}>▾</span>
            </div>

            {/* Member list */}
            {open && (
                <ul className="room-member-list">
                    {members?.length ? (
                        members.map((member) => (
                            <li
                                key={member.id}
                                className="room-member-item"
                                onClick={() => setSelectedMember(member)}
                            >
                                {member.name}
                            </li>
                        ))
                    ) : (
                        <li className="room-member-empty">
                            Chưa có thành viên
                        </li>
                    )}
                </ul>
            )}

            {/* ===== POPUP NHẮN TIN ===== */}
            {selectedMember && (
                <div
                    className="popup-overlay"
                    onClick={closePopup}
                >
                    <div
                        className="popup-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Nhắn tin riêng</h3>

                        <p>
                            Bạn muốn nhắn tin với:
                        </p>
                        <strong>{selectedMember.name}</strong>

                        <div className="popup-actions">
                            <button
                                onClick={() => {
                                    selectConversation(
                                        selectedMember.name,
                                        1
                                    );
                                    closePopup();
                                }}
                            >
                                Nhắn tin
                            </button>

                            <button
                                className="cancel"
                                onClick={closePopup}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
