import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { firestore } from ".";
import { DomainData } from "../types/card";

// domain = {domain-sid};
export const checkDomain = async (domain: string) => {
  const check = doc(firestore, `domains/${domain}`);
  const checkRef = await getDoc(check);
  console.log(checkRef?.data(), checkRef?.exists(), domain);
  if (checkRef?.exists()) {
    return {
      message: "Exists",
      data: checkRef?.data() as DomainData,
      status: true,
    };
  } else {
    return {
      message: "Not Exists",
      data: null,
      status: false,
    };
  }
};

export const getDomainData = async (domain: string) => {
  const url = `domains/${domain}`;
  const ref = doc(firestore, url);
  const docRef = await getDoc(ref);

  if (docRef?.exists()) {
    return {
      message: "Exists",
      data: docRef?.data() as DomainData,
      status: true,
    };
  } else {
    return {
      message: "Not Exists",
      data: null,
      status: false,
    };
  }
};

export const updateWebViews = async (domain: string) => {
  const url = `domains/${domain}`;
  const ref = doc(firestore, url);
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  try {
    const docRef = await getDoc(ref);

    if (docRef.exists()) {
      // ✅ Increment views field
      await updateDoc(ref, {
        views: increment(1),
      });
    }
  } catch (error) {
    console.error("Error updating web views:", error);
  }
};
