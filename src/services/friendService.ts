import {
    addDoc,
    getDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Gửi lời mời kết bạn
 */
export const sendFriendRequest = async (from: string, to: string) => {
    if (from === to) return;

    //  tránh gửi trùng
    const q = query(
        collection(db, "friend_requests"),
        where("from", "==", from),
        where("to", "==", to),
        where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    if (!snap.empty) return;

    return addDoc(collection(db, "friend_requests"), {
        from,
        to,
        status: "pending",
        createdAt: serverTimestamp(),
    });
};

/**
 * Chấp nhận kết bạn
 */
export const acceptFriendRequest = async (
    requestId: string,
    userA: string,
    userB: string
) => {
    // 1. update trạng thái request
    await updateDoc(doc(db, "friend_requests", requestId), {
        status: "accepted",
    });

    // 2. tạo bản ghi bạn bè
    const friendId = [userA, userB].sort().join("_");

    await setDoc(doc(db, "friends", friendId), {
        users: [userA, userB],
        createdAt: serverTimestamp(),
    });
};
export const checkIsFriend = async (me: string, other: string) => {
    const id = [me, other].sort().join("_");
    const snap = await getDoc(doc(db, "friends", id));
    return snap.exists();
};
export const getIncomingFriendRequests = async (username: string) => {
    const q = query(
        collection(db, "friend_requests"),
        where("to", "==", username),
        where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const getFriends = async (me: string) => {
    const q = query(
        collection(db, "friends"),
        where("users", "array-contains", me)
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => {
        const data = d.data();
        const users = data.users as string[];

        return {
            friend: users.find(u => u !== me)!, // tên bạn
        };
    });
};
export const isFriend = async (me: string, other: string) => {
    const friendId = [me, other].sort().join("_");
    const snap = await getDoc(doc(db, "friends", friendId));
    return snap.exists();
};