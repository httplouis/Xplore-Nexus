import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationStatus, PaymentStatus, NotificationCategory } from "@prisma/client";

// POST /api/payments/confirm
export async function POST(request: Request) {
  try {
    const { registrationId, paymentRef } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: "Missing registrationId" },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    // Only update if not already confirmed
    if (registration.status !== RegistrationStatus.CONFIRMED) {
      const actualPaymentRef = paymentRef ?? `INF-${Date.now().toString(36).toUpperCase()}`;

      // Update registration status
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          amountPaid: registration.event.ticketPrice,
        },
      });

      // Create or update Payment record
      await prisma.payment.upsert({
        where: { registrationId },
        update: {
          amount: registration.event.ticketPrice,
          status: PaymentStatus.COMPLETED,
          providerRef: actualPaymentRef,
        },
        create: {
          registrationId,
          amount: registration.event.ticketPrice,
          status: PaymentStatus.COMPLETED,
          provider: "stripe",
          providerRef: actualPaymentRef,
          paymentMethod: "card",
        },
      });

      // Increment event participantCount
      await prisma.event.update({
        where: { id: registration.eventId },
        data: {
          participantCount: { increment: 1 },
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          title: "Payment Successful",
          message: `Your payment for ${registration.event.name} has been confirmed.`,
          category: NotificationCategory.PAYMENT,
          priority: "high",
          isRead: false,
        },
      });
    }

    // Fetch the updated registration to return it
    const updatedReg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true, user: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedReg,
    });
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
