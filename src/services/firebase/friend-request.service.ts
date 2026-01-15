import {
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

export class FriendRequestService{
    static async send(fromUserId : string,toUserId : string){
        return addDoc(collection(db,"friend_requests"),{
            fromUserId,toUserId,
            status : "pending",
            createdAt : serverTimestamp()
        })
    }
    static async getIncoming(userId : string){
        const q = query(
            collection(db,"friend_requests"),
            where("toUserId","==",userId),
            where("status","==","pending")
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => ({id:d.id, ...d.data()}))
    }
    static async accept(requestId : string){
        return updateDoc(doc(db,"friend_requests",requestId),{
            status : "accepted"
        })
    }
}