/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from ".";
import { StaffData } from "@/types/staff";
import { errorToast, successToast } from "@/utils/toast";
import { encryptData } from "@/utils/crypto";

export const getStaff = async (uid: string, sid: string) => {
  try {
    const staffQuery = doc(firestore, `users/${uid}/staffs/${sid}`);
    const staffDoc = await getDoc(staffQuery);
    if (staffDoc.exists()) {
      return {
        message: "Staff found",
        data: staffDoc.data() as StaffData,
        status: true,
      };
    } else {
      return {
        message: "Staff Not Found",
        data: null,
        status: false,
      };
    }
  } catch (_error) {
    return {
      message: "Staff Not Found",
      data: null,
      status: false,
    };
  }
};

export const getStaffs = async (uid: string) => {
  try {
    const staffQuery = collection(firestore, `users/${uid}/staffs`);
    const staffRef = await getDocs(staffQuery);

    if (staffRef.docs.length >= 1) {
      return {
        message: "Staffs Found",
        data: staffRef.docs.map((e) => e.data() as StaffData),
        status: true,
      };
    } else {
      return {
        message: "Staffs Not Found",
        data: [],
        status: false,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      message: "Staffs Not Found",
      data: [],
      status: false,
    };
  }
};

export const updateStaff = async (
  uid: string,
  sid: string,
  data: Partial<StaffData["data"]>
) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`);
    await updateDoc(staffDocRef, {
      data: data,
    });
    return {
      message: "Staff updated successfully",
      status: true,
    };
  } catch (error) {
    console.error("Error updating staff:", error);
    return {
      message: "Failed to update staff",
      status: false,
    };
  }
};

export const getTotalStaffs = async (uid: string) => {
  const customersRef = collection(firestore, `users/${uid}/staffs`);
  const allCustomersSnapshot = await getDocs(customersRef);
  const allCustomers = allCustomersSnapshot.docs.map(
    (doc) => doc.data() as StaffData
  );
  // Total staffs and pages
  return allCustomers.length;
};

export const addStaff = async (
  data: Partial<StaffData["data"]> & {
    available_limit: number;
  }
) => {
  try {
    const uid = encryptData(data.email as string);
    const totalStaffs = await getTotalStaffs(data.createdBy as string);
    if (totalStaffs >= data.available_limit) {
      errorToast("You have reached the limit of staffs");
      return { status: "error", error: "You have reached the limit of staffs" };
    }

    const docRef = doc(firestore, `users/${data.createdBy}/staffs/${uid}`);

    // Check if the staff already exists
    const staffDoc = await getDoc(docRef);
    if (staffDoc.exists()) {
      errorToast(`Staff with email ${data?.email} already exists.`);
      return { status: "exists", data: staffDoc.data() };
    }

    // Add the new staff data
    await setDoc(docRef, {
      data: {
        ...data,
        createdOn: new Date().toISOString(),
        sid: uid,
      },
      total_appointments_recorded: 0,
      total_customers_assigned: 0,
      total_visitors_assigned: 0,
      records: [],
    } as StaffData);

    successToast(`Staff added successfully`);
    return { status: "success", data: { ...data, sid: uid } };
  } catch (error) {
    console.error("Error adding staff:", error);
    return {
      message: "Failed to add staff",
      data: [],
      status: false,
    };
  }
};

export const deleteStaff = async (uid: string, sid: string) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`);
    await deleteDoc(staffDocRef);
    successToast("Staff deleted successfully");
    return {
      message: "Staff deleted successfully",
      status: true,
    };
  } catch (error) {
    console.error("Error deleting staff:", error);
    errorToast("Failed to delete staff");
    return {
      message: "Failed to delete staff",
      status: false,
    };
  }
};

export const updateStaffCount = async ({
  sid,
  type,
  uid,
}: {
  uid: string;
  sid: string;
  type: "customer" | "appointments" | "visitors";
}) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`);
    const data = (await getDoc(staffDocRef)).data() as StaffData;
    const d =
      type === "customer"
        ? {
            total_customers_assigned: data.total_customers_assigned + 1,
          }
        : type === "appointments"
        ? {
            total_appointments_recorded: data.total_appointments_recorded + 1,
          }
        : type === "visitors"
        ? {
            total_visitors_assigned: data.total_visitors_assigned + 1,
          }
        : {};
    await updateDoc(staffDocRef, {
      ...d,
    });

    return {
      message: "Staff updated successfully",
      status: true,
    };
  } catch (error) {
    console.error("Error updating staff:", error);
    return {
      message: "Failed to update staff",
      status: false,
    };
  }
};
