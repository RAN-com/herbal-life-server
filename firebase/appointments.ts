import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from ".";
import { updateStaff } from "./staffs";
import { AppointmentData, StaffData } from "@/types/staff";
import { errorToast } from "@/utils/toast";
import { encryptData } from "@/utils/crypto";
import moment from "moment";
import { sendNotification } from "./notification";

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

export const createAppointment = async (
  sid: string,
  uid: string,
  data: Omit<AppointmentData, "aid" | "createdOn">
) => {
  try {
    const appRef = doc(firestore, `appointments/${sid}`);
    const docSnap = await getDoc(appRef);

    const selectedDate = moment(data.appointment_date).format("YYYY-MM-DD"); // User selected date
    const todayDate = moment().format("YYYY-MM-DD"); // Current date

    // **Check if selected date is in the future**
    if (!moment(selectedDate).isAfter(todayDate)) {
      return {
        success: false,
        message: "Appointments can only be booked for future dates",
      };
    }

    const newAppointment: AppointmentData = {
      ...data,
      mapLocation: data?.mapLocation || "",
      aid: encryptData(data.phone + new Date().toString()) as string, // Generate unique ID based on phone
      createdOn: moment().toISOString(), // Current timestamp for creation
    };

    if (docSnap.exists()) {
      await updateDoc(appRef, {
        records: arrayUnion(newAppointment),
        total_records: (docSnap.data().total_records || 0) + 1,
      });
    } else {
      await setDoc(appRef, {
        records: [newAppointment],
        total_records: 1,
      });
    }

    await sendNotification(uid, {
      title: `Appointment Submitted By: ${data.name}`,
      metadata: {
        appointment: newAppointment,
        staffId: sid,
        userId: uid,
      },
      message: `An appointment has been successfully submitted for ${
        data.name
      } on ${moment(data.appointment_date).format("MMMM Do YYYY, h:mm a")}.`,
      type: "update",
    });

    return {
      success: true,
      message: "Appointment added successfully",
      data: newAppointment,
    };
  } catch (error) {
    console.error("Error adding appointment:", error);
    return { success: false, message: "Error adding appointment" };
  }
};
