"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Play, CheckCircle2, BookOpen,
  FileText, MessageSquare, List, Download, Calendar,
  Users, BarChart3, GraduationCap, Settings, ChevronLeft, ChevronRight, FileQuestion,
  LayoutDashboard, Video, Radio, Bell, SkipForward
} from "lucide-react";
import { MicrosoftIcon, ExcelIcon } from "@/components/icons/MicrosoftIcon";

interface CourseData {
  id: string;
  title: string;
  duration: string;
  description: string;
  objectives: string[];
  transcript: string;
  prerequisites: string;
  level: string;
  code: string;
  lastUpdated: string;
}

const COURSE_DATA: CourseData = {
  id: "l1-1",
  title: "Getting started in Excel 365 (2023)",
  duration: "43m 30s",
  description: `Microsoft Excel 365 is a powerful spreadsheet application that can help you organize, analyze, and present data. This course introduces you to the fundamental skills you need to start using the app. First, you will see how to open Excel and navigate its interface. You will also learn how to input and edit worksheet data, as well as insert and remove worksheets, columns, rows, and cells. Next, the course teaches you how to save your work and open saved spreadsheets. In addition, you will learn how to remove data from a worksheet, as well as how to undo and redo actions as you edit. Finally, discover how to find and use basic functions to manipulate spreadsheet data. See also how to create a worksheet from a template, customize the application interface, and share your worksheets with other users.

This course aligns with the objectives of Exam MO-210: Microsoft Excel (Microsoft 365 Apps).

In order to practice what you have learned, you will find practice exercises and samples in the Course Contents pane.`,
  objectives: [
    "discover the key concepts covered in the Getting started in Excel 365 course",
    "open Excel in a new workbook and navigate the interface",
    "enter, edit, and remove spreadsheet data",
    "save and open workbooks",
    "insert and delete worksheets, columns, rows, and cells",
    "undo, redo, and repeat actions while editing a spreadsheet",
    "insert functions using the Function Library and Insert Function tool",
    "find, open, and use Office online templates",
    "configure user interface tools and customize the Status Bar",
    "share workbooks via OneDrive and send a copy by email"
  ],
  transcript: `Excel is a useful tool that will save your time and effort. This video outlines the fundamentals covered in the Getting Started in Excel 365 course to help you navigate and explore the user-friendly interface in Excel.`,
  prerequisites: "None",
  level: "Beginner",
  code: "ds_m365ex_01_enus",
  lastUpdated: "March 11, 2026"
};

