import { NextResponse } from "next/server";

// GET /api/reports/training?trainingId=XXX
// Get training report from localStorage
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

    // Get data from localStorage
    const trainings = JSON.parse(localStorage.getItem("xplore_trainings") || "[]");
    const enrollments = JSON.parse(localStorage.getItem("xplore_enrollments") || "[]");
    const certificates = JSON.parse(
      localStorage.getItem("xplore_certificates") || "[]"
    );
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");

    const training = trainings.find((t: any) => t.id === trainingId);
    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    const trainingEnrollments = enrollments.filter(
      (e: any) => e.trainingId === trainingId
    );
    const trainingCerts = certificates.filter((c: any) => c.trainingId === trainingId);

    const completed = trainingEnrollments.filter(
      (e: any) => e.status === "COMPLETED"
    ).length;
    const inProgress = trainingEnrollments.filter(
      (e: any) => e.status === "IN_PROGRESS"
    ).length;
    const notStarted = trainingEnrollments.filter(
      (e: any) => e.status === "NOT_STARTED"
    ).length;

    const completionRate =
      trainingEnrollments.length > 0
        ? (completed / trainingEnrollments.length) * 100
        : 0;
    const avgProgress =
      trainingEnrollments.length > 0
        ? trainingEnrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) /
          trainingEnrollments.length
        : 0;

    const instructor = users.find((u: any) => u.id === training.instructorId);

    return NextResponse.json({
      success: true,
      data: {
        trainingId,
        trainingName: training.title,
        category: training.category,
        instructor: instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : "Unknown",
        duration: `${training.hours} hours`,
        modules: training.modules,
        totalEnrolled: trainingEnrollments.length,
        completed,
        inProgress,
        notStarted,
        completionRate: completionRate.toFixed(2),
        averageProgress: avgProgress.toFixed(2),
        certificatesIssued: trainingCerts.length,
        students: trainingEnrollments.map((e: any) => {
          const student = users.find((u: any) => u.id === e.userId);
          return {
            id: e.id,
            name: student
              ? `${student.firstName} ${student.lastName}`
              : "Unknown",
            email: student?.email || "N/A",
            status: e.status,
            progress: e.progress,
            enrolledAt: e.enrolledAt,
            completedAt: e.completedAt,
          };
        }),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
