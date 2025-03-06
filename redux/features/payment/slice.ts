import {
  getAdminPayment,
  getCardPayment,
  makePendingAdminOrder,
  makePendingCardOrder,
  makeSuccessAdminOrder,
  makeSuccessCardOrder,
  makeFailureAdminOrder,
  makeFailureCardOrder,
} from "@/firebase/pricing";
import {
  CreateAdminPayment,
  CreateCardPaymentProps,
  PaymentDetails,
} from "@/types/payment";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type INITIAL_STATE = {
  order: CreateAdminPayment | CreateCardPaymentProps | null;
  status: "idle" | "loading" | "paid" | "failed";
  error: string | null;
  show_razorpay: boolean;
};

const initialState: INITIAL_STATE = {
  order: null,
  status: "idle",
  error: null,
  show_razorpay: false,
};

const name = "payment";

// Fetch pending orders
export const getPendingOrders = createAsyncThunk(
  `${name}/getPendingOrders`,
  async ({ uid, sid }: { uid: string; sid?: string }) => {
    const [adminPayment, cardPayment] = await Promise.all([
      getAdminPayment(uid),
      sid ? getCardPayment(uid, sid) : null,
    ]);

    if (!adminPayment && !cardPayment) {
      throw new Error("No pending orders found");
    }

    return adminPayment || cardPayment;
  }
);

// Update payment status (pending, paid, failure)
export const markAs = createAsyncThunk(
  `${name}/markAs`,
  async ({
    uid,
    sid,
    status,
    payment_details,
  }: {
    uid: string;
    sid?: string;
    status: "pending" | "paid" | "failure";
    payment_details?: PaymentDetails;
  }) => {
    let response;

    if (sid) {
      if (status === "pending") response = await makePendingCardOrder(uid, sid);
      if (status === "paid")
        response = await makeSuccessCardOrder(uid, sid, payment_details!);
      if (status === "failure") response = await makeFailureCardOrder(uid, sid);
    } else {
      if (status === "pending") response = await makePendingAdminOrder(uid);
      if (status === "paid")
        response = await makeSuccessAdminOrder(uid, payment_details!);
      if (status === "failure") response = await makeFailureAdminOrder(uid);
    }

    return response;
  }
);

const paymentSlice = createSlice({
  name,
  initialState,
  reducers: {
    setShowRazorpay: (state, action) => {
      state.show_razorpay = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPendingOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getPendingOrders.fulfilled, (state, action) => {
        state.status = "paid";
        state.order = action.payload;
      })
      .addCase(getPendingOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch orders";
      })
      .addCase(markAs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(markAs.fulfilled, (state, action) => {
        state.status = "paid";
        state.order = action.payload?.data || null;
      })
      .addCase(markAs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to update order status";
      });
  },
});

export const { setShowRazorpay } = paymentSlice.actions;

export default paymentSlice.reducer;
