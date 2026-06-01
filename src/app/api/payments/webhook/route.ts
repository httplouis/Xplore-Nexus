import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, RegistrationStatus, NotificationCategory } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// POST /api/payments/webhook
export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const registrationId = paymentIntent.metadata.registrationId;

    if (!registrationId) {
      return NextResponse.json({ received: true });
    }

    const isSuccess = event.type === "payment_intent.succeeded";

    // Update registration and payment in DB
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json({ received: true });
    }

    if (isSuccess) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          amountPaid: registration.event.ticketPrice,
        },
      });

      await prisma.payment.upsert({
        where: { registrationId },
        update: {
          status: PaymentStatus.COMPLETED,
          providerRef: paymentIntent.id,
        },
        create: {
          registrationId,
          amount: registration.event.ticketPrice,
          status: PaymentStatus.COMPLETED,
          provider: "stripe",
          providerRef: paymentIntent.id,
          paymentMethod: "card",
        },
      });

      await prisma.event.update({
        where: { id: registration.eventId },
        data: { participantCount: { increment: 1 } },
      });

      await prisma.notification.create({
        data: {
          userId: registration.userId,
          title: "Payment Successful",
          message: "Your event ticket payment has been confirmed",
          category: NotificationCategory.PAYMENT,
          priority: "high",
          isRead: false,
        },
      });
    } else {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      await prisma.payment.upsert({
        where: { registrationId },
        update: { status: PaymentStatus.FAILED },
        create: {
          registrationId,
          amount: registration.event.ticketPrice,
          status: PaymentStatus.FAILED,
          provider: "stripe",
          providerRef: paymentIntent.id,
          paymentMethod: "card",
        },
      });

      await prisma.notification.create({
        data: {
          userId: registration.userId,
          title: "Payment Failed",
          message: "Your payment could not be processed",
          category: NotificationCategory.PAYMENT,
          priority: "high",
          isRead: false,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
