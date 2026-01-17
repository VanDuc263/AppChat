import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export interface FriendRequest {
    id: string;
    from: string;
    to: string;
}

export const useFriendRequests = (username: string | null) => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        if (!username) return;

        const q = query(
            collection(db, "friend_requests"),
            where("to", "==", username),
            where("status", "==", "pending")
        );

        const unsub = onSnapshot(q, snap => {
            setRequests(
                snap.docs.map(d => ({
                    id: d.id,
                    ...(d.data() as Omit<FriendRequest, "id">),
                }))
            );
        });

        return () => unsub();
    }, [username]);

    return requests;
};
