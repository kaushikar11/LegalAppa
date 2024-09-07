import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAlBXsU8bHHU4cXCOgzL21VWdqdupUIR0I",
    authDomain: "legalappa-248f2.firebaseapp.com",
    projectId: "legalappa-248f2",
    storageBucket: "legalappa-248f2.appspot.com",
    messagingSenderId: "84485672725",
    appId: "1:84485672725:web:42ac5f6178d1e41276a31c",
    measurementId: "G-NLG7RBKP2F"
  };
  


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage, auth}