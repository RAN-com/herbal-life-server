import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { CenterUser } from "@/types/user";
const firebaseConfig = {
  apiKey: "AIzaSyBb7HihkPwkG8vNgZh5oSsFAzev1ICnA2M",
  authDomain: "nutrition-7b61a.firebaseapp.com",
  projectId: "nutrition-7b61a",
  storageBucket: "nutrition-7b61a.firebasestorage.app",
  messagingSenderId: "913564196178",
  appId: "1:913564196178:web:a35adb9f64a0adf88eae8b",
  measurementId: "G-R19DG2ECGQ",
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
