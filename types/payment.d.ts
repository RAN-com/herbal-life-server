export interface PaymentDetails {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type CreateCardPaymentProps = {
  order: any;
  createdOn: string;
  uid: string;
  sid: string;
  type: "VISITING_CARD";
  status?: "paid" | "pending" | "failed" | null;
  valid_till?: string;
  oid?: string;
  payment_details?: PaymentDetails;
  canApproveWithoutPayment?: boolean;
};

export type CreateAdminPayment = {
  uid: string;
  oid?: string;
  order: any;
  sid?: string;
  createdOn: string;
  valid_till?: string;
  type: "SUBSCRIPTION";
  status?: "paid" | "pending" | "failed" | null;
  payment_details?: PaymentDetails;
  canApproveWithoutPayment?: boolean;
};
