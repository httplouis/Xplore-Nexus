import { NextResponse } from "next/server";

// GET /api/reports/event?eventId=XXX
// Get event analytics from localStorage
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

    // Get data from localStorage
    const events = JSON.parse(localStorage.getItem("xplore_events") || "[]");
    const registrations = JSON.parse(
      localStorage.getItem("xplore_registrations") || "[]"
    );
    const feedback = JSON.parse(localStorage.getItem("xplore_feedback") || "[]");

    const event = events.find((e: any) => e.id === eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventRegs = registrations.filter((r: any) => r.eventId === eventId);
    const eventFeedback = feedback.filter((f: any) => f.eventId === eventId);

    const totalRegistered = eventRegs.length;
    const confirmedRegs = eventRegs.filter((r: any) => r.status === "Confirmed").length;
    const attendedRegs = eventRegs.filter((r: any) => r.checkedIn).length;
    const avgRating =
      eventFeedback.length > 0
        ? eventFeedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) /
          eventFeedback.length
        : 0;

    const attendanceRate =
      totalRegistered > 0 ? (attendedRegs / totalRegistered) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        eventName: event.name,
        eventDate: event.date,
        eventStatus: event.status,
        totalRegistered,
        confirmedRegistrations: confirmedRegs,
        cancelledRegistrations: eventRegs.filter((r: any) => r.status === "Cancelled")
          .length,
        registrationRate: ((confirmedRegs / (event.maxParticipants || 50)) * 100).toFixed(2),
        totalAttended: attendedRegs,
        attendanceRate: attendanceRate.toFixed(2),
        noShow: totalRegistered - attendedRegs,
        totalRevenue: 0,
        averageRating: avgRating.toFixed(2),
        engagementScore: Math.round((attendanceRate * 0.5 + avgRating * 10) / 1.5),
        totalFeedback: eventFeedback.length,
        attendees: eventRegs.map((r: any) => ({
          id: r.id,
          name: r.userName,
          email: r.userEmail,
          status: r.status,
          checkedIn: r.checkedIn || false,
          registeredAt: r.registeredAt,
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
