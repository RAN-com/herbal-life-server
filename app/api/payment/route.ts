import { NextResponse, NextRequest } from "next/server";
import Razorpay from "razorpay";
import { decryptData } from "@/utils/crypto";

type CenterUserPricing = {
  title: string;
  price: number;
  type: "appointments" | "subscription";
  validity?: "3_month" | "6_months" | "1_year"; // in days
  priceId: string;
  features: string[];
};

// Utility function to create a Razorpay instance
const createRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay environment variables are not set");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
};

// GET Handler
export const GET = async () => {
  return NextResponse.json(
    { message: "GET method not supported on this route." },
    { status: 405 }
  );
};

// POST Handler
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { data, type } = body;
    console.log(data, type);
    // Check for missing fields
    if (!data || !type) {
      return NextResponse.json(
        { message: "Missing required fields: 'data' or 'type'" },
        { status: 400 }
      );
    }

    // Handle APPOINTMENT_CARD type
    if (type === "APPOINTMENT_CARD") {
      const instance = createRazorpayInstance();
      const order = await instance.orders.create({
        amount: 500 * 100, // Example amount in paisa
        currency: "INR",
      });
      return NextResponse.json(
        { message: "Created Order Successfully", order },
        { status: 201 }
      );
    }

    // Decrypt data
    const decryptedData = decryptData(data) as string;
    const parsedData = JSON.parse(decryptedData) as CenterUserPricing;

    // Validate parsed data
    if (!parsedData || typeof parsedData.price !== "number") {
      return NextResponse.json(
        { message: "Invalid or incomplete data provided" },
        { status: 400 }
      );
    }

    // Create order
    const instance = createRazorpayInstance();
    const order = await instance.orders.create({
      amount: parsedData.price * 100, // Convert to paisa
      currency: "INR",
    });

    return NextResponse.json(
      { message: "Created Order Successfully", order },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in payment handler:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
