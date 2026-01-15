import {doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs} from "firebase/firestore"
import { db } from "./firebase";
export class UserService {
    static async ensureUser(userId:string,username : string){
        const ref = doc(db,"users",userId)
        const snap = await getDoc(ref)

        if(!snap.exists()){
            await setDoc(ref,{
                username,
                createdAt: serverTimestamp()
            });
        }
    }
    static async findByUsername(username: string) {
        const q = query(
            collection(db, "users"),
            where("username", "==", username)
        );

        const snap = await getDocs(q);
        if (snap.empty) return null;

        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
}