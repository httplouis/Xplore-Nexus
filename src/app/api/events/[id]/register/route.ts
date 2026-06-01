import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapRegistrationToClient } from "@/lib/db-mappers";
import { RegistrationStatus, PaymentStatus, NotificationCategory } from "@prisma/client";

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `TKT-${part}`;
}

// GET /api/events/[id]/register
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const ticketCode = searchParams.get("ticketCode");
    const eventId = params.id;

    if (ticketCode) {
      const reg = await prisma.registration.findUnique({
        where: { ticketCode: ticketCode.toUpperCase().trim() },
        include: {
          event: true,
          user: true,
        },
      });

      if (!reg || reg.eventId !== eventId) {
        return NextResponse.json({ success: true, data: null });
      }

      return NextResponse.json({ success: true, data: mapRegistrationToClient(reg) });
    }

    if (userId) {
      // Find specific user registration
      const reg = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        include: {
          event: true,
          user: true,
        },
      });

      if (!reg) {
        return NextResponse.json({ success: true, data: null });
      }

      return NextResponse.json({ success: true, data: mapRegistrationToClient(reg) });
    } else {
      // Get all registrations for this event
      const regs = await prisma.registration.findMany({
        where: { eventId },
        include: {
          event: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        data: regs.map(mapRegistrationToClient),
      });
    }
  } catch (error: any) {
    console.error("GET registrations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/register
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await req.json() as {
      userId: string;
      userName: string;
      userEmail: string;
      eventName: string;
      isPaid: boolean;
      paymentRef?: string;
    };

    const { userId, userName, userEmail, eventName, isPaid, paymentRef } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check for duplicate registration
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    const ticketCode = generateTicketCode();
    const isPaidEvent = event.isPaid;

    // Create registration in database
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        ticketCode,
        status: isPaidEvent ? RegistrationStatus.PENDING : RegistrationStatus.CONFIRMED,
        paymentStatus: isPaidEvent ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
        amountPaid: 0,
      },
      include: {
        event: true,
        user: true,
      },
    });

    // Increment event registrationCount and participantCount atomically
    await prisma.event.update({
      where: { id: eventId },
      data: {
        registrationCount: { increment: 1 },
        participantCount: { increment: isPaidEvent ? 0 : 1 },
      },
    });

    // Create notification in database
    const notificationTitle = isPaidEvent ? "Registration Pending Payment" : "Registration Confirmed";
    const notificationMsg = isPaidEvent 
      ? `Your registration for ${event.name} is pending payment.`
      : `You're registered for ${event.name}`;

    await prisma.notification.create({
      data: {
        userId,
        title: notificationTitle,
        message: notificationMsg,
        category: NotificationCategory.EVENT,
        priority: "high",
        isRead: false,
      },
    });

    const clientRegistration = mapRegistrationToClient(registration);

    return NextResponse.json({ success: true, data: clientRegistration });
  } catch (error: any) {
    console.error("Register POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create registration" },
      { status: 500 }
    );
  }
}
