import { NextResponse } from "next/server";

// GET /api/reports/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Get platform-wide analytics from localStorage
export async function GET(request: Request) {
  try {
    // Get all data from localStorage
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const events = JSON.parse(localStorage.getItem("xplore_events") || "[]");
    const trainings = JSON.parse(localStorage.getItem("xplore_trainings") || "[]");
    const registrations = JSON.parse(
      localStorage.getItem("xplore_registrations") || "[]"
    );
    const enrollments = JSON.parse(localStorage.getItem("xplore_enrollments") || "[]");
    const certificates = JSON.parse(
      localStorage.getItem("xplore_certificates") || "[]"
    );
    const payments = JSON.parse(localStorage.getItem("xplore_payments") || "[]");

    // Calculate metrics
    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.status === "ACTIVE").length;
    const totalEvents = events.length;
    const totalTrainings = trainings.length;
    const totalCertificates = certificates.length;
    const totalRegistrations = registrations.length;
    const totalAttendance = registrations.filter((r: any) => r.checkedIn).length;

    // Revenue
    const completedPayments = payments.filter((p: any) => p.status === "COMPLETED");
    const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // User distribution
    const usersByRole: any = {};
    users.forEach((u: any) => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    // Event status
    const eventsByStatus: any = {};
    events.forEach((e: any) => {
      eventsByStatus[e.status] = (eventsByStatus[e.status] || 0) + 1;
    });

    // Training stats
    const trainingStats: any = {};
    enrollments.forEach((e: any) => {
      trainingStats[e.status] = (trainingStats[e.status] || 0) + 1;
    });

    // Attendance rate
    const avgAttendanceRate =
      totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

    // System health (0-100)
    const paymentConversion =
      payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0;
    const systemHealth = Math.round(
      paymentConversion * 0.4 + avgAttendanceRate * 0.4 + (activeUsers / Math.max(totalUsers, 1)) * 20
    );

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        usersByRole,
        totalEvents,
        eventsByStatus,
        totalTrainings,
        totalCertificates,
        totalRegistrations,
        totalAttended: totalAttendance,
        attendanceRate: avgAttendanceRate.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        avgTransactionValue:
          completedPayments.length > 0
            ? (totalRevenue / completedPayments.length).toFixed(2)
            : 0,
        paymentMetrics: {
          completed: completedPayments.length,
          pending: payments.filter((p: any) => p.status === "PENDING").length,
          conversionRate: paymentConversion.toFixed(2),
        },
        trainingStats,
        systemHealth,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
