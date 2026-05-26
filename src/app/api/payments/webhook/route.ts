import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// POST /api/payments/webhook
// Stripe webhook for payment confirmation
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

  // Handle event types
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const registrationId = paymentIntent.metadata.registrationId;

    // Get data from localStorage
    const payments = JSON.parse(localStorage.getItem("xplore_payments") || "[]");
    const registrations = JSON.parse(
      localStorage.getItem("xplore_registrations") || "[]"
    );
    const notifications = JSON.parse(
      localStorage.getItem("xplore_notifications") || "[]"
    );

    if (event.type === "payment_intent.succeeded") {
      // Update payment status
      const payment = payments.find(
        (p: any) => p.providerRef === paymentIntent.id
      );
      if (payment) {
        payment.status = "COMPLETED";
      }

      // Update registration payment status
      const registration = registrations.find((r: any) => r.id === registrationId);
      if (registration) {
        registration.status = "Confirmed";
        registration.paymentStatus = "COMPLETED";
        registration.paymentRef = paymentIntent.id;
      }

      // Create success notification
      if (registration) {
        notifications.push({
          id: `notif-${Date.now()}`,
          userId: registration.userId,
          title: "Payment Successful",
          message: "Your event ticket payment has been confirmed",
          category: "PAYMENT",
          priority: "high",
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // Payment failed
      const payment = payments.find(
        (p: any) => p.providerRef === paymentIntent.id
      );
      if (payment) {
        payment.status = "FAILED";
      }

      const registration = registrations.find((r: any) => r.id === registrationId);
      if (registration) {
        registration.paymentStatus = "FAILED";

        // Create failure notification
        notifications.push({
          id: `notif-${Date.now()}`,
          userId: registration.userId,
          title: "Payment Failed",
          message: "Your payment could not be processed",
          category: "PAYMENT",
          priority: "high",
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Save updated data
    localStorage.setItem("xplore_payments", JSON.stringify(payments));
    localStorage.setItem("xplore_registrations", JSON.stringify(registrations));
    localStorage.setItem("xplore_notifications", JSON.stringify(notifications));
  }

  return NextResponse.json({ received: true });
}
