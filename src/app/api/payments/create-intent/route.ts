import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

// POST /api/payments/create-intent
export async function POST(request: Request) {
  try {
    const { registrationId, amount, currency = "PHP" } = await request.json();

    if (!registrationId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing registrationId or amount" },
        { status: 400 }
      );
    }

    // Find registration in DB
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    const providerRef = `pi_${Date.now()}`;

    // Create payment record in DB
    const payment = await prisma.payment.create({
      data: {
        registrationId,
        amount: parseFloat(amount),
        currency,
        status: PaymentStatus.PENDING,
        provider: "stripe",
        providerRef,
        paymentMethod: "card",
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: `secret_${Date.now()}`,
      paymentIntentId: payment.providerRef,
    });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
