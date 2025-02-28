import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from ".";
import { CardCreateData, CardData } from "@/types/card";
import { errorToast, successToast } from "@/utils/toast";
import moment from "moment";

export const getCardDetail = async (sid: string) => {
  const cardQuery = doc(firestore, `cards/${sid}`);
  const cardRef = await getDoc(cardQuery);
  if (cardRef.exists()) {
    return {
      status: true,
      message: "Details Found",
      data: cardRef.data() as CardData,
    };
  }

  return {
    status: false,
    message: "Detials Not Found",
    data: null,
  };
};

export const addOrUpdateCardDetails = async (
  sid: string,
  data: CardCreateData
) => {
  const cardQuery = doc(firestore, `cards/${sid}`);
  const cardRef = await getDoc(cardQuery);

  if (cardRef.exists()) {
    errorToast("Card Already Exists. Updating the card now");
    await updateDoc(cardQuery, {
      ...data,
      aid: sid,
      updatedOn: moment().format("DD-MM-YYYY"),
      createdFor: sid,
    });
    return {
      message: "Card Data Updated",
      status: true,
      data: cardRef.data(),
    };
  } else {
    await setDoc(cardQuery, {
      ...data,
      aid: sid,
      createdFor: sid,
      createdOn: moment().format("DD-MM-YYYY"),
    });

    successToast("Updated Successfully");
    const getData = await getDoc(cardQuery);
    return {
      message: "Card Details Added",
      status: true,
      data: getData.data(),
    };
  }
};

export const updateCardStatus = async (sid: string, canShow: boolean) => {
  const cardQuery = doc(firestore, `cards/${sid}`);
  const cardRef = await getDoc(cardQuery);

  if (!cardRef?.exists()) {
    return {
      message: "Create Card First and try again",
      status: false,
      data: null,
    };
  }

  await updateDoc(cardQuery, {
    status: canShow,
  });

  return {
    message: "Card Status Updated Successfully",
    data: cardRef?.data(),
    status: true,
  };
};

export const updateCardValidity = async (sid: string, valid_till: string) => {
  const cardQuery = doc(firestore, `cards/${sid}`);
  const cardRef = await getDoc(cardQuery);

  if (!cardRef?.exists()) {
    return {
      message: "Create Card First and try again",
      status: false,
      data: null,
    };
  }

  await updateDoc(cardQuery, {
    subscription: {
      valid_till,
    },
  });

  return {
    data: cardRef?.data(),
    message: "Card validity updated",
    status: true,
  };
};
