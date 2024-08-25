import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDLilx3kNDIW3xz3Drp-ZgK_lmm3PxeI6Q",
    authDomain: "legalappa.firebaseapp.com",
    projectId: "legalappa",
    storageBucket: "legalappa.appspot.com",
    messagingSenderId: "109624076922",
    appId: "1:109624076922:web:92ef35d01c1fb50280e9c3",
    measurementId: "G-E23L29X5JD"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage}