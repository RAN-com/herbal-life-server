import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { CenterUser } from "@/types/user";
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

export const getUserDocument = async (uid: string) => {
  const docRef = doc(firestore, `users/${uid}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap?.exists()) {
    return { error: true, message: "User Document Not Found" };
  }

  const data = docSnap?.data() as unknown as CenterUser;

  if (data) {
    return { error: false, message: "User Found", data };
  }
  return { error: true, message: "Not Found" };
};
