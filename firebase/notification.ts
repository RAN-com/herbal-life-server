import { getDoc, doc, setDoc } from "firebase/firestore";
import { firestore } from "./";
import moment from "moment";
import { CreateNotification, Notification } from "@/types/notification";
import { encryptData } from "../utils/crypto";
import { AppointmentData } from "@/types/staff";

export const sendNotification = async (
  uid: string,
  data?: CreateNotification & {
    metadata?: {
      appointment: AppointmentData;
      staffId: string;
      userId: string;
    };
  }
) => {
  const nDoc = doc(firestore, `notifications/${uid}`);
  try {
    const template = {
      ...data,
      read: false,
      timestamp: moment().toISOString(),
      id: encryptData(moment().format()),
    } as unknown as Notification;
    const docSnapshot = await getDoc(nDoc);
    let notifications: Notification[] = [];

    if (docSnapshot.exists()) {
      notifications = docSnapshot.data()?.notifications as Notification[];
    }

    notifications.push(template);

    await setDoc(nDoc, { notifications });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
