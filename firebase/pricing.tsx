import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from ".";
import {
  CreateAdminPayment,
  CreateCardPaymentProps,
  PaymentDetails,
} from "@/types/payment";
import moment from "moment";

export const getAdminPayment = async (uid: string) => {
  const orderDoc = doc(firestore, `orders/${uid}`);
  const orderRef = await getDoc(orderDoc);

  if (orderRef?.exists()) {
    return orderRef.data() as unknown as CreateAdminPayment;
  }

  return null;
};

export const getCardPayment = async (uid: string, sid: string) => {
  const orderDoc = doc(firestore, `orders/${uid}-${sid}`);
  const orderRef = await getDoc(orderDoc);

  if (orderRef?.exists()) {
    return orderRef.data() as unknown as CreateCardPaymentProps;
  }

  return null;
};

export const deleteOrder = async (documentId: string) => {
  const orderDoc = doc(firestore, `orders/${documentId}`);
  const orderRef = await getDoc(orderDoc);

  if (orderRef?.exists()) {
    await deleteDoc(orderDoc);
    return {
      status: true,
      message: `ORDER ID::${documentId} deleted successfully`,
      data: null,
    };
  }
  return {
    status: false,
    message: "No Pending Orders",
    data: null,
  };
};

type PaymentStatus = "pending" | "paid" | "failure";

const updateOrderStatus = async (
  path: string,
  status: PaymentStatus,
  paymentDetails?: PaymentDetails
) => {
  const orderDoc = doc(firestore, path);
  const orderRef = await getDoc(orderDoc);

  if (!orderRef.exists()) {
    return {
      status: false,
      message: "Order Not Found",
      data: null,
    };
  }

  const orderData = orderRef.data() as { valid_till: string };

  // Check if the order is still valid
  if (moment(orderData.valid_till).isBefore(moment())) {
    return {
      status: false,
      message: "Order Expired",
      data: null,
    };
  }

  // Prepare updated data
  const updatedData: any = { status: status };
  if (status === "paid" && paymentDetails) {
    updatedData.payment_details = paymentDetails;
  }

  // Update the order with payment details if successful
  await setDoc(orderDoc, updatedData, { merge: true });

  return {
    status: true,
    message: `Order updated to ${status}`,
    data: (await getDoc(orderDoc)).data() as
      | CreateCardPaymentProps
      | CreateAdminPayment,
  };
};

export const makePendingAdminOrder = async (uid: string) => {
  return updateOrderStatus(`orders/${uid}`, "pending");
};

export const makePendingCardOrder = async (uid: string, sid: string) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, "pending");
};

// Mark an Admin order as paid with Razorpay details
export const makeSuccessAdminOrder = async (
  uid: string,
  paymentDetails: PaymentDetails
) => {
  return updateOrderStatus(`orders/${uid}`, "paid", paymentDetails);
};

// Mark a Card order as paid with Razorpay details
export const makeSuccessCardOrder = async (
  uid: string,
  sid: string,
  paymentDetails: PaymentDetails
) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, "paid", paymentDetails);
};

export const makeFailureAdminOrder = async (uid: string) => {
  return updateOrderStatus(`orders/${uid}`, "failure");
};

export const makeFailureCardOrder = async (uid: string, sid: string) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, "failure");
};
