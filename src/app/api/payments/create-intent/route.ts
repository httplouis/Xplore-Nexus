import { NextResponse } from "next/server";

// POST /api/payments/create-intent
// Create payment intent - stores in localStorage
export async function POST(request: Request) {
  try {
    const { registrationId, amount, currency = "PHP" } = await request.json();

    if (!registrationId || !amount) {
      return NextResponse.json(
        { error: "Missing registrationId or amount" },
        { status: 400 }
      );
    }

    // Get registration details from localStorage
    const registrations = JSON.parse(
      localStorage.getItem("xplore_registrations") || "[]"
    );
    const registration = registrations.find(
      (r: any) => r.id === registrationId
    );

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = {
      id: `pay-${Date.now()}`,
      registrationId,
      amount,
      currency,
      status: "PENDING",
      provider: "stripe",
      providerRef: `pi_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const payments = JSON.parse(localStorage.getItem("xplore_payments") || "[]");
    payments.push(payment);
    localStorage.setItem("xplore_payments", JSON.stringify(payments));

    return NextResponse.json({
      success: true,
      clientSecret: `secret_${Date.now()}`,
      paymentIntentId: payment.providerRef,
    });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
