import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY 
      || process.env.REACT_APP_FIREBASE_apiKey 
      || process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN 
      || process.env.REACT_APP_FIREBASE_authDomain 
      || process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID 
      || process.env.REACT_APP_FIREBASE_projectId 
      || process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET 
      || process.env.REACT_APP_FIREBASE_storageBucket 
      || process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID 
      || process.env.REACT_APP_FIREBASE_messagingSenderId 
      || process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_FIREBASE_APP_ID 
      || process.env.REACT_APP_FIREBASE_appId 
      || process.env.REACT_APP_appId,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID 
      || process.env.REACT_APP_FIREBASE_measurementId 
      || process.env.REACT_APP_measurementId
  };

// Validate Firebase config
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.error('❌ Firebase API Key is missing!');
  console.error('Please check your .env file and ensure REACT_APP_FIREBASE_API_KEY is set.');
  console.error('See FIREBASE_SETUP_GUIDE.md for instructions.');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, auth, analytics }