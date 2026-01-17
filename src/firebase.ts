// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC9-gyrM8IDoDEyATjD2us7ijarT2EnLWM",
    authDomain: "app-chat-439a5.firebaseapp.com",
    projectId: "app-chat-439a5",
    storageBucket: "app-chat-439a5.firebasestorage.app",
    messagingSenderId: "812040403890",
    appId: "1:812040403890:web:8091bf26cb62e85ccdc2ab",
    measurementId: "G-ZXQJ9RG885"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// (Analytics chỉ chạy production, để cũng được)
const analytics = getAnalytics(app);

// ✅ FIRESTORE (BẮT BUỘC CHO KẾT BẠN)
export const db: Firestore = getFirestore(app);

// ✅ STORAGE (upload file, avatar…)
export const storage: FirebaseStorage = getStorage(app);
