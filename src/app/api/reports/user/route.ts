import { NextResponse } from "next/server";

// GET /api/reports/user?userId=XXX
// Get user engagement report from localStorage
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    // Get data from localStorage
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const registrations = JSON.parse(
      localStorage.getItem("xplore_registrations") || "[]"
    );
    const enrollments = JSON.parse(localStorage.getItem("xplore_enrollments") || "[]");
    const certificates = JSON.parse(
      localStorage.getItem("xplore_certificates") || "[]"
    );

    const user = users.find((u: any) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRegs = registrations.filter((r: any) => r.userId === userId);
    const userEnrollments = enrollments.filter((e: any) => e.userId === userId);
    const userCerts = certificates.filter((c: any) => c.userId === userId);

    const eventAttended = userRegs.filter((r: any) => r.checkedIn).length;
    const trainingCompleted = userEnrollments.filter(
      (e: any) => e.status === "COMPLETED"
    ).length;
    const totalPoints =
      trainingCompleted * 10 + eventAttended * 5 + userCerts.length * 20;

    const activities = [
      ...userRegs.map((r: any) => ({
        type: "EVENT_REGISTRATION",
        title: `Registered for ${r.eventName}`,
        date: r.registeredAt,
      })),
      ...userEnrollments.map((e: any) => ({
        type: "TRAINING_ENROLLMENT",
        title: `Enrolled in training`,
        date: e.enrolledAt || new Date().toISOString(),
      })),
      ...userCerts.map((c: any) => ({
        type: "CERTIFICATE_EARNED",
        title: `Earned certificate: ${c.title}`,
        date: c.issuedDate,
      })),
    ].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        department: user.department,
        joinedDate: user.createdAt,
        lastActive: user.lastActive,
        eventsRegistered: userRegs.length,
        eventsAttended: eventAttended,
        trainingsEnrolled: userEnrollments.length,
        trainingsCompleted: trainingCompleted,
        certificatesEarned: userCerts.length,
        totalPoints,
        rank:
          totalPoints > 100 ? "Expert" : totalPoints > 50 ? "Intermediate" : "Beginner",
        recentActivity: activities.slice(0, 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
