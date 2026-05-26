"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Clock, LayoutGrid, Award, Play, CheckCircle2,
  Loader2, GraduationCap, Users, ChevronRight, Lock, Unlock,
} from "lucide-react";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

// ── Types ────────────────────────────────────────────────────────────────────────
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  completed: boolean;
  locked: boolean;
}

interface TrainingDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  hours: number;
  modules: TrainingModule[];
  progress: number;
  progressColor: string;
  enrolled: boolean;
  completed: boolean;
}

const STORE_KEY = "xplore_trainings";
const PROGRESS_KEY = "xplore_training_progress";

function generateModules(trainingId: string, count: number, progressPct: number): TrainingModule[] {
  const completedCount = Math.floor((progressPct / 100) * count);
  return Array.from({ length: count }, (_, i) => ({
    id: `${trainingId}-mod-${i + 1}`,
    title: [
      "Introduction & Overview",
      "Core Concepts and Principles",
      "Practical Applications",
      "Case Studies",
      "Tools & Techniques",
      "Advanced Strategies",
      "Integration & Workflow",
      "Best Practices",
      "Hands-on Exercise",
      "Assessment & Review",
      "Real-World Projects",
      "Final Certification Prep",
      "Guest Lecture",
      "Group Workshop",
      "Capstone Project",
      "Industry Insights",
      "Q&A and Discussion",
      "Summary & Next Steps",
    ][i % 18],
    description: "An in-depth module covering key concepts with practical exercises and real-world examples.",
    duration: [15, 20, 25, 30][i % 4],
    completed: i < completedCount,
    locked: i > completedCount, // next unlocked, rest locked
  }));
}

function getTrainingDetail(id: string): TrainingDetail | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as Array<{
      id: string; title: string; category: string; description: string;
      instructor: string; hours: number; modules: number;
      progress: number; progressColor: string; enrolled: boolean; completed: boolean;
    }>;
    const t = list.find((x) => x.id === id);
    if (!t) return null;
    const progKey = `${PROGRESS_KEY}_${id}`;
    let mods: TrainingModule[];
    try {
      const saved = localStorage.getItem(progKey);
      mods = saved ? JSON.parse(saved) : generateModules(id, t.modules, t.progress);
    } catch {
      mods = generateModules(id, t.modules, t.progress);
    }
    return { ...t, modules: mods };
  } catch { return null; }
}

export default function TrainingDetailPage({ params }: { params: { id: string } }) {
  const { user, canManage, isInstructor } = useRole();
  const router = useRouter();
  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getTrainingDetail(params.id);
    setTraining(t);
    setLoading(false);
  }, [params.id]);

  function saveModules(modules: TrainingModule[]) {
    const progKey = `${PROGRESS_KEY}_${params.id}`;
    localStorage.setItem(progKey, JSON.stringify(modules));
    // Recalculate overall progress
    const completed = modules.filter((m) => m.completed).length;
    const pct = Math.round((completed / modules.length) * 100);
    // Update master training list
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const next = list.map((t: { id: string }) => t.id === params.id ? { ...t, progress: pct, completed: pct === 100 } : t);
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    }
    return pct;
  }

  function handleCompleteModule(moduleId: string) {
    if (!training) return;
    const mods = training.modules.map((m, i, arr) => {
      if (m.id === moduleId) return { ...m, completed: true };
      // Unlock next
      const prev = arr[i - 1];
      if (prev?.id === moduleId) return { ...m, locked: false };
      return m;
    });
    const pct = saveModules(mods);
    const allDone = pct === 100;
    setTraining({ ...training, modules: mods, progress: pct, completed: allDone });
    showToast(allDone ? "🎉 Course completed! Certificate available." : "Module completed!", "success");
  }

  function handleEnroll() {
    if (!training) return;
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      localStorage.setItem(STORE_KEY, JSON.stringify(list.map((t: { id: string }) => t.id === params.id ? { ...t, enrolled: true } : t)));
    }
    setTraining({ ...training, enrolled: true });
    showToast("Enrolled successfully!", "success");
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
    </div>
  );

  if (!training) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-gray-600 font-semibold">Training not found</p>
      <Link href="/training" className="flex items-center gap-1.5 text-sm font-medium text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Training
      </Link>
    </div>
  );

  const completedCount = training.modules.filter((m) => m.completed).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/training" className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Training
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{training.title}</span>
      </div>

      {/* Hero */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(to right, ${training.progressColor}, ${training.progressColor}88)` }} />
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#8B1A1A] bg-red-50 px-2.5 py-0.5 rounded-full">{training.category}</span>
              <h1 className="text-2xl font-display font-bold text-gray-900 leading-tight">{training.title}</h1>
              <p className="text-gray-500 text-sm leading-relaxed">{training.description}</p>
            </div>
            {training.completed && (
              <div className="flex-shrink-0">
                <Link href={`/training/${params.id}/certificates`}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                  <Award className="w-4 h-4" /> View Certificate
                </Link>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: "Total Hours", value: `${training.hours}h` },
              { icon: LayoutGrid, label: "Modules", value: `${training.modules.length}` },
              { icon: CheckCircle2, label: "Completed", value: `${completedCount}/${training.modules.length}` },
              { icon: Users, label: "Instructor", value: training.instructor },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {training.enrolled && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500">Overall Progress</span>
                <span className="text-xs font-bold text-gray-800">{training.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${training.progress}%`, backgroundColor: training.progressColor }} />
              </div>
            </div>
          )}

          {/* Enroll / Actions */}
          {!training.enrolled && (
            <div className="flex items-center gap-3">
              <button onClick={handleEnroll}
                className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                <BookOpen className="w-4 h-4" /> Enroll Now — Free
              </button>
            </div>
          )}
          {(canManage || isInstructor) && (
            <div className="flex items-center gap-2 pt-1">
              <Link href={`/training/${params.id}/modules`}
                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <LayoutGrid className="w-4 h-4" /> Manage Modules
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modules list */}
      {training.enrolled && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-display font-bold text-gray-900">Course Modules</h2>
            <p className="text-xs text-gray-400 mt-0.5">{completedCount} of {training.modules.length} completed</p>
          </div>
          <div className="divide-y divide-gray-50">
            {training.modules.map((mod, idx) => (
              <div key={mod.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${mod.locked ? "opacity-50" : "hover:bg-gray-50/50"}`}>
                {/* Index / check */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${mod.completed ? "bg-green-100 text-green-700" : mod.locked ? "bg-gray-100 text-gray-400" : "bg-red-50 text-[#8B1A1A]"}`}>
                  {mod.completed ? <CheckCircle2 className="w-4 h-4" /> : mod.locked ? <Lock className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{mod.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mod.duration} min</p>
                </div>
                {!mod.locked && (
                  <button
                    onClick={() => mod.completed ? showToast("Module already completed!", "info") : handleCompleteModule(mod.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${mod.completed ? "bg-green-50 text-green-700" : "bg-[#8B1A1A] text-white hover:bg-[#7B1414]"}`}>
                    {mod.completed ? <><CheckCircle2 className="w-3 h-3" /> Done</> : <><Play className="w-3 h-3" /> Start</>}
                  </button>
                )}
                {mod.locked && <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                {!mod.locked && <Unlock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate teaser */}
      {training.enrolled && !training.completed && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Certificate of Completion</p>
            <p className="text-xs text-amber-600 mt-0.5">Complete all {training.modules.length} modules to unlock your certificate.</p>
          </div>
          <div className="ml-auto text-xs font-bold text-amber-700">{training.progress}%</div>
        </div>
      )}
    </div>
  );
}
