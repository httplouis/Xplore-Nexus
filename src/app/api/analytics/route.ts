import { NextResponse } from "next/server";
import type { ApiSuccess, AnalyticsDashboard } from "@/types";

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data });
}

// GET /api/analytics
export async function GET() {
  const dashboard: AnalyticsDashboard = {
    kpi: {
      totalParticipants: 1284,
      eventsHosted: 24,
      avgAttendance: 87,
      certifications: 156,
      participantGrowth: 12,
      eventsGrowth: 8,
      attendanceGrowth: 5,
      certificationsGrowth: 15,
    },
    attendanceTrend: [
      { month: "Oct", value: 72 },
      { month: "Nov", value: 75 },
      { month: "Dec", value: 68 },
      { month: "Jan", value: 78 },
      { month: "Feb", value: 82 },
      { month: "Mar", value: 85 },
      { month: "Apr", value: 90 },
    ],
    engagement: [
      { label: "Events",   pct: 45, color: "#8B1A1A" },
      { label: "Meetings", pct: 30, color: "#16a34a" },
      { label: "Training", pct: 25, color: "#d97706" },
    ],
    completionRates: [
      { category: "Marketing",  pct: 82, color: "#8B1A1A" },
      { category: "Management", pct: 68, color: "#16a34a" },
      { category: "Analytics",  pct: 74, color: "#d97706" },
      { category: "Leadership", pct: 91, color: "#7c3aed" },
    ],
  };

  return ok(dashboard);
}
