import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export class FriendService {
    static async create(userA : string,userB : string){
        return addDoc(collection(db,"friends"),{
            users : [userA,userB],
            createdAt : serverTimestamp()
        })
    }
}