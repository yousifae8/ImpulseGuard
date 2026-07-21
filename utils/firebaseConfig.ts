import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GOOGLE_API_KEY, GOOGLE_AUTH_DOMAIN, GOOGLE_PROJECT_ID, GOOGLE_STORAGE_BUCKET, GOOGLE_MESSAGING_SENDER_ID, GOOGLE_APP_ID, GOOGLE_MEASUREMENT_ID } from "@env";


const firebaseConfig = {
    apiKey: GOOGLE_API_KEY,
    authDomain: GOOGLE_AUTH_DOMAIN,
    projectId: GOOGLE_PROJECT_ID,
    storageBucket: GOOGLE_STORAGE_BUCKET,
    messagingSenderId: GOOGLE_MESSAGING_SENDER_ID,
    appId: GOOGLE_APP_ID,
    measurementId: GOOGLE_MEASUREMENT_ID 
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)
