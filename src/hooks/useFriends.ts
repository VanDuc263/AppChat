import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const useFriends = (username: string | null) => {
    const [friends, setFriends] = useState<string[]>([]);

    useEffect(() => {
        if (!username) return;

        const q = query(
            collection(db, "friends"),
            where("users", "array-contains", username)
        );

        const unsub = onSnapshot(q, snap => {
            setFriends(
                snap.docs.map(d => {
                    const users = d.data().users as string[];
                    return users.find(u => u !== username)!;
                })
            );
        });

        return () => unsub();
    }, [username]);

    return friends;
};
