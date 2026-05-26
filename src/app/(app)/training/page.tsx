"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Clock, LayoutGrid, BarChart2, Pencil, Award, Plus,
  Search, Filter, Play, CheckCircle2, Loader2, X, GraduationCap,
} from "lucide-react";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Training {
  id: string;
  category: string;
  title: string;
  description: string;
  hours: number;
  modules: number;
  progress: number;
  instructor: string;
  instructorId: string;
  completed: boolean;
  progressColor: string;
  enrolled: boolean;
}

// ─── Seed data ─────────────────────────────────────────────────────────────────
const SEED: Training[] = [
  {
    id: "tr-001", category: "Marketing", title: "Digital Marketing Fundamentals",
    description: "Master the essentials of digital marketing strategies and tools for modern platforms.",
    hours: 6, modules: 12, progress: 75, instructor: "Maria Santos", instructorId: "u-002",
    completed: false, progressColor: "#8B1A1A", enrolled: true,
  },
  {
    id: "tr-002", category: "Management", title: "Project Management Essentials",
    description: "Learn the core principles of effective project management and agile methodologies.",
    hours: 8, modules: 15, progress: 45, instructor: "John Reyes", instructorId: "u-003",
    completed: false, progressColor: "#16a34a", enrolled: true,
  },
  {
    id: "tr-003", category: "Analytics", title: "Data Analytics Bootcamp",
    description: "Transform data into actionable insights using modern analytics tools and techniques.",
    hours: 10, modules: 18, progress: 60, instructor: "Anna Cruz", instructorId: "u-004",
    completed: false, progressColor: "#d97706", enrolled: true,
  },
  {
    id: "tr-004", category: "Leadership", title: "Leadership Excellence Program",
    description: "Develop essential leadership skills for modern organizations and cross-functional teams.",
    hours: 5, modules: 10, progress: 100, instructor: "Robert Tan", instructorId: "u-005",
    completed: true, progressColor: "#7c3aed", enrolled: true,
  },
  {
    id: "tr-005", category: "Technology", title: "Cloud Computing Fundamentals",
    description: "Understand cloud platforms (AWS, Azure, GCP) and infrastructure-as-a-service models.",
    hours: 12, modules: 20, progress: 0, instructor: "Anna Cruz", instructorId: "u-004",
    completed: false, progressColor: "#0284c7", enrolled: false,
  },
  {
    id: "tr-006", category: "Communication", title: "Business Communication Mastery",
    description: "Enhance workplace communication, presentation, and stakeholder management skills.",
    hours: 4, modules: 8, progress: 0, instructor: "Maria Santos", instructorId: "u-002",
    completed: false, progressColor: "#be185d", enrolled: false,
  },
];

const STORE_KEY = "xplore_trainings";

function readTrainings(): Training[] {
  if (typeof window === "undefined") return SEED;
  try {
    const r = localStorage.getItem(STORE_KEY);
    return r ? JSON.parse(r) : (() => { localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; })();
  } catch { return SEED; }
}

function writeTrainings(t: Training[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORE_KEY, JSON.stringify(t));
}

