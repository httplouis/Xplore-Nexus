"use client";

import { Users, Calendar, TrendingUp, Award, ChevronDown } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

const kpiCards = [
  { label: "Total Participants", value: "1,284", trend: "+12%", icon: Users },
  { label: "Events Hosted",      value: "24",    trend: "+8%",  icon: Calendar },
  { label: "Avg. Attendance",    value: "87%",   trend: "+5%",  icon: TrendingUp },
  { label: "Certifications",     value: "156",   trend: "+15%", icon: Award },
];

// Mocked attendance data points for line chart
const attendanceData = [72, 75, 68, 78, 82, 85, 90];
const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

// Engagement distribution (pie segments)
const engagementData = [
  { label: "Events",   pct: 45, color: "#8B1A1A" },
  { label: "Meetings", pct: 30, color: "#16a34a" },
  { label: "Training", pct: 25, color: "#d97706" },
];

// Training completion rates
const completionRates = [
  { category: "Marketing",   pct: 82, color: "#8B1A1A" },
  { category: "Management",  pct: 68, color: "#16a34a" },
  { category: "Analytics",   pct: 74, color: "#d97706" },
  { category: "Leadership",  pct: 91, color: "#7c3aed" },
];

// Simple SVG line chart helper
function LineChart() {
  const width = 500;
  const height = 120;
  const padX = 30;
  const padY = 10;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const allVals = attendanceData;
  const min = Math.min(...allVals) - 10;
  const max = 100;
  const points = allVals.map((v, i) => {
    const x = padX + (i / (allVals.length - 1)) * chartW;
    const y = padY + ((max - v) / (max - min)) * chartH;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 130 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padY + ((max - v) / (max - min)) * chartH;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padX - 4} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {/* X labels */}
      {months.map((m, i) => {
        const x = padX + (i / (months.length - 1)) * chartW;
        return (
          <text key={m} x={x} y={height - 2} fontSize="9" fill="#9ca3af" textAnchor="middle">{m}</text>
        );
      })}
      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B1A1A" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8B1A1A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padX},${height - padY} ${points.join(" ")} ${width - padX},${height - padY}`}
        fill="url(#areaGrad)"
      />
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#8B1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {points.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#8B1A1A" stroke="white" strokeWidth="1.5" />
        );
      })}
    </svg>
  );
}

// Simple SVG donut chart
function DonutChart() {
  const cx = 80, cy = 80, r = 55, strokeW = 26;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segs = engagementData.map((d) => {
    const dash = (d.pct / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...d, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segs.map((s) => (
          <circle
            key={s.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 80 80)"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1f2937">Engagement</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#6b7280">Distribution</text>
      </svg>
      <div className="space-y-2">
        {engagementData.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-gray-600">{d.label}: <strong className="text-gray-900">{d.pct}%</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["Admin", "Organizer"]}>
      <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track performance and engagement metrics</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
          Last 6 months
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-display font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </p>
                </div>
                <div className="bg-red-50 p-2.5 rounded-lg">
                  <Icon className="w-5 h-5 text-[#8B1A1A]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance trend — takes 2 cols */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-display font-bold text-gray-900 text-base mb-1">Attendance Trend</h2>
          <p className="text-xs text-gray-500 mb-4">Monthly attendance rate over time</p>
          <LineChart />
          <p className="text-center text-xs text-gray-400 mt-2">← Attendance %</p>
        </div>

        {/* Engagement distribution */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-display font-bold text-gray-900 text-base mb-1">Engagement Distribution</h2>
          <p className="text-xs text-gray-500 mb-4">Participation across different activities</p>
          <DonutChart />
        </div>
      </div>

      {/* Training Completion Rate */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <h2 className="font-display font-bold text-gray-900 text-base mb-1">Training Completion Rate</h2>
        <p className="text-xs text-gray-500 mb-5">Completion status by category</p>
        <div className="space-y-4">
          {completionRates.map((cr) => (
            <div key={cr.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{cr.category}</span>
                <span className="text-sm font-bold text-gray-900">{cr.pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${cr.pct}%`, backgroundColor: cr.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
