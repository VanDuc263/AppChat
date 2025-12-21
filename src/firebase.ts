// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);


// Khởi tạo Storage với kiểu FirebaseStorage
export const storage: FirebaseStorage = getStorage(app);