// ─── Create Training Modal (Instructor / Admin only) ───────────────────────────
function CreateTrainingModal({ onClose, onCreated, instructorName }: {
  onClose: () => void;
  onCreated: (t: Training) => void;
  instructorName: string;
}) {
  const [form, setForm] = useState({ title: "", description: "", category: "Technology", hours: 4, modules: 8 });
  const [loading, setLoading] = useState(false);
  const colors = ["#8B1A1A", "#16a34a", "#d97706", "#7c3aed", "#0284c7", "#be185d"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API
    const newT: Training = {
      id: `tr-${Date.now()}`,
      ...form,
      instructor: instructorName,
      instructorId: "current",
      progress: 0,
      completed: false,
      progressColor: colors[Math.floor(Math.random() * colors.length)],
      enrolled: true,
    };
    onCreated(newT);
    showToast("Training program created!", "success");
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#8B1A1A]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-base">Create Training</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add a new training program to the catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course Title *</label>
            <input required type="text" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Advanced Excel for Analysts" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What will participants learn?" className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
              <select value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="input-field">
                {["Technology","Marketing","Management","Analytics","Leadership","Communication","Finance","HR"].map(c =>
                  <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Hours</label>
              <input type="number" min={1} max={100} value={form.hours}
                onChange={(e) => setForm((p) => ({ ...p, hours: Number(e.target.value) }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Modules</label>
              <input type="number" min={1} max={100} value={form.modules}
                onChange={(e) => setForm((p) => ({ ...p, modules: Number(e.target.value) }))}
                className="input-field" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500">
            Creating as instructor: <span className="font-semibold text-gray-700">{instructorName}</span>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
              {loading ? "Creating…" : "Create Training"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Training Card ──────────────────────────────────────────────────────────────
function TrainingCard({ training, canManage, isInstructor, onEnroll, onContinue, onEdit }: {
  training: Training;
  canManage: boolean;
  isInstructor: boolean;
  onEnroll: (id: string) => void;
  onContinue: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const router = useRouter();
  const isOwner = isInstructor || canManage;
  const showManage = isOwner;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="p-5 flex-1 space-y-4">
        {/* Category + badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-[#8B1A1A] bg-red-50 px-2 py-0.5 rounded-full">
            {training.category}
          </span>
          <div className="flex items-center gap-1.5">
            {showManage && <span className="badge-instructor">Instructor</span>}
            {training.completed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                <Award className="w-3 h-3" />Completed
              </span>
            )}
            {!training.enrolled && !training.completed && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                Not Enrolled
              </span>
            )}
          </div>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-display font-bold text-gray-900 text-base leading-tight">{training.title}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{training.description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />{training.hours} hours
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <LayoutGrid className="w-3.5 h-3.5" />{training.modules} modules
          </span>
        </div>

        {/* Progress (only if enrolled) */}
        {training.enrolled && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">Progress</span>
              <span className="text-xs font-bold text-gray-800">{training.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${training.progress}%`, backgroundColor: training.progressColor }} />
            </div>
          </div>
        )}

        {/* Instructor */}
        <p className="text-xs text-gray-500">
          Instructor: <span className="font-medium text-gray-700">{training.instructor}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        {showManage ? (
          <>
            <button
              onClick={() => onEdit(training.id)}
              className="w-full flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              <Pencil className="w-3.5 h-3.5" />Edit Course
            </button>
            <button
              onClick={() => router.push(`/app/analytics?trainingId=${training.id}`)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
              <BarChart2 className="w-3.5 h-3.5" />View Analytics
            </button>
          </>
        ) : training.enrolled ? (
          <button
            onClick={() => onContinue(training.id)}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
            {training.completed
              ? <><CheckCircle2 className="w-3.5 h-3.5" />Review Course</>
              : <><Play className="w-3.5 h-3.5" />Continue Learning</>}
          </button>
        ) : (
          <button
            onClick={() => onEnroll(training.id)}
            className="w-full flex items-center justify-center gap-2 border border-[#8B1A1A]/40 bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10 text-[#8B1A1A] text-sm font-semibold py-2.5 rounded-lg transition-colors">
            <BookOpen className="w-3.5 h-3.5" />Enroll Now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function TrainingPage() {
  const { user, canManage, isInstructor } = useRole();
  const [trainings, setTrainings] = useState<Training[]>(() => readTrainings());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Enrolled" | "Completed" | "Available">("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const router = useRouter();

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Instructor";
  const canCreate = canManage || isInstructor;

  // Filter
  const filtered = trainings.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.instructor.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All"       ? true :
      filter === "Enrolled"  ? t.enrolled && !t.completed :
      filter === "Completed" ? t.completed :
                               !t.enrolled;
    return matchSearch && matchFilter;
  });

  const enrolledCount   = trainings.filter((t) => t.enrolled && !t.completed).length;
  const completedCount  = trainings.filter((t) => t.completed).length;
  const availableCount  = trainings.filter((t) => !t.enrolled).length;

  function handleEnroll(id: string) {
    const next = trainings.map((t) => t.id === id ? { ...t, enrolled: true } : t);
    setTrainings(next);
    writeTrainings(next);
    showToast("Enrolled successfully!", "success");
  }

  function handleContinue(id: string) {
    const training = trainings.find(t => t.id === id);
    if (training) {
      setSelectedTraining(training);
      setShowModules(true);
    }
  }

  function handleEditTraining(id: string) {
    const training = trainings.find(t => t.id === id);
    if (training) {
      setSelectedTraining(training);
      setShowEdit(true);
    }
  }

  function handleViewAnalytics(id: string) {
    router.push(`/app/analytics?trainingId=${id}`);
  }

  function handleCreated(t: Training) {
    const next = [t, ...trainings];
    setTrainings(next);
    writeTrainings(next);
  }

  const FILTERS = ["All", "Enrolled", "Completed", "Available"] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {showCreate && (
        <CreateTrainingModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          instructorName={displayName}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Training</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {canCreate ? "Manage and create training programs" : "Enhance your skills with our training programs"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/20">
              <Plus className="w-4 h-4" />Create Training
            </button>
          ) : (
            <button
              onClick={() => showToast("Browse catalog coming soon!", "info")}
              className="flex items-center gap-2 border border-[#8B1A1A]/30 bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10 text-[#8B1A1A] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />Browse Catalog
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "In Progress",  count: enrolledCount,  color: "text-[#8B1A1A]",    bg: "bg-red-50 border-red-100",      dot: "bg-[#8B1A1A]" },
          { label: "Completed",    count: completedCount, color: "text-emerald-700",   bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
          { label: "Available",    count: availableCount, color: "text-gray-600",      bg: "bg-gray-50 border-gray-200",    dot: "bg-gray-400" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.bg}`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
            <div>
              <p className={`text-xl font-bold leading-none ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainings…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30" />
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? "bg-[#8B1A1A] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} courses</span>
      </div>

      {/* Training cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-semibold">No trainings found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TrainingCard
              key={t.id}
              training={t}
              canManage={canManage}
              isInstructor={isInstructor && t.instructorId === "u-004"}
              onEnroll={handleEnroll}
              onContinue={handleContinue}
              onEdit={handleEditTraining}
            />
          ))}
        </div>
      )}
    </div>
  );
}
