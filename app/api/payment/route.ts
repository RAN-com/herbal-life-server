import { NextResponse, NextRequest } from "next/server";
import Razorpay from "razorpay";
import { decryptData } from "@/utils/crypto";
import { razorpay_key, razorpay_secret } from "@/constants/value";

type CenterUserPricing = {
  title: string;
  price: number;
  type: "appointments" | "subscription";
  validity?: "3_month" | "6_months" | "1_year"; // in days
  priceId: string;
  features: string[];
};

// Ensure Next.js uses Node.js runtime
export const runtime = "nodejs"; // Important for Razorpay

// Utility function to create a Razorpay instance
const createRazorpayInstance = () => {
  if (!razorpay_key || !razorpay_secret) {
    throw new Error("Razorpay environment variables are not set");
  }
  return new Razorpay({
    key_id: razorpay_key,
    key_secret: razorpay_secret,
  });
};

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins, change to specific origin if needed
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET Handler
export const GET = async () => {
  return NextResponse.json(
    { message: "GET method not supported on this route." },
    { status: 405, headers: corsHeaders }
  );
};

// POST Handler
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { data, type } = body;
    console.log(data, type, razorpay_key, razorpay_secret);
    // Check for missing fields
    if (!data || !type) {
      return NextResponse.json(
        { message: "Missing required fields: 'data' or 'type'" },
        { status: 400, headers: corsHeaders }
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
        { status: 201, headers: corsHeaders }
      );
    }

    // Decrypt data
    const decryptedData = decryptData(data) as string;
    const parsedData = JSON.parse(decryptedData) as CenterUserPricing;

    // Validate parsed data
    if (!parsedData || typeof parsedData.price !== "number") {
      return NextResponse.json(
        { message: "Invalid or incomplete data provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create order
    const instance = createRazorpayInstance();
    const order = await instance.orders.create({
      amount: parsedData.price * 100, // Convert to paisa
      currency: "INR",
      receipt: "",
    });

    return NextResponse.json(
      { message: "Created Order Successfully", order },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in payment handler:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
