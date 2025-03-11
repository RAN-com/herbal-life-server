"use client";

import { CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store/hook";
import {
  getPendingOrders,
  markAs,
  setShowRazorpay,
} from "@/redux/features/payment/slice";
export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const [oid, uid, sid] = (params?.params as string[]) ?? [];
  const isValid = (oid && uid) || sid;
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.payment.order);
  const loading = useAppSelector((s) => s.payment.status === "idle");

  useEffect(() => {
    if (!oid || !uid) {
      router.push("/not-found"); // Redirect to 404 if params are missing
    } else {
      dispatch(
        getPendingOrders({
          uid: uid,
          sid: sid,
        })
      );
    }
  }, [oid, uid, sid, router]);

  React.useEffect(() => {
    if (loading && uid && sid) {
      dispatch(
        markAs({
          uid,
          sid,
          status: "pending",
        })
      );
    }
  }, [loading]);

  React.useEffect(() => {
    if (!!data && !loading) {
      console.log("Can ProceED nOW");
      dispatch(setShowRazorpay(true));
      router.push("/pay", { scroll: true });
    } else {
      dispatch(setShowRazorpay(false));
      console.log("NOt working");
    }
  }, [data]);

  return isValid ? (
    <div>
      {loading && (
        <CircularProgress
          variant="indeterminate"
          color={"secondary"}
          size={24}
        />
      )}
    </div>
  ) : null;
}
