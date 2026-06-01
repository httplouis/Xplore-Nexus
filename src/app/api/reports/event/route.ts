import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/event?eventId=XXX
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId parameter required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const [registrations, feedback] = await Promise.all([
      prisma.registration.findMany({
        where: { eventId },
        include: { user: true },
      }),
      prisma.feedback.findMany({ where: { eventId }, include: { user: true } }),
    ]);

    const totalRegistered = registrations.length;
    const confirmedRegs = registrations.filter((r) => r.status === "CONFIRMED").length;
    const attendedRegs = registrations.filter((r) => r.checkedIn).length;
    const avgRating =
      feedback.length > 0
        ? feedback.reduce((sum: number, f) => sum + (f.rating || 0), 0) /
          feedback.length
        : 0;

    const attendanceRate =
      totalRegistered > 0 ? (attendedRegs / totalRegistered) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        eventName: event.name,
        eventDate: event.date.toISOString(),
        eventStatus: event.status,
        totalRegistered,
        confirmedRegistrations: confirmedRegs,
        cancelledRegistrations: registrations.filter((r) => r.status === "CANCELLED")
          .length,
        registrationRate: ((confirmedRegs / (event.maxParticipants || 50)) * 100).toFixed(2),
        totalAttended: attendedRegs,
        attendanceRate: attendanceRate.toFixed(2),
        noShow: totalRegistered - attendedRegs,
        totalRevenue: 0,
        averageRating: avgRating.toFixed(2),
        engagementScore: Math.round((attendanceRate * 0.5 + avgRating * 10) / 1.5),
        totalFeedback: feedback.length,
        attendees: registrations.map((r) => ({
          id: r.id,
          name: r.user ? `${r.user.firstName} ${r.user.lastName}` : "Unknown",
          email: r.user?.email || "",
          status: r.status,
          checkedIn: r.checkedIn || false,
          registeredAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
