"use client";

import { useState } from "react";
import {
  Search, BookOpen, Clock, Users, ArrowRight, X, ChevronRight, CheckCircle,
  Briefcase, Calendar, MapPin, Award, Layers, ShieldCheck, HeartHandshake, Info
} from "lucide-react";

interface CourseMode {
  type: string;
  duration: string;
  price: string;
  minPax?: string;
}

interface Program {
  code: string;
  title: string;
  category: "Educators" | "Leadership" | "Staff";
  overview: string;
  outcomes: string[];
  audience: string[];
  outline: string[];
  prerequisite: string;
  modes: CourseMode[];
  possibleJobs?: string[];
}

const PROGRAMS: Program[] = [
  {
    code: "EDU-010",
    title: "Educational Tech Primer",
    category: "Educators",
    overview: "Education Technology Primer helps educators, students, and professionals use digital tools in a practical, simple, and effective way. The session highlights how technology can make lessons more engaging, assessments clearer, and teaching tasks easier whether you teach in person, online, or in a hybrid setup. In just three hours, participants will learn to create digital materials, use AI to support teaching tasks, and confidently apply technology in their daily lessons. Everyone goes home with a ready-to-use Digital Lesson Starter Kit.",
    outcomes: [
      "Create simple, engaging digital learning materials using easy-to-use apps and templates.",
      "Apply AI and digital tools to improve teaching tasks such as content creation, instructions, quizzes, and feedback.",
      "Organize lessons and resources using digital productivity tools for a more efficient teaching workflow.",
      "Facilitate interactive activities using digital collaboration platforms (polls, boards, forms, breakout tasks).",
      "Build a Digital Lesson Starter Kit containing one activity, one assessment, and one instructional resource ready for use the next day."
    ],
    audience: [
      "Teachers (K to 12)",
      "Student teachers, pre-service educators",
      "Academic coordinators and school staff",
      "Corporate trainers and facilitators",
      "Students preparing for digital academic work",
      "Freelancers handling tutorials or e-learning projects",
      "Professionals needing digital teaching or presentation skills"
    ],
    outline: [
      "Module 1: Create – Designing Learning Materials",
      "Module 2: Deliver – Student Engagement Tools",
      "Module 3: Assess – Quick Digital Assessment & AI Support",
      "Module 4: Build – Digital Lesson Starter Kit"
    ],
    prerequisite: "None",
    modes: [
      { type: "Onsite Instructor-Led", duration: "3 hours", price: "Php 1,200", minPax: "25 pax" },
      { type: "Live, Online", duration: "3 hours", price: "Php 500", minPax: "25 pax" }
    ]
  },
  {
    code: "EDU-110",
    title: "AI Labs for Educators",
    category: "Educators",
    overview: "This program enables educators to improve teaching, assessment, and classroom management with artificial intelligence. Participants will learn to incorporate generative AI into lesson planning, differentiated instruction, assessment design, feedback automation, and content creation, while ensuring data privacy and ethical use. This self-paced course combines global AI literacy best practices with localized exercises for the Philippine educational context.",
    outcomes: [
      "Use AI tools like ChatGPT, DALL·E, and Canva to design engaging lessons and assessments.",
      "Automate repetitive teaching tasks such as grading, lesson planning, and feedback generation.",
      "Apply responsible and ethical AI principles within academic contexts.",
      "Create adaptive, inclusive, and data-driven learning materials.",
      "Strengthen cybersecurity awareness and data protection in education systems.",
      "Integrate storytelling and questioning techniques to enhance student engagement and reflection."
    ],
    audience: [
      "Teachers, educators, lecturers, trainers"
    ],
    outline: [
      "AI Foundations Awareness (Entry Level)",
      "AI in the Workplace",
      "Responsible Use of AI",
      "Considerations for Using AI Responsibly",
      "Prompt Engineering Fundamentals for Programmers Literacy (Beginner Level)",
      "Finetuning Your ChatGPT Prompts",
      "AI in Education: Adaptive Learning and Institutional Intelligence",
      "Cybersecurity for the Education Sector",
      "Cybersecurity for the Education Sector: Securing Student Data and Digital Learning Systems",
      "Storytelling for Leaders",
      "Socratic Questioning",
      "Automate Lesson Planning with ChatGPT",
      "Create Differentiated Instructions with ChatGPT",
      "Generate Instructional Materials and Visual Aids using Canva & DALL-E",
      "Automate Assessment Creation with ChatGPT",
      "Automate Grading and Feedback using ChatGPT"
    ],
    prerequisite: "None",
    modes: [
      { type: "Online, Self-Paced", duration: "3-month course access", price: "Php 2,600" }
    ],
    possibleJobs: [
      "Teacher",
      "Curriculum Coordinator",
      "Instructional Designer",
      "Learning Facilitator",
      "Educational Content Developer",
      "Academic Coach",
      "Assessment Specialist",
      "Teacher Trainer"
    ]
  },
  {
    code: "EDU-120",
    title: "AI Literacy and Responsible AI Integration for Teachers",
    category: "Educators",
    overview: "AI Literacy and Responsible AI Integration for Teachers equips K–12 educators with the knowledge, skills, and ethical grounding to integrate AI responsibly and effectively into teaching and learning. Over 2 days, participants will explore foundational AI concepts, DepEd policy requirements, ethical AI use, and practical AI applications for lesson planning, instructional strategies, and assessment. Learners will leave with a Responsible AI Classroom Implementation Plan ready for immediate use.",
    outcomes: [
      "Explain the key provisions, principles, and implications of DepEd Order No. 003 s. 2026 for classroom practice.",
      "Demonstrate foundational AI literacy, including how AI systems work and how they are applied in educational contexts.",
      "Apply ethical and responsible AI practices consistent with national policy and global standards.",
      "Integrate AI tools effectively into lesson planning, instructional strategies, and assessment design.",
      "Critically evaluate AI-generated content for accuracy, bias, reliability, and curriculum alignment.",
      "Design student-centered, AI-enhanced learning activities aligned with curriculum competencies.",
      "Develop a Responsible AI Classroom Implementation Plan for use in their own school context."
    ],
    audience: [
      "Elementary, Junior High, and Senior High School Teachers",
      "Master Teachers, Academic Coordinators, ICT Coordinators, School Technology Champions",
      "School Administrators (optional)"
    ],
    outline: [
      "Module 1: Introduction to Artificial Intelligence in Education",
      "Module 2: Understanding DepEd Order No. 003, s. 2026",
      "Module 3: Ethical and Responsible AI Use",
      "Module 4: AI Tools for Teaching and Productivity",
      "Module 5: Designing AI-Enhanced Learning Activities",
      "Module 6: Developing Responsible AI Classroom Policies"
    ],
    prerequisite: "Basic computer literacy; familiarity with teaching or classroom management",
    modes: [
      { type: "Online Instructor-Led", duration: "16 hours", price: "Php 900", minPax: "up to 500 pax" },
      { type: "Onsite Instructor-Led", duration: "16 hours", price: "Php 3,000", minPax: "up to 100 pax" }
    ],
    possibleJobs: [
      "AI Integration Specialist",
      "Educational Technology Coordinator",
      "Instructional Designer",
      "Curriculum Developer",
      "EdTech Consultant",
      "Learning Experience Designer",
      "AI-Powered Assessment Specialist",
      "Adaptive Learning Coordinator",
      "Educational Data Analyst",
      "Digital Learning Facilitator"
    ]
  },
  {
    code: "EDU-130",
    title: "AI Leadership and Governance for Academic Leaders in Basic Education",
    category: "Leadership",
    overview: "AI Leadership and Governance for Academic Leaders prepares principals, school heads, department chairs, and division supervisors to strategically implement DepEd Order No. 003, s. 2026. Over 2 days, participants will develop institutional AI governance competencies, including policy development, risk management, staff mentoring, and culture leadership — ensuring safe, responsible, and effective AI integration across their schools.",
    outcomes: [
      "Analyze and articulate the governance implications of DepEd Order No. 003 s. 2026 for their school or division.",
      "Evaluate AI tools for educational suitability, ethical compliance, and student data privacy.",
      "Develop a School AI Governance Framework aligned with national policy and local context.",
      "Design professional development pathways to build AI literacy and responsible AI use among teaching staff.",
      "Establish mechanisms to monitor, evaluate, and continuously improve AI integration.",
      "Lead organizational culture change that promotes responsible AI adoption while upholding pedagogy and student welfare.",
      "Communicate AI policy decisions effectively to teachers, parents, students, and the wider school community."
    ],
    audience: [
      "School Principals, Assistant Principals, School Heads",
      "Department Heads, Academic Track Heads",
      "Education Program Supervisors, Master Teachers in Leadership Roles",
      "ICT Coordinators",
      "School Governing Council Representatives (optional)"
    ],
    outline: [
      "AI in Education: A Leader's Perspective",
      "Policy Analysis: DepEd Order No. 003 s. 2026",
      "AI Governance Framework Design",
      "Leading Teacher Professional Development in AI",
      "Evaluating AI Integration and Managing Risk",
      "Stakeholder Communication & AI Culture Leadership"
    ],
    prerequisite: "Experience in school leadership or academic administration; familiarity with K–12 operations and policies",
    modes: [
      { type: "Online Instructor-Led", duration: "16 hours", price: "Php 900", minPax: "up to 500 pax" },
      { type: "Onsite Instructor-Led", duration: "16 hours", price: "Php 3,000", minPax: "up to 100 pax" }
    ],
    possibleJobs: [
      "AI Integration Specialist",
      "Educational Technology Coordinator",
      "Instructional Designer",
      "Curriculum Developer",
      "EdTech Consultant",
      "Learning Experience Designer",
      "AI-Powered Assessment Specialist",
      "Adaptive Learning Coordinator",
      "Educational Data Analyst",
      "Digital Learning Facilitator"
    ]
  },
  {
    code: "EDU-140",
    title: "AI in the Workplace: Practical AI Literacy for Non-Academic School Personnel",
    category: "Staff",
    overview: "This 1-day training equips non-academic school personnel with practical AI literacy to navigate the increasing use of AI in school operations safely and responsibly. Participants will understand how AI works, identify the AI tools they encounter in their daily tasks, apply data privacy and ethical practices, and contribute to a responsible AI culture within their school. Through hands-on exercises and role-specific scenarios, participants will leave with a Personal AI Use Checklist they can immediately apply to their work.",
    outcomes: [
      "Describe what Artificial Intelligence is and how it is being applied in schools.",
      "Identify AI tools they encounter in their daily work and understand the data these tools collect.",
      "Recognize and apply data privacy responsibilities under the Data Privacy Act of 2012 (RA 10173).",
      "Apply basic responsible AI practices, including verifying AI outputs and protecting sensitive information.",
      "Respond appropriately to AI-related concerns in their work area.",
      "Contribute positively to a responsible AI culture in their school."
    ],
    audience: [
      "Non-teaching, non-academic school personnel",
      "Administrative officers and school clerks",
      "Registrars and records staff",
      "Guidance counselors and psychometricians",
      "Finance and budget officers",
      "Librarians and media center staff",
      "School nurses and clinic staff",
      "Utility, maintenance, and security staff"
    ],
    outline: [
      "Session 1: What Is AI and Why Does It Matter to Me?",
      "Session 2: Protecting Data — Your Responsibilities When Using AI",
      "Session 3: Using AI Tools Safely and Responsibly",
      "Session 4: Being Part of a Responsible AI School Community"
    ],
    prerequisite: "None",
    modes: [
      { type: "Online Instructor-Led", duration: "16 hours", price: "Php 500", minPax: "up to 500 pax" },
      { type: "Onsite Instructor-Led", duration: "16 hours", price: "Php 1,500", minPax: "up to 100 pax" }
    ]
  }
];

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | "Educators" | "Leadership" | "Staff">("All");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const filteredPrograms = PROGRAMS.filter((program) => {
    const matchesCategory = activeCategory === "All" || program.category === activeCategory;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      program.title.toLowerCase().includes(searchLower) ||
      program.code.toLowerCase().includes(searchLower) ||
      program.overview.toLowerCase().includes(searchLower) ||
      program.outline.some(item => item.toLowerCase().includes(searchLower)) ||
      program.outcomes.some(item => item.toLowerCase().includes(searchLower)) ||
      program.audience.some(item => item.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Educators", "Leadership", "Staff"] as const;

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      {/* Header section with Informatics blue gradient overlay card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#003B73] via-[#005691] to-[#001F3F] border border-[#005691]/40 px-6 py-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <img
              src="/informatics-logo-white.png"
              alt="Informatics Logo"
              className="h-8 md:h-10 w-auto object-contain select-none pointer-events-none"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md text-blue-100 border border-white/10">
              Technology Programs
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Informatics Technology Programs
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
            Equipping educators, leaders, and staff with modern educational technology, generative AI strategies, DepEd Order compliance, and practical productivity pathways.
          </p>
        </div>
        <div className="relative z-10 shrink-0 select-none hidden md:block">
          <img
            src="/teachnology.png"
            alt="Teachnology Programs Logo"
            className="h-28 lg:h-32 w-auto object-contain"
          />
        </div>
      </div>

      {/* Filter and Search Bar row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#005691] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs, outlines, or outcomes..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005691]/20 focus:border-[#005691]/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Programs Cards Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[#005691]/60" />
          </div>
          <h3 className="text-gray-700 font-bold text-lg">No programs found</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm">
            Try resetting your filters or typing a different keyword in the search bar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.code}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-wider text-white bg-[#005691] px-2.5 py-1 rounded-md uppercase">
                    {program.code}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                    Category: {program.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-gray-900 text-lg leading-snug">
                    {program.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {program.overview}
                  </p>
                </div>

                {/* Micro Details (Outlines Preview) */}
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#005691]" />
                    Module Outline Highlights:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {program.outline.slice(0, 4).map((mod, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                        <ChevronRight className="w-3.5 h-3.5 text-[#005691] shrink-0 mt-0.5" />
                        <span className="truncate">{mod.replace(/^Module \d+:\s*/, "")}</span>
                      </li>
                    ))}
                    {program.outline.length > 4 && (
                      <li className="text-xs text-[#005691] font-semibold">
                        + {program.outline.length - 4} more modules
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Area */}
              <div className="bg-gray-50/70 border-t border-gray-50 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {program.modes[0]?.duration}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    {program.modes[0]?.price}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedProgram(program)}
                  className="flex items-center gap-1.5 text-[#005691] hover:text-[#003F6C] font-semibold text-xs transition-colors group"
                >
                  View Full Details
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden my-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative px-6 py-6 bg-gradient-to-r from-[#003B73] to-[#001F3F] text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-[#005691] px-2 py-0.5 rounded text-blue-100 uppercase">
                    {selectedProgram.code}
                  </span>
                  <span className="text-xs text-blue-200">
                    Category: {selectedProgram.category}
                  </span>
                </div>
                <h2 className="text-xl font-display font-extrabold tracking-tight">
                  {selectedProgram.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 scrollbar-thin">
              {/* Course Overview */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1">
                  <Info className="w-4 h-4 text-[#005691]" />
                  Course Overview
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedProgram.overview}
                </p>
              </div>

              {/* Course Modes, Pricing, & Min Pax Grid */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1">
                  <Calendar className="w-4 h-4 text-[#005691]" />
                  Learning Modes, Duration & Fees
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {selectedProgram.modes.map((mode, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#005691]">{mode.type}</span>
                        {mode.minPax && (
                          <span className="text-[10px] text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded font-medium">
                            Min: {mode.minPax}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {mode.duration}
                        </span>
                        <span className="text-sm font-extrabold text-gray-800">{mode.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side outcomes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1">
                    <Award className="w-4 h-4 text-[#005691]" />
                    Learning Outcomes
                  </h4>
                  <ul className="space-y-2 pt-1">
                    {selectedProgram.outcomes.map((out, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-[#005691] shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right side syllabus outline */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1">
                    <Layers className="w-4 h-4 text-[#005691]" />
                    Training Outline
                  </h4>
                  <ul className="space-y-2 pt-1">
                    {selectedProgram.outline.map((out, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                        <span className="w-5 h-5 rounded bg-blue-50 text-[#005691] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1">
                  <Users className="w-4 h-4 text-[#005691]" />
                  Who It&apos;s For
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProgram.audience.map((aud, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 hover:bg-gray-200/75 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200/50 transition-colors"
                    >
                      {aud}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Extra Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                {/* Prerequisite */}
                <div className="space-y-1 bg-[#005691]/5 border border-[#005691]/10 p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-[#005691] uppercase tracking-wider block">
                    Prerequisite Required
                  </span>
                  <span className="text-xs text-gray-700 font-semibold">
                    {selectedProgram.prerequisite}
                  </span>
                </div>

                {/* Possible Jobs */}
                {selectedProgram.possibleJobs && (
                  <div className="space-y-1 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      Target Career Roles
                    </span>
                    <p className="text-xs text-gray-700 font-semibold truncate">
                      {selectedProgram.possibleJobs.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
