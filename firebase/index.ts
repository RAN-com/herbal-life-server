import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyByZiOViUC-liviVAS7voVGrKf0L-UWvWM",
  authDomain: "ran-c741a.firebaseapp.com",
  projectId: "ran-c741a",
  storageBucket: "ran-c741a.firebasestorage.app",
  messagingSenderId: "304589233534",
  appId: "1:304589233534:web:a549ce5671e7cb7119e72f",
  measurementId: "G-0EP9TQWS2L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
