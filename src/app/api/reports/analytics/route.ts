import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z"),
      },
    } : {};

    const [
      users,
      events,
      trainings,
      registrations,
      enrollments,
      certificates,
      payments,
    ] = await Promise.all([
      prisma.user.findMany({ where: dateFilter }),
      prisma.event.findMany({ where: dateFilter }),
      prisma.training.findMany({ where: dateFilter }),
      prisma.registration.findMany({ where: dateFilter }),
      prisma.enrollment.findMany({ where: dateFilter }),
      prisma.certificate.findMany({ where: dateFilter }),
      prisma.payment.findMany({ where: dateFilter }),
    ]);

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
    const totalEvents = events.length;
    const totalTrainings = trainings.length;
    const totalCertificates = certificates.length;
    const totalRegistrations = registrations.length;
    const totalAttendance = registrations.filter((r) => r.checkedIn).length;

    const completedPayments = payments.filter((p) => p.status === "COMPLETED");
    const totalRevenue = completedPayments.reduce((sum: number, p) => sum + p.amount, 0);

    const usersByRole: Record<string, number> = {};
    users.forEach((u) => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    const eventsByStatus: Record<string, number> = {};
    events.forEach((e) => {
      eventsByStatus[e.status] = (eventsByStatus[e.status] || 0) + 1;
    });

    const trainingStats: Record<string, number> = {};
    enrollments.forEach((e) => {
      trainingStats[e.status] = (trainingStats[e.status] || 0) + 1;
    });

    const avgAttendanceRate =
      totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

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
          pending: payments.filter((p) => p.status === "PENDING").length,
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
