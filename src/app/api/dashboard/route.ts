import { NextResponse } from "next/server";
import type { ApiSuccess, DashboardData } from "@/types";
import { MOCK_EVENTS } from "@/lib/data/events";
import { MOCK_TRAININGS } from "@/lib/data/training";
import { MOCK_MEETINGS } from "@/lib/data/meetings";

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data });
}

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Average registration fill rate across all events (0-100) */
function computeAttendanceRate(): number {
  const events = MOCK_EVENTS.filter((e) => e.maxParticipants > 0);
  if (events.length === 0) return 0;
  const sum = events.reduce(
    (acc, e) => acc + (e.registrationCount / e.maxParticipants) * 100,
    0
  );
  return Math.round(sum / events.length);
}

/** Weighted engagement: % of trainings either completed or in-progress */
function computeEngagementScore(): number {
  if (MOCK_TRAININGS.length === 0) return 0;
  const engaged = MOCK_TRAININGS.filter(
    (t) => t.status === "Completed" || t.status === "In Progress"
  ).length;
  return Math.round((engaged / MOCK_TRAININGS.length) * 100);
}

// GET /api/dashboard
export async function GET() {
  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === "Upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const trainingProgress = MOCK_TRAININGS.filter((t) => !t.completed && t.progress > 0)
    .slice(0, 3)
    .map(({ id, title, progress, progressColor }) => ({ id, title, progress, progressColor }));

  const liveSession = MOCK_MEETINGS.find((m) => m.status === "Live") ?? null;

  const totalEvents      = MOCK_EVENTS.length;
  const activeTrainings  = MOCK_TRAININGS.filter((t) => t.status === "In Progress").length;
  const completedEvents  = MOCK_EVENTS.filter((e) => e.status === "Completed").length;
  const completedTrainings = MOCK_TRAININGS.filter((t) => t.status === "Completed").length;

  const dashboard: DashboardData = {
    kpi: {
      totalEvents,
      activeTrainings,
      attendanceRate:   computeAttendanceRate(),
      engagementScore:  computeEngagementScore(),
      // Growth: ratio of active vs completed (capped at reasonable bounds)
      eventsGrowth:     completedEvents > 0 ? Math.round(((totalEvents - completedEvents) / completedEvents) * 100) : 10,
      trainingsGrowth:  completedTrainings > 0 ? Math.round((activeTrainings / completedTrainings) * 100) : 5,
      attendanceGrowth: Math.max(2, Math.min(15, Math.round(computeAttendanceRate() / 10))),
      engagementGrowth: Math.max(3, Math.min(20, Math.round(computeEngagementScore() / 8))),
    },
    upcomingEvents,
    trainingProgress,
    liveSession: liveSession
      ? {
          id: liveSession.id,
          title: liveSession.title,
          type: "Meeting",
          presenterId: liveSession.hostId,
          presenterName: liveSession.hostName,
          participantCount: liveSession.participantCount,
          minutesRemaining: Math.max(
            5,
            liveSession.duration - Math.floor((Date.now() - new Date(liveSession.date).getTime()) / 60000)
          ),
        }
      : null,
  };

  return ok(dashboard);
}