export default function CoursePlayerPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSidebar, setShowSidebar] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [fullTranscript, setFullTranscript] = useState("");
  const [showSamplesPanel, setShowSamplesPanel] = useState(false);
  const [currentLesson, setCurrentLesson] = useState("overview");
  // Video mapping for lessons 1-10
  const lessonVideoMap: { [key: string]: string } = {
    "overview": "/vids/1.mp4",
    "exploring": "/vids/2.mp4",
    "editing": "/vids/3.mp4",
    "saving": "/vids/4.mp4",
    "adding": "/vids/5.mp4",
    "undoing": "/vids/6.mp4",
    "finding": "/vids/7.mp4",
    "templates": "/vids/8.mp4",
    "customizing": "/vids/9.mp4",
    "sharing": "/vids/10.mp4"
  };

  const hasVideo = lessonVideoMap[currentLesson] !== undefined;
  const videoSource = lessonVideoMap[currentLesson] || "/vids/1.mp4";


  useEffect(() => {
    if (params.lessonId) {
      setCurrentLesson(params.lessonId);
      if (params.lessonId === "samples" || params.lessonId === "exercise" || 
          params.lessonId === "knowledge-check-1" || params.lessonId === "knowledge-check-2" ||
          params.lessonId === "retake-test" || params.lessonId === "reflection") {
        setShowSamplesPanel(true);
      } else {
        setShowSamplesPanel(false);
      }
    }
  }, [params.lessonId]);

  const handleLessonChange = (lessonId: string, isSamples: boolean = false) => {
    setCurrentLesson(lessonId);
    const specialPanelLessons = ["samples", "exercise", "knowledge-check-1", "knowledge-check-2", "retake-test", "reflection"];
    setShowSamplesPanel(isSamples || specialPanelLessons.includes(lessonId));
    setActiveTab("overview");
    router.push(`/course/${lessonId}`);
  };

  useEffect(() => {
    fetch('/transcript/1.txt')
      .then(response => response.text())
      .then(data => setFullTranscript(data))
      .catch(error => console.error('Error loading transcript:', error));
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Video, label: "Meetings", href: "/meetings" },
    { icon: Radio, label: "Live", href: "/stream" },
    { icon: GraduationCap, label: "Training", href: "/training" },
    { icon: BookOpen, label: "Programs", href: "/programs" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Bell, label: "Notifs", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "Q&A", icon: MessageSquare },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "transcript", label: "Transcript", icon: List },
    { id: "resources", label: "Resources", icon: Download },
  ];

  return (
    <div className="fixed inset-0 bg-gray-950 flex z-50">
      <aside className={navCollapsed ? "bg-[#1a0505] border-r border-[#3d1515] transition-all duration-300 flex flex-col w-[60px]" : "bg-[#1a0505] border-r border-[#3d1515] transition-all duration-300 flex flex-col w-[140px]"}>
        <div className="px-3 py-4 border-b border-[#3d1515] flex flex-col items-center gap-2">
          {!navCollapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center mb-1">
              <Image src="/xplorenexus-logo.png" alt="Xplore Nexus" width={108} height={39} priority className="object-contain" />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7B1414] to-[#5d0f0f] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">X</span>
              </div>
            </Link>
          )}
          <button onClick={() => setNavCollapsed(!navCollapsed)} className="p-1 hover:bg-[#2d0a0a] rounded-lg transition-colors">
            {navCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/training";
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg text-xs font-medium transition-all duration-150 w-full text-center ${isActive ? "bg-[#7B1414] text-white" : "text-slate-400 hover:bg-[#2d0a0a] hover:text-white"}`} title={navCollapsed ? item.label : ""}>
                <Icon className="w-5 h-5 shrink-0" />
                {!navCollapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-50">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/training" className="text-gray-400 hover:text-white transition-colors">Training</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/training" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
              <MicrosoftIcon className="w-4 h-4" />
              Microsoft Excel 365
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-300">Getting started in Excel 365</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">8/15</span>
            <button className="flex items-center gap-2 bg-[#005691] hover:bg-[#004070] text-white text-xs font-semibold px-4 py-2 rounded transition-colors">
              Next Item
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {showSidebar && (
          <div className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white text-sm">Course Contents</h3>
            </div>
            
            <div className="p-3 space-y-1">
              <button onClick={() => handleLessonChange("overview", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "overview" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="font-medium">Overview: Getting started in Excel 365 (2023)</span>
                </div>
                <span className={`text-xs ${currentLesson === "overview" ? "text-blue-200" : "text-gray-500"}`}>55s</span>
              </button>

              <button onClick={() => handleLessonChange("samples", true)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "samples" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="font-medium">Getting started in Excel 365 Samples</span>
                </div>
              </button>

              <button onClick={() => handleLessonChange("exploring", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "exploring" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="font-medium">Exploring the interface in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "exploring" ? "text-blue-200" : "text-gray-500"}`}>4m 46s</span>
              </button>

              <button onClick={() => handleLessonChange("editing", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "editing" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="font-medium">Editing worksheets in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "editing" ? "text-blue-200" : "text-gray-500"}`}>4m 41s</span>
              </button>

              <button onClick={() => handleLessonChange("saving", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "saving" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="font-medium">Saving & opening workbooks in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "saving" ? "text-blue-200" : "text-gray-500"}`}>4m 45s</span>
              </button>

              <button onClick={() => handleLessonChange("adding", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "adding" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="font-medium">Adding & removing workbook elements in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "adding" ? "text-blue-200" : "text-gray-500"}`}>4m 35s</span>
              </button>

              <button onClick={() => handleLessonChange("knowledge-check-1", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "knowledge-check-1" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Knowledge Check: Getting started in Excel 365 (2023)</span>
                </div>
              </button>

              <button onClick={() => handleLessonChange("undoing", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "undoing" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-3 h-3" />
                  <span className="font-medium">Undoing and redoing actions in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "undoing" ? "text-blue-200" : "text-gray-500"}`}>4m 8s</span>
              </button>

              <button onClick={() => handleLessonChange("finding", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "finding" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-3 h-3" />
                  <span className="font-medium">Finding functions in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "finding" ? "text-blue-200" : "text-gray-500"}`}>5m 3s</span>
              </button>

              <button onClick={() => handleLessonChange("templates", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "templates" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-3 h-3" />
                  <span className="font-medium">Using Office templates in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "templates" ? "text-blue-200" : "text-gray-500"}`}>4m 48s</span>
              </button>

              <button onClick={() => handleLessonChange("customizing", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "customizing" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-3 h-3" />
                  <span className="font-medium">Customizing interface tools in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "customizing" ? "text-blue-200" : "text-gray-500"}`}>5m 4s</span>
              </button>

              <button onClick={() => handleLessonChange("sharing", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "sharing" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="font-medium">Sharing workbooks in Excel 365</span>
                </div>
                <span className={`text-xs ${currentLesson === "sharing" ? "text-blue-200" : "text-gray-500"}`}>4m 46s</span>
              </button>

              <button onClick={() => handleLessonChange("exercise", true)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "exercise" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="font-medium">Exercise: Getting started in Excel 365</span>
                </div>
              </button>

              <button onClick={() => handleLessonChange("knowledge-check-2", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "knowledge-check-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Knowledge Check: Using tools in Excel 365 (2023)</span>
                </div>
              </button>

              <button onClick={() => handleLessonChange("retake-test", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "retake-test" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                  <span className="font-medium">Retake Test</span>
                </div>
              </button>

              <button onClick={() => handleLessonChange("reflection", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "reflection" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Reflection: Reflect on what you&apos;ve learned</span>
                </div>
              </button>
            </div>
          </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {!showSamplesPanel && hasVideo && (
            <div className="bg-black flex items-center justify-center" style={{ height: "40vh" }}>
              <div className="relative w-full h-full">
                <video key={currentLesson} className="w-full h-full object-contain" controls controlsList="nodownload">
                  <source src={videoSource} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            )}

            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {!showSamplesPanel && (
              <div className="border-b border-gray-200 bg-white">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-[#005691] text-[#005691]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {showSamplesPanel ? (
                  <div className="h-full">
                    {/* Samples Panel */}
                    {currentLesson === "samples" && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="max-w-4xl mx-auto px-8 py-16">
                          <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <ExcelIcon className="w-10 h-10" />
                              <h1 className="text-3xl font-bold text-gray-900">Getting started in Excel 365 Samples</h1>
                            </div>
                            <p className="text-base text-gray-500 font-medium">Zip File</p>
                          </div>
                          
                          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 mb-8">
                            <div className="text-center mb-10">
                              <p className="text-gray-700 leading-relaxed text-base max-w-2xl mx-auto">
                                Download the .ZIP file and extract the sample files to follow along with the videos for this 
                                course. Samples are available for all videos that require a sample file. File names correspond to 
                                video titles.
                              </p>
                            </div>

                            <div className="flex justify-center mb-6">
                              <a href="/1zip/Getting+started+in+Excel+365_Samples.zip" download="Getting started in Excel 365 Samples.zip" className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#005691] hover:bg-[#004070] text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                                <Download className="w-5 h-5" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exercise Panel */}
                    {currentLesson === "exercise" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-16">
                          <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <ExcelIcon className="w-10 h-10" />
                              <h1 className="text-3xl font-bold text-gray-900">Exercise: Getting started in Excel 365</h1>
                            </div>
                            <p className="text-base text-gray-500 font-medium">Zip File</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 p-10 mb-8">
                            <div className="flex justify-center mb-6">
                              <a href="/1zip/Exercise_Getting_started_in_Excel_365.zip" download="Exercise Getting started in Excel 365.zip" className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#005691] hover:bg-[#004070] text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                                <Download className="w-5 h-5" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check 1 Panel */}
                    {currentLesson === "knowledge-check-1" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">KNOWLEDGE CHECK</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your knowledge of Getting started in Excel 365 (2023)</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Let&apos;s see how much you&apos;ve learned before you continue or retake the course test! Knowledge checks allow you to practice, and are not scored.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005691] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading quiz content...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check 2 Panel */}
                    {currentLesson === "knowledge-check-2" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">KNOWLEDGE CHECK</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your knowledge of Using tools in Excel 365 (2023)</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Let&apos;s see how much you&apos;ve learned before you continue or retake the course test! Knowledge checks allow you to practice, and are not scored.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005691] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading quiz content...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Retake Test Panel */}
                    {currentLesson === "retake-test" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">TEST COMPLETED</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Retake Test</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              You have successfully completed the course test. You can retake the test to improve your score or review the course materials.
                            </p>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                            <div className="flex items-center gap-4 mb-4">
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">Congratulations!</h3>
                                <p className="text-sm text-gray-600">You have completed this course</p>
                              </div>
                            </div>
                            <button className="mt-4 bg-[#005691] hover:bg-[#004070] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
                              Retake Test
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reflection Panel */}
                    {currentLesson === "reflection" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reflect on what you&apos;ve learned (optional)</h1>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                              Your private reflections show only to you and no one else. <a href="#" className="text-[#005691] hover:underline">Access them later from your Notes and Reflections page</a> keeping company proprietary information out of your reflection is recommended.
                            </p>
                          </div>
                          
                          <div className="space-y-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="space-y-4 text-sm text-gray-700 mb-6">
                              <p><span className="font-semibold">1.</span> What was the most important, relevant thing you learned from taking the course?</p>
                              <p><span className="font-semibold">2.</span> What are some ways you can apply what you learned?</p>
                              <p><span className="font-semibold">3.</span> What&apos;s one thing the course inspired you to do differently moving forward?</p>
                              <p><span className="font-semibold">4.</span> How does what you learned fit in with what you already know? How is it new or different?</p>
                            </div>

                            <div className="space-y-3">
                              <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                <span>Your reflections</span>
                              </label>
                              <textarea 
                                placeholder="Add your thoughts..."
                                className="w-full min-h-[120px] p-3 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005691]/20 focus:border-[#005691]/30"
                              ></textarea>
                              <p className="text-xs text-gray-500 italic">
                                Please limit your reflection to 4000 characters (currently 0/4000). Use shortages to shiphrase.
                              </p>
                              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
                                Add Reflection
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-b border-gray-200 bg-white">
                      <div className="flex">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-[#005691] text-[#005691]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                              <Icon className="w-4 h-4" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-6 min-h-[500px]">
                      {activeTab === "overview" && (
                        <div className="max-w-4xl space-y-6">
                          <div>
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">{COURSE_DATA.description}</p>
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">For NASBA details, see Training Credits section below.</p>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Duration</h3>
                                <p className="text-sm text-gray-600">{COURSE_DATA.duration}</p>
                                <p className="text-xs text-gray-500">43 minutes 30 seconds</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Prerequisites</h3>
                                <p className="text-sm text-gray-600">{COURSE_DATA.prerequisites}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Expertise Level</h3>
                                <p className="text-sm text-gray-600">{COURSE_DATA.level}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Code</h3>
                                <p className="text-sm text-gray-600 font-mono">{COURSE_DATA.code}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Field of Study</h3>
                                <p className="text-sm text-gray-600">Computer Software & Applications ΓÇô Non-technical</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Last Updated</h3>
                                <p className="text-sm text-gray-600">{COURSE_DATA.lastUpdated}</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Credits</h3>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">NASBA Course Navigation & Resources:</h4>
                              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                <li>ΓÇó Course Index: See the Transcript tab above to navigate or search the course.</li>
                                <li>ΓÇó Glossary: See the Resources tab above to view or print a copy.</li>
                              </ul>
                            </div>
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">
                                <a href="#" className="text-[#005691] hover:underline">NASBA Course Evaluation</a>
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                <a href="#" className="text-[#005691] hover:underline">NASBA CPE Information and FAQ</a>
                              </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">NASBA Continuing Professional Education (CPE)</h4>
                              <p className="text-sm text-gray-700 mb-2">1.5 credits</p>
                              <p className="text-sm text-gray-600 mb-3">To qualify for CPE credits:</p>
                              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                <li>ΓÇó Complete all videos and Knowledge Checks</li>
                                <li>ΓÇó Receive a minimum passing score of 70%</li>
                                <li>ΓÇó Complete course within one year of starting it</li>
                              </ul>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectives</h3>
                            <ul className="space-y-2">
                              {COURSE_DATA.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-[#005691] shrink-0 mt-0.5" />
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab === "qa" && (
                        <div className="max-w-4xl">
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions and Answers</h2>
                          <p className="text-sm text-gray-600 mb-6">
                            Have a question about the content in this course? Post it below to get help from AI or from someone in your organization.
                          </p>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No questions yet</p>
                            <button className="mt-4 bg-[#005691] hover:bg-[#004070] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                              Ask Question
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === "notes" && (
                        <div className="max-w-4xl">
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                          <div className="flex items-center gap-3 mb-6">
                            <button className="bg-[#005691] hover:bg-[#004070] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                              Take note
                            </button>
                            <button className="text-[#005691] hover:text-[#004070] text-sm font-semibold transition-colors">
                              Generate notes with AI Assistant
                            </button>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                              Notes you add while learning display here. Taking notes help you remember important concepts and future applications.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "transcript" && (
                        <div className="max-w-4xl space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
                            <button className="text-[#005691] hover:text-[#004070] text-sm font-semibold flex items-center gap-1 transition-colors">
                              View full transcript
                              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                            </button>
                          </div>
                          <div className="relative mb-4">
                            <input
                              type="text"
                              placeholder="Search Transcript"
                              className="w-full pl-4 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005691]/20 focus:border-[#005691]/30"
                            />
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ wordSpacing: '0.15em' }}>
                              {fullTranscript || COURSE_DATA.transcript}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "resources" && (
                        <div className="max-w-4xl">
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">Microsoft 365 Glossary</span>
                              </div>
                              <button className="text-[#005691] hover:text-[#004070] text-sm font-semibold transition-colors">
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 min-h-[500px]">
                    {activeTab === "overview" && (
                      <div className="max-w-4xl space-y-6">
                        <div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-4">{COURSE_DATA.description}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">Duration</h3>
                              <p className="text-sm text-gray-600">{COURSE_DATA.duration}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">Prerequisites</h3>
                              <p className="text-sm text-gray-600">{COURSE_DATA.prerequisites}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">Expertise Level</h3>
                              <p className="text-sm text-gray-600">{COURSE_DATA.level}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">Code</h3>
                              <p className="text-sm text-gray-600 font-mono">{COURSE_DATA.code}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectives</h3>
                          <ul className="space-y-2">
                            {COURSE_DATA.objectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-[#005691] shrink-0 mt-0.5" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === "qa" && (
                      <div className="max-w-4xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions and Answers</h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No questions yet</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div className="max-w-4xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No notes yet</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "transcript" && (
                      <div className="max-w-4xl space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 text-sm leading-relaxed">{fullTranscript || COURSE_DATA.transcript}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "resources" && (
                      <div className="max-w-4xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">Microsoft 365 Glossary</span>
                            </div>
                            <button className="text-[#005691] hover:text-[#004070] text-sm font-semibold transition-colors">Download</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
