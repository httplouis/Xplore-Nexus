import { NextRequest, NextResponse } from "next/server";

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `TKT-${part}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as {
      userId: string;
      userName: string;
      userEmail: string;
      eventName: string;
      isPaid: boolean;
      paymentRef?: string;
    };

    const { userId, userName, userEmail, eventName, isPaid, paymentRef } = body;

    if (!userId || !userName || !userEmail || !eventName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ticketCode = generateTicketCode();

    const registration = {
      id: `reg-${Date.now()}`,
      eventId: params.id,
      eventName,
      userId,
      userName,
      userEmail,
      ticketCode,
      status: isPaid ? "Pending" : "Confirmed",
      paymentRef: paymentRef ?? undefined,
      registeredAt: new Date().toISOString(),
    };

    // Store in localStorage
    try {
      const registrations = JSON.parse(
        localStorage.getItem("xplore_registrations") || "[]"
      );
      registrations.push(registration);
      localStorage.setItem("xplore_registrations", JSON.stringify(registrations));

      // Create notification
      const notifications = JSON.parse(
        localStorage.getItem("xplore_notifications") || "[]"
      );
      notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: "Registration Confirmed",
        message: `You're registered for ${eventName}`,
        category: "EVENT",
        priority: "high",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("xplore_notifications", JSON.stringify(notifications));

      console.log(`✓ Registration saved to localStorage for ${eventName}`);
    } catch (storageError) {
      console.warn("localStorage not available", storageError);
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create registration" },
      { status: 500 }
    );
  }
}
