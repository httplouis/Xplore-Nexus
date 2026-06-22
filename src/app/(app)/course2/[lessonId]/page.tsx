"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Play, CheckCircle2, BookOpen,
  FileText, MessageSquare, List, Download, Calendar,
  Users, BarChart3, GraduationCap, Settings, ChevronLeft, ChevronRight,
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
  id: "course-1-2",
  title: "Entering data in Excel 365 (2023)",
  duration: "38m 45s",
  description: `Before you can begin analyzing data in Excel, you need to know how to input it into a worksheet. This course explores a variety of tools and techniques for adding and arranging data in Excel 365. The first part of this course introduces you to working with the Clipboard, which you can use to copy and paste data and take advantage of special paste options. Next, discover how to use the AutoFill and Flash Fill features to save time when copying repeated values or patterns. Learn how to create drop-down lists and edit multiple worksheets at once. Finally, learn how to import data from a variety of external sources, including text and CSV files, online sources, and even pictures.

This course aligns with the objectives of Exam MO-210: Microsoft Excel (Microsoft 365 Apps).

In order to practice what you have learned, you will find practice exercises and samples in the Course Contents pane.`,
  objectives: [
    "discover the key concepts covered in the Entering data in Excel 365 course",
    "copy and paste data using the Clipboard",
    "use special paste options to paste values, formatting, and formulas",
    "use AutoFill to copy data and create series",
    "use the Fill Series command to create custom series",
    "use Flash Fill to extract and combine data automatically",
    "create drop-down lists for data entry",
    "edit multiple worksheets simultaneously",
    "import data from text and CSV files",
    "import data from online sources",
    "import data from pictures using OCR"
  ],
  transcript: `This video covers the essential techniques for entering and managing data in Excel 365, including clipboard operations, AutoFill, Flash Fill, and data import options.`,
  prerequisites: "Basic familiarity with Excel interface",
  level: "Beginner",
  code: "ds_m365ex_02_enus",
  lastUpdated: "March 11, 2026"
};

