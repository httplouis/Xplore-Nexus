import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/training?trainingId=XXX
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get("trainingId");

    if (!trainingId) {
      return NextResponse.json(
        { error: "trainingId parameter required" },
        { status: 400 }
      );
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: { instructor: true },
    });

    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    const [enrollments, certificates] = await Promise.all([
      prisma.enrollment.findMany({
        where: { trainingId },
        include: { user: true },
      }),
      prisma.certificate.findMany({ where: { trainingId } }),
    ]);

    const completed = enrollments.filter(
      (e) => e.status === "COMPLETED"
    ).length;
    const inProgress = enrollments.filter(
      (e) => e.status === "IN_PROGRESS"
    ).length;
    const notStarted = enrollments.filter(
      (e) => e.status === "NOT_STARTED"
    ).length;

    const completionRate =
      enrollments.length > 0
        ? (completed / enrollments.length) * 100
        : 0;
    const avgProgress =
      enrollments.length > 0
        ? enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) /
          enrollments.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        trainingId,
        trainingName: training.title,
        category: training.category,
        instructor: training.instructor
          ? `${training.instructor.firstName} ${training.instructor.lastName}`
          : "Unknown",
        duration: `${training.hours} hours`,
        modules: training.modules,
        totalEnrolled: enrollments.length,
        completed,
        inProgress,
        notStarted,
        completionRate: completionRate.toFixed(2),
        averageProgress: avgProgress.toFixed(2),
        certificatesIssued: certificates.length,
        students: enrollments.map((e) => ({
          id: e.id,
          name: e.user
            ? `${e.user.firstName} ${e.user.lastName}`
            : "Unknown",
          email: e.user?.email || "N/A",
          status: e.status,
          progress: e.progress,
          enrolledAt: e.createdAt.toISOString(),
          completedAt: e.completedAt?.toISOString() || null,
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
