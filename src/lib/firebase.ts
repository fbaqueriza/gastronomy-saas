import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDO1AsiIPZmWqsuix3tIBAb5J2-aVMamtY",
  authDomain: "gastroapp-8b236.firebaseapp.com",
  projectId: "gastroapp-8b236",
  storageBucket: "gastroapp-8b236.appspot.com",
  messagingSenderId: "936232032416",
  appId: "1:936232032416:web:c330e02117cca4efb351c5",
  measurementId: "G-G4EP1NL736"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 