import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/user?userId=XXX
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [registrations, enrollments, certificates] = await Promise.all([
      prisma.registration.findMany({ where: { userId }, include: { event: true } }),
      prisma.enrollment.findMany({ where: { userId }, include: { training: true } }),
      prisma.certificate.findMany({ where: { userId } }),
    ]);

    const eventAttended = registrations.filter((r) => r.checkedIn).length;
    const trainingCompleted = enrollments.filter(
      (e) => e.status === "COMPLETED"
    ).length;
    const totalPoints =
      trainingCompleted * 10 + eventAttended * 5 + certificates.length * 20;

    const activities = [
      ...registrations.map((r) => ({
        type: "EVENT_REGISTRATION" as const,
        title: `Registered for ${r.event?.name || "Event"}`,
        date: r.createdAt.toISOString(),
      })),
      ...enrollments.map((e) => ({
        type: "TRAINING_ENROLLMENT" as const,
        title: `Enrolled in ${e.training?.title || "Training"}`,
        date: e.createdAt.toISOString(),
      })),
      ...certificates.map((c) => ({
        type: "CERTIFICATE_EARNED" as const,
        title: `Earned certificate: ${c.title}`,
        date: c.issuedDate.toISOString(),
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
        joinedDate: user.createdAt.toISOString(),
        lastActive: user.lastActive.toISOString(),
        eventsRegistered: registrations.length,
        eventsAttended: eventAttended,
        trainingsEnrolled: enrollments.length,
        trainingsCompleted: trainingCompleted,
        certificatesEarned: certificates.length,
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
