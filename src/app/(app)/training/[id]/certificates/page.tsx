"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Download, CheckCircle2, Loader2, BookOpen, Lock } from "lucide-react";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

const STORE_KEY = "xplore_trainings";

interface TrainingInfo {
  id: string; title: string; category: string; instructor: string;
  hours: number; progress: number; completed: boolean; progressColor: string;
}

function getTraining(id: string): TrainingInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as TrainingInfo[];
    return list.find((t) => t.id === id) ?? null;
  } catch { return null; }
}

export default function CertificatePage({ params }: { params: { id: string } }) {
  const { user, canManage, isInstructor } = useRole();
  const [training, setTraining] = useState<TrainingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const canIssue = canManage || isInstructor;

  useEffect(() => { setTraining(getTraining(params.id)); setLoading(false); }, [params.id]);

  function handleDownload() {
    setPrinting(true);
    showToast("Opening print dialog…", "info");
    setTimeout(() => { window.print(); setPrinting(false); }, 300);
  }

  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const participantName = user ? `${user.firstName} ${user.lastName}` : "Participant";

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>;
  if (!training) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <BookOpen className="w-8 h-8 text-gray-400" />
      <p className="text-gray-600 font-semibold">Training not found</p>
      <Link href="/training" className="text-sm text-[#8B1A1A] hover:underline">Back to Training</Link>
    </div>
  );

  const isLocked = !training.completed && !canIssue;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/training/${params.id}`} className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> {training.title}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Certificate</span>
      </div>

      {isLocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-amber-800 font-bold text-lg">Certificate Locked</p>
          <p className="text-amber-600 text-sm">Complete all modules to unlock your certificate.</p>
          <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2">
            <span className="text-amber-700 font-bold text-sm">{training.progress}% complete</span>
          </div>
          <Link href={`/training/${params.id}`} className="block bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
            Continue Learning
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Certificate of Completion</h1>
              <p className="text-sm text-gray-500 mt-0.5">Ready to download and share</p>
            </div>
            <button onClick={handleDownload} disabled={printing}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm print:hidden">
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {printing ? "Opening…" : "Download PDF"}
            </button>
          </div>

          <div className="bg-white border-2 border-[#8B1A1A]/20 rounded-3xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#8B1A1A] via-red-400 to-amber-400" />
            <div className="px-12 py-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B22234] to-[#7A0010] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7A0010]/30">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="5" r="3" fill="white" fillOpacity="0.9"/>
                    <circle cx="5" cy="20" r="3" fill="white" fillOpacity="0.9"/>
                    <circle cx="23" cy="20" r="3" fill="white" fillOpacity="0.9"/>
                    <line x1="14" y1="5" x2="5" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
                    <line x1="14" y1="5" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
                    <line x1="5" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
                    <circle cx="14" cy="14" r="2.5" fill="white"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-1">Xplore Nexus</p>
                <p className="text-xs text-gray-400 tracking-widest uppercase">Certificate of Completion</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">This is to certify that</p>
                <p className="text-3xl font-display font-bold text-gray-900">{participantName}</p>
                <p className="text-sm text-gray-500">has successfully completed</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl px-8 py-5 border border-red-100">
                <p className="text-xl font-display font-bold text-[#8B1A1A]">{training.title}</p>
                <p className="text-sm text-gray-500 mt-2">{training.category} · {training.hours} Hours · Instructor: {training.instructor}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 rounded-full px-5 py-2 w-fit mx-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">100% Course Completion</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                <div className="text-left">
                  <p className="text-xs text-gray-400">Date Issued</p>
                  <p className="font-semibold text-gray-800">{today}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#8B1A1A]" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Issued by</p>
                  <p className="font-semibold text-gray-800">Xplore Philippines Inc.</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-amber-400 via-red-400 to-[#8B1A1A]" />
          </div>
        </>
      )}
    </div>
  );
}
