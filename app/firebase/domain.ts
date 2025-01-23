import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from ".";
import { DomainData } from "../types/card";

// domain = {domain-sid};
export const checkDomain = async (domain: string) => {
  const check = doc(firestore, `domains/${domain}`);
  const checkRef = await getDoc(check);
  if (checkRef?.exists()) {
    return {
      message: "Exists",
      data: checkRef?.data(),
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

export const assignOrUpdateDomain = async (
  domain: string,
  {
    ...data
  }: {
    staff_id: string;
    created_by: string;
    created_on: string;
    is_active: boolean;
    subscription?: {
      subscribed_on: string;
      valid_till: string;
    };
  }
) => {
  const ref = doc(firestore, `domains/${domain}`);

  await setDoc(ref, {
    ...data,
  });

  return await checkDomain(domain);
};

export const getDomainData = async (domain: string) => {
  const ref = doc(firestore, `domains/${domain}`);
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
