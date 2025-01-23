import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from ".";
import { getStaff, updateStaff } from "./staffs";
import { AppointmentData, StaffData } from "@/app/types/staff";
import { errorToast } from "@/app/utils/toast";

export const checkSubdomain = async (uid: string, domain: string) => {
  const appRef = doc(firestore, `users/${uid}/appointments/${domain}`);
  const docRef = await getDoc(appRef);

  if (docRef.exists()) {
    return {
      message: "Domain already Exists",
      status: true,
    };
  } else {
    return {
      message: "",
      status: false,
    };
  }
};

export const appendSubdomainToRecord = async (
  uid: string,
  domain: string,
  staff: StaffData["data"]
) => {
  const appRef = doc(firestore, `users/${uid}/appointments/${domain}`);
  const docRef = await getDoc(appRef);

  if (docRef.exists()) {
    return {
      message: "Doamin already Exists",
      status: false,
    };
  } else {
    await setDoc(appRef, {
      assigned_domain: domain,
      assigned_for: {
        name: staff.name,
        email: staff.email,
        id: staff.sid,
      },
      assignedOn: new Date().toISOString(),
      assignedBy: uid,
    });
    return {
      message: "Domain Assigned Successfully",
      status: true,
    };
  }
};

export const setSubDomainToStaff = async (
  staff: StaffData["data"],
  domain: string
) => {
  const check = await checkSubdomain(staff?.createdBy, domain);
  if (check.status) {
    await appendSubdomainToRecord(staff.createdBy, domain, staff);
    await updateStaff(staff.createdBy, staff.sid, {
      ...staff,
      assigned_subdomain: domain,
    });
  } else {
    errorToast(check.message);
  }
};

export const getAllAppointments = async (uid: string, domain: string) => {
  const appRef = doc(firestore, `users/${uid}/appointments/${domain}`);
  const docRef = await getDoc(appRef);

  if (!docRef.exists()) {
    return {
      message: "No Data Found",
      data: null,
      status: false,
    };
  }

  const data = docRef.data()?.data as AppointmentData[];

  if (data.length === 0) {
    return {
      message: "No Data Found",
      data: null,
      status: false,
    };
  } else {
    return {
      message: "Data Found",
      data,
      status: true,
    };
  }
};