export default function Course2PlayerPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSidebar, setShowSidebar] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [fullTranscript, setFullTranscript] = useState("");
  const [showSamplesPanel, setShowSamplesPanel] = useState(false);
  const [currentLesson, setCurrentLesson] = useState("overview");
  
  // Video mapping for course 2 lessons
  const lessonVideoMap: { [key: string]: string } = {
    "overview-2": "/vids/entering data/e1.mp4",
    "clipboard": "/vids/entering data/e2.mp4",
    "paste-options": "/vids/c2-3.mp4",
    "autofill": "/vids/c2-4.mp4",
    "fill-series": "/vids/c2-5.mp4",
    "flash-fill": "/vids/c2-6.mp4",
    "dropdown-lists": "/vids/c2-7.mp4",
    "edit-multiple": "/vids/c2-8.mp4",
    "import-text": "/vids/c2-9.mp4",
    "import-online": "/vids/c2-10.mp4",
    "import-picture": "/vids/c2-11.mp4"
  };

  const hasVideo = lessonVideoMap[currentLesson] !== undefined;
  const videoSource = lessonVideoMap[currentLesson] || "/vids/c2-1.mp4";

  useEffect(() => {
    if (params.lessonId) {
      setCurrentLesson(params.lessonId);
      if (params.lessonId === "samples-2" || params.lessonId === "exercise-2" || 
          params.lessonId === "knowledge-check-2-1" || params.lessonId === "knowledge-check-2-2" ||
          params.lessonId === "knowledge-check-2-3" || params.lessonId === "take-test-2" || 
          params.lessonId === "reflection-2") {
        setShowSamplesPanel(true);
      } else {
        setShowSamplesPanel(false);
      }
    }
  }, [params.lessonId]);

  const handleLessonChange = (lessonId: string, isSamples: boolean = false) => {
    setCurrentLesson(lessonId);
    const specialPanelLessons = ["samples-2", "exercise-2", "knowledge-check-2-1", "knowledge-check-2-2", "knowledge-check-2-3", "take-test-2", "reflection-2"];
    setShowSamplesPanel(isSamples || specialPanelLessons.includes(lessonId));
    setActiveTab("overview");
    router.push(`/course2/${lessonId}`);
  };

  useEffect(() => {
    fetch('/transcript/2.txt')
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
            <span className="text-gray-300">Entering data in Excel 365</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">0/17</span>
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
              {/* Overview */}
              <button onClick={() => handleLessonChange("overview-2", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "overview-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 shrink-0" />
                    <span className="font-medium">Overview: Entering data in Excel 365 (2023)</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "overview-2" ? "text-blue-200" : "text-gray-500"}`}>1m</span>
                </div>
              </button>

              {/* Samples */}
              <button onClick={() => handleLessonChange("samples-2", true)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "samples-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="font-medium">Entering data in Excel 365 Samples</span>
                </div>
              </button>

              {/* Using the Clipboard tools */}
              <button onClick={() => handleLessonChange("clipboard", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "clipboard" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Using the Clipboard tools in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "clipboard" ? "text-blue-200" : "text-gray-500"}`}>4m 28s</span>
                </div>
              </button>

              {/* Applying special paste options */}
              <button onClick={() => handleLessonChange("paste-options", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "paste-options" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Applying special paste options in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "paste-options" ? "text-blue-200" : "text-gray-500"}`}>5m 3s</span>
                </div>
              </button>

              {/* Knowledge Check 1 */}
              <button onClick={() => handleLessonChange("knowledge-check-2-1", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "knowledge-check-2-1" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Knowledge Check: Clipboard in Excel 365 (2023)</span>
                </div>
              </button>

              {/* Using AutoFill */}
              <button onClick={() => handleLessonChange("autofill", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "autofill" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Using AutoFill in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "autofill" ? "text-blue-200" : "text-gray-500"}`}>4m 47s</span>
                </div>
              </button>

              {/* Using the Fill Series command */}
              <button onClick={() => handleLessonChange("fill-series", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "fill-series" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Using the Fill Series command</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "fill-series" ? "text-blue-200" : "text-gray-500"}`}>4m 2s</span>
                </div>
              </button>

              {/* Using Flash Fill */}
              <button onClick={() => handleLessonChange("flash-fill", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "flash-fill" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Using Flash Fill in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "flash-fill" ? "text-blue-200" : "text-gray-500"}`}>3m 58s</span>
                </div>
              </button>

              {/* Knowledge Check 2 */}
              <button onClick={() => handleLessonChange("knowledge-check-2-2", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "knowledge-check-2-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Knowledge Check: Filling data in Excel 365 (2023)</span>
                </div>
              </button>

              {/* Creating drop-down lists */}
              <button onClick={() => handleLessonChange("dropdown-lists", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "dropdown-lists" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Creating drop-down lists in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "dropdown-lists" ? "text-blue-200" : "text-gray-500"}`}>4m 50s</span>
                </div>
              </button>

              {/* Editing multiple worksheets */}
              <button onClick={() => handleLessonChange("edit-multiple", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "edit-multiple" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Editing multiple worksheets at once in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "edit-multiple" ? "text-blue-200" : "text-gray-500"}`}>3m 30s</span>
                </div>
              </button>

              {/* Importing data from text or CSV */}
              <button onClick={() => handleLessonChange("import-text", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "import-text" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Importing data from a text or CSV file in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "import-text" ? "text-blue-200" : "text-gray-500"}`}>3m 28s</span>
                </div>
              </button>

              {/* Importing data from online sources */}
              <button onClick={() => handleLessonChange("import-online", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "import-online" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Importing data from online sources in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "import-online" ? "text-blue-200" : "text-gray-500"}`}>3m 43s</span>
                </div>
              </button>

              {/* Importing data from a picture */}
              <button onClick={() => handleLessonChange("import-picture", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "import-picture" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                    <span className="font-medium">Importing data from a picture in Excel 365</span>
                  </div>
                  <span className={`text-xs ${currentLesson === "import-picture" ? "text-blue-200" : "text-gray-500"}`}>3m 34s</span>
                </div>
              </button>

              {/* Exercise */}
              <button onClick={() => handleLessonChange("exercise-2", true)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "exercise-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="font-medium">Exercise: Entering data in Excel 365</span>
                </div>
              </button>

              {/* Knowledge Check 3 */}
              <button onClick={() => handleLessonChange("knowledge-check-2-3", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "knowledge-check-2-3" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Knowledge Check: Advanced data features in Excel 365 (2023)</span>
                </div>
              </button>

              {/* Take Test */}
              <button onClick={() => handleLessonChange("take-test-2", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "take-test-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Take Test</span>
                </div>
              </button>

              {/* Reflection */}
              <button onClick={() => handleLessonChange("reflection-2", false)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentLesson === "reflection-2" ? "bg-[#005691] text-white" : "hover:bg-gray-800 text-gray-300"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0"></div>
                  <span className="font-medium">Reflection: Reflect on what you've learned</span>
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
                    {currentLesson === "samples-2" && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="max-w-4xl mx-auto px-8 py-16">
                          <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <ExcelIcon className="w-10 h-10" />
                              <h1 className="text-3xl font-bold text-gray-900">Entering data in Excel 365 Samples</h1>
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
                              <a href="/1zip/Entering+data+in+Excel+365_Samples.zip" download="Entering data in Excel 365 Samples.zip" className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#005691] hover:bg-[#004070] text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                                <Download className="w-5 h-5" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exercise Panel */}
                    {currentLesson === "exercise-2" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-16">
                          <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <ExcelIcon className="w-10 h-10" />
                              <h1 className="text-3xl font-bold text-gray-900">Exercise: Entering data in Excel 365</h1>
                            </div>
                            <p className="text-base text-gray-500 font-medium">Zip File</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 p-10 mb-8">
                            <div className="flex justify-center mb-6">
                              <a href="/1zip/Exercise_Entering_data_in_Excel_365.zip" download="Exercise Entering data in Excel 365.zip" className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#005691] hover:bg-[#004070] text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                                <Download className="w-5 h-5" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check 1 - Clipboard */}
                    {currentLesson === "knowledge-check-2-1" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">KNOWLEDGE CHECK</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your knowledge of Clipboard in Excel 365 (2023)</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Let's see how much you've learned about using Clipboard tools! Knowledge checks allow you to practice, and are not scored.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005691] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading quiz content...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check 2 - Filling data */}
                    {currentLesson === "knowledge-check-2-2" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">KNOWLEDGE CHECK</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your knowledge of Filling data in Excel 365 (2023)</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Let's see how much you've learned about AutoFill and Flash Fill! Knowledge checks allow you to practice, and are not scored.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005691] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading quiz content...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check 3 - Advanced features */}
                    {currentLesson === "knowledge-check-2-3" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">KNOWLEDGE CHECK</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your knowledge of Advanced data features in Excel 365 (2023)</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Let's see how much you've learned about importing data and advanced features! Knowledge checks allow you to practice, and are not scored.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005691] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading quiz content...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Take Test Panel */}
                    {currentLesson === "take-test-2" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">COURSE TEST</p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Take Test</h1>
                            <p className="text-base text-gray-600 leading-relaxed">
                              Test your knowledge of entering data in Excel 365. You must score 70% or higher to pass and receive credit.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Information:</h3>
                              <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2"><span>•</span> Multiple choice questions</li>
                                <li className="flex gap-2"><span>•</span> Minimum passing score: 70%</li>
                                <li className="flex gap-2"><span>•</span> You can retake the test if needed</li>
                              </ul>
                            </div>
                            <button className="bg-[#005691] hover:bg-[#004070] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
                              Start Test
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reflection Panel */}
                    {currentLesson === "reflection-2" && (
                      <div className="bg-white">
                        <div className="max-w-4xl mx-auto px-8 py-12">
                          <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reflect on what you've learned (optional)</h1>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                              Your private reflections show only to you and no one else. <a href="#" className="text-[#005691] hover:underline">Access them later from your Notes and Reflections page</a> keeping company proprietary information out of your reflection is recommended.
                            </p>
                          </div>
                          
                          <div className="space-y-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="space-y-4 text-sm text-gray-700 mb-6">
                              <p><span className="font-semibold">1.</span> What was the most important, relevant thing you learned from taking the course?</p>
                              <p><span className="font-semibold">2.</span> What are some ways you can apply what you learned?</p>
                              <p><span className="font-semibold">3.</span> What's one thing the course inspired you to do differently moving forward?</p>
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
                                <p className="text-xs text-gray-500">38 minutes 45 seconds</p>
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
                                <p className="text-sm text-gray-600">Computer Software & Applications – Non-technical</p>
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
                                <li>• Course Index: See the Transcript tab above to navigate or search the course.</li>
                                <li>• Glossary: See the Resources tab above to view or print a copy.</li>
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
                                <li>• Complete all videos and Knowledge Checks</li>
                                <li>• Receive a minimum passing score of 70%</li>
                                <li>• Complete course within one year of starting it</li>
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
