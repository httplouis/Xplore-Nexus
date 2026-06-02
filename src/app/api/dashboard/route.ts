import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapEventToClient } from "@/lib/db-mappers";
import { EventStatus, MeetingStatus, TrainingStatus } from "@prisma/client";
import type { ApiSuccess, DashboardData } from "@/types";

export const dynamic = 'force-dynamic';

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data });
}

// GET /api/dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "u-001";

    // 1. Fetch upcoming events
    const dbUpcomingEvents = await prisma.event.findMany({
      where: {
        status: EventStatus.UPCOMING,
        date: { gte: new Date() },
      },
      include: {
        organizer: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 3,
    });

    const upcomingEvents = dbUpcomingEvents.map((e) => mapEventToClient(e, userId));

    // 2. Fetch user's training progress
    const dbEnrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        status: TrainingStatus.IN_PROGRESS,
        progress: { gt: 0 },
      },
      include: {
        training: true,
      },
      take: 3,
    });

    const colors = ["#8B1A1A", "#16a34a", "#d97706", "#7c3aed", "#0284c7"];
    const trainingProgress = dbEnrollments.map((en, idx) => ({
      id: en.trainingId,
      title: en.training.title,
      progress: en.progress,
      progressColor: colors[idx % colors.length],
    }));

    // 3. Fetch live session (meeting)
    const liveSessionMeeting = await prisma.meeting.findFirst({
      where: {
        status: MeetingStatus.LIVE,
      },
      include: {
        host: true,
      },
    });

    // 4. Calculate KPI metrics
    const totalEvents = await prisma.event.count();
    
    const activeTrainings = await prisma.enrollment.count({
      where: {
        userId,
        status: TrainingStatus.IN_PROGRESS,
      },
    });

    const completedEvents = await prisma.event.count({
      where: {
        status: EventStatus.COMPLETED,
      },
    });

    const completedTrainings = await prisma.enrollment.count({
      where: {
        userId,
        status: TrainingStatus.COMPLETED,
      },
    });

    // 5. Compute average fill rate (attendance rate)
    const allEvents = await prisma.event.findMany({
      select: {
        registrationCount: true,
        maxParticipants: true,
      },
    });

    let attendanceRate = 0;
    if (allEvents.length > 0) {
      const totalFillPct = allEvents.reduce((acc, e) => {
        const pct = e.maxParticipants > 0 ? (e.registrationCount / e.maxParticipants) * 100 : 0;
        return acc + pct;
      }, 0);
      attendanceRate = Math.round(totalFillPct / allEvents.length);
    }

    // 6. Compute engagement score (completed or in progress enrollments / total enrollments)
    const totalEnrollments = await prisma.enrollment.count({
      where: { userId },
    });
    
    const activeOrCompletedEnrollments = await prisma.enrollment.count({
      where: {
        userId,
        status: {
          in: [TrainingStatus.IN_PROGRESS, TrainingStatus.COMPLETED],
        },
      },
    });

    const engagementScore = totalEnrollments > 0 
      ? Math.round((activeOrCompletedEnrollments / totalEnrollments) * 100)
      : 0;

    const dashboard: DashboardData = {
      kpi: {
        totalEvents,
        activeTrainings,
        attendanceRate,
        engagementScore,
        eventsGrowth: completedEvents > 0 ? Math.round(((totalEvents - completedEvents) / completedEvents) * 100) : 10,
        trainingsGrowth: completedTrainings > 0 ? Math.round((activeTrainings / completedTrainings) * 100) : 5,
        attendanceGrowth: Math.max(2, Math.min(15, Math.round(attendanceRate / 10))),
        engagementGrowth: Math.max(3, Math.min(20, Math.round(engagementScore / 8))),
      },
      upcomingEvents,
      trainingProgress,
      liveSession: liveSessionMeeting
        ? {
            id: liveSessionMeeting.id,
            title: liveSessionMeeting.title,
            type: "Meeting",
            presenterId: liveSessionMeeting.hostId,
            presenterName: `${liveSessionMeeting.host.firstName} ${liveSessionMeeting.host.lastName}`,
            participantCount: liveSessionMeeting.participantCount,
            minutesRemaining: Math.max(
              5,
              liveSessionMeeting.duration - Math.floor((Date.now() - new Date(liveSessionMeeting.date).getTime()) / 60000)
            ),
          }
        : null,
    };

    return ok(dashboard);
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}
