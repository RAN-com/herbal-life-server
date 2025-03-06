"use client";

import CustomTypography from "@/component/typography";
import { razorpay_key } from "@/constants/value";
import { markAs } from "@/redux/features/payment/slice";
import {
  asyncGetCenterUser,
  asyncSetCurrentStaff,
} from "@/redux/features/user/card";
import { useAppSelector, useAppDispatch } from "@/redux/store/hook";
import { errorToast, infoToast, successToast } from "@/utils/toast";
import { Button, debounce, Dialog, styled, Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { RazorpayOrderOptions, useRazorpay } from "react-razorpay";

interface CountdownTimerProps {
  validTill: string; // Expiry time in ISO format
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ validTill }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = moment();
      const expiry = moment(validTill);
      const diff = moment.duration(expiry.diff(now));

      if (diff.asSeconds() <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = diff.minutes().toString().padStart(2, "0");
      const seconds = diff.seconds().toString().padStart(2, "0");
      setTimeLeft(`${minutes}:${seconds}`);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup
  }, [validTill]);

  return (
    <CustomTypography
      style={{
        fontSize: "12px",
        color: timeLeft === "Expired" ? "red" : "black",
      }}
    >
      {timeLeft === "Expired" ? "Order Expired!" : `Time Left: ${timeLeft}`}
    </CustomTypography>
  );
};

export default function Pay() {
  // const router = useRouter();
  const { Razorpay } = useRazorpay();
  const dispatch = useAppDispatch();
  const { order } = useAppSelector((s) => s.payment);
  console.log(moment().isBefore(order?.valid_till));
  const { admin_data } = useAppSelector((s) => s.card);
  React.useEffect(() => {
    if (!order) {
      console.log("Bad");
      // router.replace("/");
    } else {
      if (order?.sid) {
        dispatch(
          asyncSetCurrentStaff({
            uid: order?.uid,
            vid: order?.sid,
          })
        );
      }
      dispatch(asyncGetCenterUser(order?.uid));
    }
  }, [dispatch, order]);

  const handlePayment = () => {
    if (!razorpay_key) {
      throw new Error("Razorpay environment variables are not set");
    }

    const key = razorpay_key;

    const options: RazorpayOrderOptions = {
      amount: order?.order?.amount, // Amount in paise (100 paisa = 1 INR)
      currency: order?.order?.currency, // Currency (INR)
      key: key as string, // Razorpay API key
      name: "RAN", // Your company or app name
      order_id: order?.order?.id, // Razorpay order ID
      retry: {
        enabled: true,
      },
      modal: {
        ondismiss: () => {
          infoToast("Payment failed. Please try again");
          try {
            dispatch(
              markAs({
                status: "failure",
                uid: order?.uid as string,
                sid: order?.sid as string,
              })
            );
          } catch (err) {
            console.log(err);
          }
        },
      },
      handler: async (response) => {
        try {
          dispatch(
            markAs({
              status: "paid",
              uid: order?.uid as string,
              sid: order?.sid as string,
              payment_details: response,
            })
          );
          successToast("Payment Successful");
          debounce(() => {
            window.location.href = "/";
          }, 1000)();
          return;
        } catch (err) {
          dispatch(
            markAs({
              status: "failure",
              uid: order?.uid as string,
              sid: order?.sid as string,
            })
          );
          errorToast("Payment Failed");
          debounce(() => {
            window.location.href = "/";
          }, 1000)();
          console.log(err);
        }
      },
    };

    if (moment(order?.valid_till).isAfter(moment())) {
      if (typeof Razorpay !== "undefined") {
        const razorpayInstance = new Razorpay(options);
        if (!razorpayInstance) {
          try {
            dispatch(
              markAs({
                status: "failure",
                uid: order?.uid as string,
                sid: order?.sid as string,
              })
            );
          } catch (err) {
            console.log(err);
          }
          console.log("Razorpay Not Found");
          return;
        }
        razorpayInstance.open();
      } else {
        errorToast(
          "Payment gateway not available at the moment. Please contact support."
        );
      }
    } else {
      try {
        dispatch(
          markAs({
            status: "failure",
            uid: order?.uid as string,
            sid: order?.sid as string,
          })
        );
        errorToast("Payment Failed");
        debounce(() => {
          window.location.href = "/";
        }, 1000)();
      } catch (err) {
        console.log(err);
      }
      errorToast("Payment Timeout. Try Again");
      debounce(() => {
        window.location.href = "/";
      }, 1000)();
    }
  };

  console.log(order, "orderstatus");
  return (
    <div>
      <Dialog
        open={true}
        sx={{
          ".MuiPaper-root": {
            width: "calc(100% - 24px)",
            maxWidth: "420px",
            padding: "12px 24px",
          },
        }}
      >
        {typeof order?.status === "string" && order?.status === "paid" ? (
          <div>Paid</div>
        ) : (
          <Container>
            <Header>
              <CustomTypography variant="h5">
                Payment Confirmation
              </CustomTypography>
              <CountdownTimer
                validTill={moment(order?.valid_till).toISOString()}
              />
            </Header>
            <Body>
              <Row>
                <p>Name</p>: <b>{admin_data?.name}</b>
              </Row>
              <Row>
                <p>Address</p> :{" "}
                <b>
                  {admin_data?.locality},{admin_data?.city}
                </b>
              </Row>
              <Row>
                <p>Total Amount</p> :{" "}
                <b>₹ {(order?.order?.amount || 0) / 100}</b>
              </Row>
            </Body>
            <Button
              sx={{
                marginBottom: "8px",
              }}
              variant="contained"
              disableElevation
              disableFocusRipple
              disableRipple
              disableTouchRipple
              onClick={() => handlePayment()}
            >
              Make Payment
            </Button>
            <Typography
              fontSize={"12px"}
              color={"grey"}
              lineHeight={"0.8rem"}
              marginBottom={"12px"}
            >
              By clicking ‘Pay Now’, you agree to our Terms & Conditions. Your
              payment will be securely processed through Razorpay
            </Typography>
          </Container>
        )}
      </Dialog>
    </div>
  );
}

const Container = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Header = styled("div")({
  width: "100%",
  padding: "12px 0px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const Body = styled("div")({
  width: "100%",
  padding: "16px 0px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

const Row = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
});
