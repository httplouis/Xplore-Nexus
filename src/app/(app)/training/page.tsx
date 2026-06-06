"use client";

import { useState } from "react";
import {
  Search, BookOpen, Clock, Users, ArrowRight, X, ChevronRight, CheckCircle,
  Award, Layers, Info, Play, Lock, CheckCircle2, PlayCircle, Trophy,
  GraduationCap, Star, Calendar, Target, FileText, ExternalLink, Download,
  ChevronDown, ChevronUp, Video, FileQuestion, Bookmark
} from "lucide-react";
import { MicrosoftIcon, AWSIcon, GoogleIcon, CiscoIcon, CompTIAIcon } from "@/components/icons/MicrosoftIcon";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CertificationVendor {
  id: string;
  name: string;
  logo: string;
  certCount: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoCount: number;
  completed: boolean;
  locked: boolean;
  courses: Course[];
}

interface Course {
  id: string;
  title: string;
  duration: string;
  videoCount: number;
  completed: boolean;
  progress: number;
}

interface Certification {
  id: string;
  vendorId: string;
  vendorName: string;
  code: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Expert";
  description: string;
  duration: string;
  modules: number;
  progress: number;
  objectives: string[];
  prerequisites: string;
  examInfo?: string;
  enrolled: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const VENDORS: CertificationVendor[] = [
  { id: "microsoft", name: "Microsoft", logo: "microsoft", certCount: 12 },
  { id: "aws", name: "AWS", logo: "aws", certCount: 8 },
  { id: "google", name: "Google", logo: "google", certCount: 6 },
  { id: "cisco", name: "Cisco", logo: "cisco", certCount: 10 },
  { id: "comptia", name: "CompTIA", logo: "comptia", certCount: 7 },
];

const CERTIFICATIONS: Certification[] = [
  {
    id: "mo-210-excel",
    vendorId: "microsoft",
    vendorName: "Microsoft",
    code: "MO-210",
    title: "Microsoft Office Specialist: Excel Associate (Microsoft 365 Apps)",
    level: "Intermediate",
    description: "Microsoft Excel 365 is a powerful spreadsheet application that can help you organize, analyze, and present data. This course introduces you to the fundamental skills you need to start using the app.",
    duration: "43m 30s",
    modules: 7,
    progress: 0,
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
    prerequisites: "None",
    examInfo: "This course aligns with the objectives of Exam MO-210: Microsoft Excel (Microsoft 365 Apps).",
    enrolled: false,
  }
];

const EXCEL_MODULES: CourseModule[] = [
  {
    id: "mod-1",
    title: "Manage worksheets and workbooks",
    description: "Managing worksheets and workbooks involves organizing and manipulating data within an Excel workbook.",
    duration: "12h 48m",
    videoCount: 8,
    completed: false,
    locked: false,
    courses: [
      { id: "course-1-1", title: "Getting started in Excel 365 (2023)", duration: "43m 30s", videoCount: 15, completed: false, progress: 0 },
      { id: "course-1-2", title: "Entering data in Excel 365 (2023)", duration: "38m 45s", videoCount: 12, completed: false, progress: 0 },
      { id: "course-1-3", title: "Viewing & printing worksheets in Excel 365 (2023)", duration: "42m 12s", videoCount: 14, completed: false, progress: 0 },
      { id: "course-1-4", title: "Setting your work preferences in Excel 365 (2023)", duration: "35m 20s", videoCount: 10, completed: false, progress: 0 },
      { id: "course-1-5", title: "10 common tools in Excel 365 (2023)", duration: "45m 15s", videoCount: 13, completed: false, progress: 0 },
      { id: "course-1-6", title: "Enhancing a worksheet with visual elements in Excel 365 (2024)", duration: "40m 18s", videoCount: 11, completed: false, progress: 0 },
      { id: "course-1-7", title: "Collaborating safely in Excel 365 (2024)", duration: "38m 25s", videoCount: 9, completed: false, progress: 0 },
      { id: "course-1-8", title: "Troubleshooting errors in Excel 365 (2024)", duration: "35m 50s", videoCount: 8, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-2",
    title: "Manage data cells and ranges",
    description: "Managing data cells and ranges involves selecting, editing, and manipulating data within an Excel worksheet.",
    duration: "8h 32m",
    videoCount: 5,
    completed: false,
    locked: false,
    courses: [
      { id: "course-2-1", title: "Formatting cells in Excel 365 (2023)", duration: "42m 15s", videoCount: 11, completed: false, progress: 0 },
      { id: "course-2-2", title: "Referencing cells in Excel 365 (2023)", duration: "38m 30s", videoCount: 9, completed: false, progress: 0 },
      { id: "course-2-3", title: "Managing data in Excel 365 (2024)", duration: "45m 20s", videoCount: 12, completed: false, progress: 0 },
      { id: "course-2-4", title: "Using Custom and Conditional Formatting in Excel 365 (2024)", duration: "40m 12s", videoCount: 10, completed: false, progress: 0 },
      { id: "course-2-5", title: "Adding & arranging data in Excel 365", duration: "35m 45s", videoCount: 8, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-3",
    title: "Manage tables and table data",
    description: "Managing tables and table data involves creating, formatting, and manipulating tables within an Excel worksheet.",
    duration: "4h 15m",
    videoCount: 2,
    completed: false,
    locked: false,
    courses: [
      { id: "course-3-1", title: "Working with tables in Excel 365 (2023)", duration: "42m 30s", videoCount: 10, completed: false, progress: 0 },
      { id: "course-3-2", title: "Working with tables in Excel 365", duration: "38m 15s", videoCount: 9, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-4",
    title: "Perform operations by using formulas and functions",
    description: "Performing operations by using formulas and functions involves using Excel's built-in tools to perform mathematical, statistical, and logical calculations on data within a worksheet.",
    duration: "6h 45m",
    videoCount: 2,
    completed: false,
    locked: false,
    courses: [
      { id: "course-4-1", title: "Exploring essential functions in Excel 365 (2023)", duration: "45m 20s", videoCount: 12, completed: false, progress: 0 },
      { id: "course-4-2", title: "Formatting cells and ranges in Excel 365", duration: "48m 15s", videoCount: 13, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-5",
    title: "Manage charts",
    description: "Managing charts involves creating, formatting, and modifying charts within an Excel worksheet to visually represent data.",
    duration: "3h 20m",
    videoCount: 1,
    completed: false,
    locked: false,
    courses: [
      { id: "course-5-1", title: "Getting started with charts in Excel 365 (2023)", duration: "42m 20s", videoCount: 11, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-6",
    title: "Schedule your exam",
    description: "After completing your studies, you're ready to schedule your exam!",
    duration: "15m",
    videoCount: 1,
    completed: false,
    locked: false,
    courses: [
      { id: "course-6-1", title: "Schedule Your Microsoft Office Exam", duration: "15m", videoCount: 1, completed: false, progress: 0 },
    ]
  },
  {
    id: "mod-7",
    title: "Upload Certification",
    description: "After you receive notification that you've been certified, upload your certification to achieve completion.",
    duration: "5m",
    videoCount: 1,
    completed: false,
    locked: false,
    courses: [
      { id: "course-7-1", title: "Upload certificate", duration: "5m", videoCount: 1, completed: false, progress: 0 },
    ]
  }
];

export default function TrainingPage() {
  const [view, setView] = useState<"browse" | "certification">("browse");
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const getVendorIcon = (vendorId: string, className: string = "w-12 h-12") => {
    switch(vendorId) {
      case "microsoft": return <MicrosoftIcon className={className} />;
      case "aws": return <AWSIcon className={className} />;
      case "google": return <GoogleIcon className={className} />;
      case "cisco": return <CiscoIcon className={className} />;
      case "comptia": return <CompTIAIcon className={className} />;
      default: return null;
    }
  };

  const filteredCerts = CERTIFICATIONS.filter(cert => {
    const matchSearch = search === "" || 
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.code.toLowerCase().includes(search.toLowerCase());
    const matchVendor = !selectedVendor || cert.vendorId === selectedVendor;
    return matchSearch && matchVendor;
  });

  const handleViewCertification = (cert: Certification) => {
    setSelectedCertification(cert);
    setView("certification");
  };

  const handleEnroll = (certId: string) => {
    console.log("Enrolling in:", certId);
    // TODO: API call to enroll
  };

  if (view === "certification" && selectedCertification) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back button + Header */}
        <div>
          <button
            onClick={() => {
              setView("browse");
              setSelectedCertification(null);
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Certifications
          </button>
          
          <div className="bg-gradient-to-br from-[#003B73] via-[#005691] to-[#001F3F] rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getVendorIcon(selectedCertification.vendorId, "w-12 h-12")}
                  <div>
                    <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                      Certification Path
                    </div>
                    <h1 className="text-2xl font-display font-bold mt-1">
                      {selectedCertification.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    {selectedCertification.code}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                    <Target className="w-3.5 h-3.5" />
                    {selectedCertification.level}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedCertification.duration}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center bg-white/10 rounded-lg px-4 py-3">
                  <div className="text-3xl font-bold">{selectedCertification.progress}%</div>
                  <div className="text-xs text-blue-200">Path started</div>
                </div>
                <button
                  onClick={() => handleEnroll(selectedCertification.id)}
                  className="flex items-center gap-2 bg-white text-[#005691] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About this certification */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#005691]" />
            <h2 className="text-lg font-display font-bold text-gray-900">About this certification</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {selectedCertification.description}
          </p>
          {selectedCertification.examInfo && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>Exam Information:</strong> {selectedCertification.examInfo}
            </div>
          )}
        </div>

        {/* Course curriculum modules */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#005691]" />
            <h2 className="text-lg font-display font-bold text-gray-900">Course Curriculum</h2>
            <span className="text-sm text-gray-500 ml-auto">
              {EXCEL_MODULES.length} modules · {EXCEL_MODULES.reduce((acc, m) => acc + m.videoCount, 0)} courses
            </span>
          </div>

          <div className="space-y-3">
            {EXCEL_MODULES.map((module, idx) => (
              <div
                key={module.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  module.locked ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      module.completed 
                        ? "bg-green-100 text-green-700" 
                        : "bg-blue-100 text-[#005691]"
                    }`}>
                      {module.completed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {module.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-500">
                      <div>{module.videoCount} courses · {module.duration}</div>
                    </div>
                    {expandedModule === module.id ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> :
                      <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded courses */}
                {expandedModule === module.id && module.courses.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50/50">
                    {module.courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          // Navigate to course player
                          window.location.href = `/course/${course.id}`;
                        }}
                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-100 last:border-b-0 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            course.completed ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <PlayCircle className="w-3.5 h-3.5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-xs text-gray-500">
                              Course · {course.videoCount} videos · {course.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#005691]">
                          {course.completed ? "Review" : "Start"}
                          <PlayCircle className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning objectives */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#005691]" />
            <h2 className="text-lg font-display font-bold text-gray-900">Learning Objectives</h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedCertification.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#005691] shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Browse view
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Enhanced */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#005691] via-[#0077B5] to-[#00A0DC] rounded-3xl p-10 border border-blue-200 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <GraduationCap className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Certification Center</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
              Welcome to the Certification Center!
            </h1>
            <p className="text-lg text-blue-50 leading-relaxed">
              Step into your central hub for comprehensive guidance on obtaining your certification.
              You&apos;ll find a wealth of resources to help you prepare, monitor your advancement, and
              stay on course to achieve your certification goals.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
              <Trophy className="relative w-32 h-32 text-white drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* My Certifications progress - Enhanced */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">My Certifications</h2>
            <p className="text-sm text-gray-500">Track your certification journey</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          From your first step down a certification path, you&apos;ll have a clear view of all your progress and achievements here.
        </p>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <GraduationCap className="w-8 h-8 text-[#005691]" />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-gray-900 mb-1">0 certification path(s) in progress</div>
            <div className="text-sm text-gray-600">You&apos;ve made great progress! Stay focused, and you&apos;re well on your way</div>
          </div>
        </div>
      </div>

      {/* Search bar - Enhanced */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Certifications, Vendors, or Skill Areas..."
            className="w-full pl-12 pr-4 py-4 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005691]/20 focus:border-[#005691] transition-all"
          />
        </div>
      </div>

      {/* Browse by vendor - Enhanced */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">Browse certification paths</h2>
            <p className="text-sm text-gray-500">Choose from {VENDORS.length} leading technology vendors</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {VENDORS.map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => setSelectedVendor(selectedVendor === vendor.id ? null : vendor.id)}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedVendor === vendor.id
                  ? "border-[#005691] bg-blue-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md hover:scale-102"
              }`}
            >
              <div className={`p-3 rounded-xl transition-all ${
                selectedVendor === vendor.id ? "bg-white shadow-sm" : "bg-gray-50 group-hover:bg-gray-100"
              }`}>
                {getVendorIcon(vendor.id, "w-10 h-10")}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 mb-1">{vendor.name}</div>
                <div className={`text-xs font-semibold ${
                  selectedVendor === vendor.id ? "text-[#005691]" : "text-gray-500"
                }`}>
                  {vendor.certCount} certifications
                </div>
              </div>
              {selectedVendor === vendor.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#005691] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications list - Enhanced */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900">
                {selectedVendor 
                  ? `${VENDORS.find(v => v.id === selectedVendor)?.name} Certifications` 
                  : "All Certifications"}
              </h2>
              <p className="text-sm text-gray-500">{filteredCerts.length} certifications available</p>
            </div>
          </div>
          {selectedVendor && (
            <button
              onClick={() => setSelectedVendor(null)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filter
            </button>
          )}
        </div>
        
        {filteredCerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No certifications found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCerts.map((cert) => (
              <div
                key={cert.id}
                className="group border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-[#005691]/20 hover:-translate-y-1 transition-all duration-200 bg-white"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    {getVendorIcon(cert.vendorId, "w-12 h-12")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold text-white bg-[#005691] px-3 py-1 rounded-full">
                        {cert.code}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        {cert.level}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-2">{cert.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-5 leading-relaxed">{cert.description}</p>

                <div className="flex items-center gap-5 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span className="font-medium">{cert.modules} modules</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{cert.duration}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleViewCertification(cert)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#005691] to-[#0077B5] hover:from-[#004070] hover:to-[#005691] text-white text-sm font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group-hover:scale-[1.02]"
                >
                  View Certification Path
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
