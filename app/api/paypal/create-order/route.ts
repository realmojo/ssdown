import { NextResponse } from "next/server";
import { createPaypalOrder } from "@/lib/paypal";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Optional: Allow custom amount from request body later if needed
    // const { amount } = await req.json();

    const amount = "5.00"; // Default donation amount

    const order = await createPaypalOrder(amount);

    // PayPal returns an array of links. We need the one with rel='approve'
    const approveLink = order.links?.find((l: any) => l.rel === "approve");

    if (!approveLink) {
      console.error("PayPal Response:", order);
      return NextResponse.json(
        { error: "No approval link found in PayPal response" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: approveLink.href });
  } catch (error: any) {
    console.error("PayPal API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal payment processing error" },
      { status: 500 },
    );
  }
}
