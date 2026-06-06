"use client";

import { useMeeting } from "@/lib/context/MeetingContext";
import { Minimize2, Maximize2, PhoneOff, Video } from "lucide-react";

export default function MeetingFloatingControls() {
  const { activeMeeting, isMinimized, toggleMinimize, endMeeting } = useMeeting();

  if (!activeMeeting) return null;

  return (
    <div className="fixed bottom-4 left-[160px] z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div>
          <p className="text-white text-sm font-semibold">{activeMeeting.title}</p>
          <p className="text-gray-400 text-xs">Meeting in progress</p>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-700" />

      <button
        onClick={toggleMinimize}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-md transition-all"
        title={isMinimized ? "Expand" : "Minimize"}
      >
        {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        {isMinimized ? "Expand" : "Minimize"}
      </button>

      <button
        onClick={() => {
          if (confirm("Are you sure you want to leave this meeting?")) {
            endMeeting();
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-all"
        title="Leave meeting"
      >
        <PhoneOff className="w-3.5 h-3.5" />
        Leave
      </button>
    </div>
  );
}
