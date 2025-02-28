import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaElCmygA7RKHdn9xyx5bezzso_1xsVA8",
  authDomain: "ran-dev-6f346.firebaseapp.com",
  projectId: "ran-dev-6f346",
  storageBucket: "ran-dev-6f346.firebasestorage.app",
  messagingSenderId: "161059016152",
  appId: "1:161059016152:web:de8f684ab5cf8a28a936ad",
  measurementId: "G-TGH27VE51H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
