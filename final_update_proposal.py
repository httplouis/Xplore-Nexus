# -*- coding: utf-8 -*-
"""
final_update_proposal.py
Reads PROJECT PROPOSAL (Updated).docx and applies final round of improvements:
  - Fix Section 8.2 Tech Stack with exact versions
  - Add Section 8.0 Site Map (complete)
  - Add Section 8.12 Developer Setup / Onboarding Guide
  - Add Section 14.5 Tool Versions Reference
  - Fix Section 13.6 ordering issue
  - Fix Section 15.3 Version Log with initial entry
  - Fix Appendix A to be renumbered as Appendix B is added
  - Add Appendix B - Developer Onboarding Checklist
"""

import shutil
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SRC  = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Updated).docx"
DEST = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Final).docx"

shutil.copy2(SRC, DEST)
doc = Document(DEST)

# ─── helpers ─────────────────────────────────────────────────────────────────

def find_para_index(doc, text_fragment):
    for i, p in enumerate(doc.paragraphs):
        if text_fragment in p.text:
            return i
    return None

def find_all_para_indices(doc, text_fragment):
    return [i for i, p in enumerate(doc.paragraphs) if text_fragment in p.text]

def insert_paragraph_after(doc, ref_index, text, style="Normal"):
    ref_para = doc.paragraphs[ref_index]
    new_para = OxmlElement("w:p")
    ref_para._element.addnext(new_para)
    new_p_obj = doc.paragraphs[ref_index + 1]
    try:
        found = False
        for s in doc.styles:
            try:
                if s.name and s.name.lower() == style.lower():
                    new_p_obj.style = s
                    found = True
                    break
            except:
                pass
        if not found:
            new_p_obj.style = doc.styles["Normal"]
    except:
        pass
    if text:
        new_p_obj.add_run(text)
    return new_p_obj

def add_heading_after(doc, ref_index, text, level=3):
    style_name = f"Heading {level}"
    p = insert_paragraph_after(doc, ref_index, "", style_name)
    if p.runs:
        p.runs[0].text = text
    else:
        p.add_run(text)
    return p

def set_table_borders(table):
    tbl = table._tbl
    tblPr = tbl.find(qn('w:tblPr'))
    if tblPr is None:
        tblPr = OxmlElement('w:tblPr')
        tbl.insert(0, tblPr)
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'AAAAAA')
        tblBorders.append(border)
    tblPr.append(tblBorders)

def set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)

def add_table_after(doc, ref_index, headers, rows, header_bg="1E3A5F"):
    ref_para = doc.paragraphs[ref_index]
    table = doc.add_table(rows=1, cols=len(headers))
    try:
        table.style = doc.styles['TableNormal']
    except:
        pass
    set_table_borders(table)

    hdr_cells = table.rows[0].cells
    for j, h in enumerate(headers):
        hdr_cells[j].text = h
        set_cell_bg(hdr_cells[j], header_bg)
        for para in hdr_cells[j].paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_data in rows:
        row_cells = table.add_row().cells
        for j, val in enumerate(row_data):
            row_cells[j].text = str(val)

    tbl_element = table._tbl
    ref_para._element.addnext(tbl_element)
    return table

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 1: Upgrade Section 8.2 Technology Stack with exact pinned versions
# ═══════════════════════════════════════════════════════════════════════════════

idx_82 = find_para_index(doc, "8.2 Technology Stack")
if idx_82:
    # Walk to end of 8.2 block (until 8.3)
    end_82 = idx_82
    for i in range(idx_82 + 1, min(idx_82 + 20, len(doc.paragraphs))):
        if "8.3" in doc.paragraphs[i].text:
            end_82 = i - 1
            break
        end_82 = i

    # Replace the old "Supabase / MongoDB / Firebase" paragraph that may remain
    for i in range(idx_82, end_82 + 1):
        p = doc.paragraphs[i]
        if "Database" in p.text and "Supabase" in p.text:
            p.clear()
            p.add_run(
                "Database: Supabase (PostgreSQL) v2.x\n"
                " Open-source Firebase alternative — provides auth, real-time DB, RLS, and storage."
            )

    # Insert the complete tech stack table after end_82
    insert_paragraph_after(doc, end_82, "", "Normal")
    end_82 += 1
    insert_paragraph_after(doc, end_82,
        "The following table lists the finalized, pinned technology stack. "
        "All versions should be kept consistent across the team to avoid compatibility issues.", "Normal")
    end_82 += 1

    stack_headers = ["Layer", "Technology", "Version", "Purpose / Notes"]
    stack_rows = [
        # Frontend
        ["Frontend Framework",  "Next.js",              "14.2.x (App Router)",  "React-based SSR/SSG framework. App Router is used for all routing and server components."],
        ["Language",            "TypeScript",           "5.4.x",                "Strongly typed JavaScript. Enforced across all source files."],
        ["UI Framework",        "Tailwind CSS",         "3.4.x",                "Utility-first CSS framework for responsive design."],
        ["Component Library",   "shadcn/ui",            "Latest (Jan 2025)",    "Unstyled, accessible components built on Radix UI. Copy-paste into /components/ui."],
        ["Icons",               "Lucide React",         "0.378.x",              "Icon library used throughout the UI."],
        ["State / Async Data",  "TanStack Query",       "5.x",                  "Server-state management — caching, refetching, mutations."],
        ["Form Handling",       "React Hook Form",      "7.x",                  "Performant form validation library."],
        ["Schema Validation",   "Zod",                  "3.x",                  "TypeScript-first schema validation. Used on both client and server."],
        ["Date Utilities",      "date-fns",             "3.x",                  "Lightweight date manipulation library."],
        ["Charts / Analytics",  "Recharts",             "2.x",                  "Composable chart library used in the Analytics module."],
        # Backend
        ["Backend Runtime",     "Next.js API Routes",   "14.2.x",               "Server-side API routes inside /app/api/. No separate backend server needed for MVP."],
        ["ORM / DB Client",     "Supabase JS Client",   "2.x",                  "Official Supabase JavaScript client for DB queries, auth, and storage."],
        ["Database",            "Supabase (PostgreSQL)","PostgreSQL 15.x",       "Managed cloud database with built-in auth, RLS, and real-time subscriptions."],
        ["Authentication",      "Supabase Auth",        "Built into Supabase 2.x","Email/password auth. JWT access tokens + refresh tokens via HttpOnly cookie."],
        ["Email Service",       "Resend",               "Latest",               "Transactional email API. Used for confirmations, reminders, and notifications."],
        ["File Storage",        "Supabase Storage",     "Built into Supabase 2.x","Used for avatars, certificate PDFs, and training thumbnails."],
        # Integrations
        ["Video Meetings",      "Zoom Meeting SDK",     "Web SDK v3.x",         "Embedded Zoom sessions within the platform. Uses Server-to-Server OAuth."],
        ["Payment Gateway",     "PayMongo",             "API v1",               "Primary payment gateway for PHP transactions. Stripe as fallback for international."],
        # Dev Tools
        ["Package Manager",     "pnpm",                 "8.x",                  "Fast, disk-efficient package manager. Use pnpm instead of npm or yarn."],
        ["Linter",              "ESLint",               "8.x",                  "Code quality enforcement. Config: eslint-config-next."],
        ["Formatter",           "Prettier",             "3.x",                  "Automatic code formatting. Run on save."],
        ["Version Control",     "Git + GitHub",         "Git 2.x",              "All source code hosted on GitHub. See Section 8.10 for branching strategy."],
        ["Deployment",          "Vercel",               "Latest",               "Zero-config Next.js hosting. Production on main, preview on feature branches."],
        ["Design Tool",         "Figma",                "Figma Web (2025)",     "UI/UX prototyping and design system. Prototype: https://dijon-small-23782660.figma.site/"],
        ["API Testing",         "Postman / Thunder Client", "Postman v11 / VS Code Extension", "Use for testing API routes during development."],
        ["Local Dev SSL",       "mkcert",               "Latest",               "Local HTTPS for testing Supabase auth and OAuth flows."],
        ["Node.js Runtime",     "Node.js",              "20.x LTS",             "Required by Next.js. Install via nvm for version management."],
    ]
    add_table_after(doc, end_82, stack_headers, stack_rows)
    end_82 += 1
    insert_paragraph_after(doc, end_82, "", "Normal")
    end_82 += 1

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 2: Replace Section 8.7 Site Map reference with proper heading + full tree
# ═══════════════════════════════════════════════════════════════════════════════

sitemap_idx = find_para_index(doc, "8.7 Site Map of Nexus Xplore")
if sitemap_idx:
    p = doc.paragraphs[sitemap_idx]
    p.clear()
    run = p.add_run("8.7 Site Map of Nexus Xplore")
    run.bold = True

    # Insert the full site map after it
    sitemap_content = [
        "The following site map defines the complete page and navigation structure of the Xplore Nexus platform. "
        "It serves as the reference for all routing decisions in Next.js (App Router).",
        "",
        "Home / Landing Page (Public)",
        "│",
        "├── Authentication",
        "│   ├── Login                          → /auth/login",
        "│   ├── Register                       → /auth/register",
        "│   ├── Forgot Password                → /auth/forgot-password",
        "│   └── Reset Password                 → /auth/reset-password",
        "│",
        "├── Dashboard                          → /dashboard",
        "│   ├── Overview (KPIs, Stats)",
        "│   ├── Notifications",
        "│   ├── Upcoming Activities",
        "│   └── Quick Actions",
        "│",
        "├── Event Management                   → /events",
        "│   ├── Create Event                   → /events/create",
        "│   ├── Event List                     → /events",
        "│   │   ├── View Event Details         → /events/[id]",
        "│   │   ├── Edit Event                 → /events/[id]/edit",
        "│   │   ├── Delete Event               (modal action)",
        "│   │   └── Manage Attendees           → /events/[id]/attendees",
        "│   │       ├── Add Attendee",
        "│   │       ├── Remove Attendee",
        "│   │       └── Attendance Tracking",
        "│   └── Event Reports                  → /events/reports",
        "│",
        "├── Meeting Management                 → /meetings",
        "│   ├── Schedule Meeting               → /meetings/create",
        "│   ├── Calendar View                  → /meetings/calendar",
        "│   ├── Meeting List                   → /meetings",
        "│   │   ├── View Meeting Details       → /meetings/[id]",
        "│   │   ├── Edit Meeting               → /meetings/[id]/edit",
        "│   │   ├── Cancel Meeting             (modal action)",
        "│   │   └── Participants               → /meetings/[id]/participants",
        "│   │       ├── Add Participant",
        "│   │       └── Remove Participant",
        "│   └── Meeting Notifications          (in-app + email)",
        "│",
        "├── Training Management                → /training",
        "│   ├── Create Training                → /training/create",
        "│   ├── Training Catalog               → /training",
        "│   │   ├── View Training Details      → /training/[id]",
        "│   │   ├── Edit Training              → /training/[id]/edit",
        "│   │   ├── Delete Training            (modal action)",
        "│   │   └── Participants               → /training/[id]/participants",
        "│   │       ├── Enroll Participant",
        "│   │       ├── Remove Participant",
        "│   │       └── Progress Tracking",
        "│   ├── Training Modules               → /training/[id]/modules",
        "│   │   ├── Add Module",
        "│   │   ├── Edit Module",
        "│   │   └── Delete Module",
        "│   ├── Certificate Management         → /training/[id]/certificates",
        "│   │   ├── Issue Certificate",
        "│   │   └── View / Download Certificate",
        "│   └── Training Reports               → /training/reports",
        "│",
        "├── Analytics & Reporting              → /analytics",
        "│   ├── Overview Dashboard",
        "│   │   ├── Attendance Rate",
        "│   │   ├── Engagement Score",
        "│   │   ├── Total Events",
        "│   │   └── Active Trainings",
        "│   ├── Event Analytics                → /analytics/events",
        "│   ├── Meeting Analytics              → /analytics/meetings",
        "│   ├── Training Analytics             → /analytics/training",
        "│   └── Export Reports",
        "│       ├── Export as PDF",
        "│       └── Export as CSV",
        "│",
        "├── User Management (Admin only)       → /users",
        "│   ├── User List",
        "│   │   ├── View User Profile          → /users/[id]",
        "│   │   ├── Edit User                  → /users/[id]/edit",
        "│   │   ├── Assign Role                (modal action)",
        "│   │   └── Deactivate / Activate User (toggle action)",
        "│   └── Invite User                    → /users/invite",
        "│",
        "├── Notifications                      → /notifications",
        "│   ├── Notification List",
        "│   │   ├── Mark as Read",
        "│   │   └── Delete Notification",
        "│   └── Notification Preferences       → /settings/notifications",
        "│",
        "└── Settings                           → /settings",
        "    ├── Profile Settings               → /settings/profile",
        "    │   ├── Edit Personal Info",
        "    │   ├── Change Password",
        "    │   └── Upload Avatar",
        "    ├── Organization Settings          → /settings/organization",
        "    ├── Notification Settings          → /settings/notifications",
        "    ├── Security Settings              → /settings/security",
        "    └── Integrations                   → /settings/integrations",
        "        ├── Zoom API",
        "        └── Payment Gateway (PayMongo / Stripe)",
    ]

    insert_idx = sitemap_idx
    for line in sitemap_content:
        insert_paragraph_after(doc, insert_idx, line, "Normal")
        insert_idx += 1

    insert_paragraph_after(doc, insert_idx, "", "Normal")

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 3: Update Section 15.3 Version Update Log with initial entry
# ═══════════════════════════════════════════════════════════════════════════════

v_idx = find_para_index(doc, "15.3 Version Update")
if v_idx:
    insert_paragraph_after(doc, v_idx, "", "Normal")
    v_idx += 1
    insert_paragraph_after(doc, v_idx,
        "The Version Log below must be updated whenever a significant change is made to the system or documentation.", "Normal")
    v_idx += 1

    ver_headers = ["Version", "Date", "Author", "Summary of Changes"]
    ver_rows = [
        ["v0.1.0", "Apr 2025",  "Intern Dev",        "Initial project proposal drafted. System planning and requirement definition completed."],
        ["v0.2.0", "Apr 2025",  "Intern Dev",        "UI/UX wireframes completed in Figma. Dashboard, Events, Meetings, Training layouts finalized."],
        ["v0.3.0", "Apr 2025",  "Intern Dev",        "Technical documentation expanded: FR/NFR table, Auth flow, API endpoints, DB schema, env vars, CI/CD, glossary added."],
        ["v1.0.0", "TBD",       "Intern Dev",        "MVP launch: Core modules functional (Events, Meetings, Training, Analytics, User Management)."],
        ["v1.1.0", "TBD",       "Next Developer",    "Payment integration (PayMongo), certificate generation, notification system fully implemented."],
        ["v2.0.0", "TBD",       "Next Developer",    "Multi-tenant organization support. SaaS public launch preparation."],
    ]
    add_table_after(doc, v_idx, ver_headers, ver_rows)
    v_idx += 1
    insert_paragraph_after(doc, v_idx, "", "Normal")

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 4: Add Section 8.12 — Developer Setup & Onboarding Guide
# ═══════════════════════════════════════════════════════════════════════════════

# Find after 8.11 Payment Flow
idx_811 = find_para_index(doc, "8.11 Payment Flow")
if idx_811:
    walk = idx_811
    for i in range(idx_811+1, min(idx_811+60, len(doc.paragraphs))):
        t = doc.paragraphs[i].text.strip()
        if t and ("9. Risk" in t or "9.Risk" in t):
            walk = i - 1
            break
        walk = i

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "8.12 Developer Setup & Onboarding Guide", level=2)
    walk += 1
    insert_paragraph_after(doc, walk,
        "This section is written specifically for the next developer or intern who will continue this project. "
        "Follow these steps in order to get the development environment fully running.", "Normal")
    walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "Prerequisites", level=3)
    walk += 1

    prereq_headers = ["Tool", "Minimum Version", "Install From", "Notes"]
    prereq_rows = [
        ["Node.js",     "20.x LTS",     "https://nodejs.org",           "Use nvm to manage Node versions. Run: nvm use 20"],
        ["pnpm",        "8.x",          "npm install -g pnpm",          "Do NOT use npm or yarn. This project uses pnpm workspaces."],
        ["Git",         "2.x",          "https://git-scm.com",          "Required for version control and Vercel deployments."],
        ["VS Code",     "Latest",       "https://code.visualstudio.com","Recommended IDE. Install the extensions listed below."],
        ["Supabase CLI","Latest",       "npm install -g supabase",      "Optional but useful for local DB management."],
    ]
    add_table_after(doc, walk, prereq_headers, prereq_rows)
    walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "Recommended VS Code Extensions", level=3)
    walk += 1

    ext_headers = ["Extension", "Extension ID", "Purpose"]
    ext_rows = [
        ["Tailwind CSS IntelliSense",    "bradlc.vscode-tailwindcss",         "Autocomplete for Tailwind utility classes"],
        ["TypeScript Import Sorter",     "mike-co.import-sorter",             "Auto-sort and organize TS imports"],
        ["Prettier - Code formatter",    "esbenp.prettier-vscode",            "Auto-format on save"],
        ["ESLint",                       "dbaeumer.vscode-eslint",            "Real-time linting feedback"],
        ["Prisma / Supabase",           "supabase.vscode-supabase-extension","Database management inside VS Code"],
        ["Thunder Client",              "rangav.vscode-thunder-client",      "API testing directly in VS Code (alternative to Postman)"],
        ["GitLens",                     "eamodio.gitlens",                    "Enhanced Git history and blame annotations"],
        ["Error Lens",                  "usernamehw.errorlens",              "Inline display of errors and warnings"],
        ["Auto Rename Tag",             "formulahendry.auto-rename-tag",     "Auto-rename JSX closing tags"],
    ]
    add_table_after(doc, walk, ext_headers, ext_rows)
    walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "Initial Setup Steps", level=3)
    walk += 1

    setup_steps = [
        ("Step 1 — Clone the Repository",
         "git clone https://github.com/<org>/xplore-nexus.git\ncd xplore-nexus"),
        ("Step 2 — Install Dependencies",
         "pnpm install\n(Never run npm install — it will create a package-lock.json that conflicts with pnpm-lock.yaml)"),
        ("Step 3 — Configure Environment Variables",
         "Copy .env.example to .env.local:\ncp .env.example .env.local\nThen fill in all values. Refer to Section 8.9 for the full variable list and where to get each value."),
        ("Step 4 — Set Up Supabase",
         "Create a new project at https://supabase.com. Copy your Project URL and anon key into .env.local. "
         "Run the SQL migration scripts in /supabase/migrations/ inside the Supabase SQL editor."),
        ("Step 5 — Run Development Server",
         "pnpm dev\nThe app will be available at http://localhost:3000"),
        ("Step 6 — Seed Initial Admin User",
         "After running the dev server: navigate to /auth/register to create your first user. "
         "Then in Supabase Table Editor, manually set that user's role to 'admin' in the users table."),
        ("Step 7 — Verify Setup",
         "Log in at /auth/login. You should see the admin dashboard with all modules listed in the sidebar."),
    ]

    for step_title, step_body in setup_steps:
        insert_paragraph_after(doc, walk, f"{step_title}:", "Normal")
        walk += 1
        insert_paragraph_after(doc, walk, step_body, "Normal")
        walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "Project Folder Structure", level=3)
    walk += 1

    folder_lines = [
        "xplore-nexus/",
        "├── src/",
        "│   ├── app/                   ← Next.js App Router pages",
        "│   │   ├── (auth)/            ← Auth pages group (login, register, etc.)",
        "│   │   ├── dashboard/         ← Dashboard overview",
        "│   │   ├── events/            ← Events module pages",
        "│   │   ├── meetings/          ← Meetings module pages",
        "│   │   ├── training/          ← Training module pages",
        "│   │   ├── analytics/         ← Analytics module pages",
        "│   │   ├── users/             ← User management (Admin only)",
        "│   │   ├── settings/          ← Settings pages",
        "│   │   ├── notifications/     ← Notifications page",
        "│   │   └── api/               ← Next.js API routes",
        "│   │       ├── auth/",
        "│   │       ├── events/",
        "│   │       ├── meetings/",
        "│   │       ├── training/",
        "│   │       ├── analytics/",
        "│   │       ├── users/",
        "│   │       ├── notifications/",
        "│   │       └── payments/",
        "│   ├── components/            ← Reusable UI components",
        "│   │   ├── ui/                ← shadcn/ui base components",
        "│   │   ├── layout/            ← Sidebar, Header, PageWrapper",
        "│   │   ├── events/            ← Event-specific components",
        "│   │   ├── meetings/          ← Meeting-specific components",
        "│   │   ├── training/          ← Training-specific components",
        "│   │   └── analytics/         ← Chart and analytics components",
        "│   ├── lib/                   ← Utility functions and clients",
        "│   │   ├── supabase/          ← Supabase client setup",
        "│   │   ├── zoom/              ← Zoom API helpers",
        "│   │   ├── paymongo/          ← PayMongo API helpers",
        "│   │   ├── resend/            ← Email sending helpers",
        "│   │   └── utils.ts           ← General utility functions",
        "│   ├── hooks/                 ← Custom React hooks",
        "│   ├── types/                 ← TypeScript type definitions",
        "│   └── middleware.ts          ← Route protection middleware",
        "├── supabase/",
        "│   └── migrations/            ← SQL migration files",
        "├── public/                    ← Static assets",
        "├── .env.example               ← Template for environment variables",
        "├── next.config.mjs",
        "├── tailwind.config.ts",
        "├── tsconfig.json",
        "└── pnpm-lock.yaml",
    ]

    for line in folder_lines:
        insert_paragraph_after(doc, walk, line, "Normal")
        walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 5: Add Appendix B — Developer Onboarding Checklist
# ═══════════════════════════════════════════════════════════════════════════════

def get_last_idx(doc):
    return len(doc.paragraphs) - 1

insert_paragraph_after(doc, get_last_idx(doc), "", "Normal")
add_heading_after(doc, get_last_idx(doc), "Appendix B — Developer Onboarding Checklist", level=2)
insert_paragraph_after(doc, get_last_idx(doc),
    "This checklist is for the next intern or developer taking over the project. "
    "Complete each item before committing your first code change.", "Normal")

checklist_headers = ["#", "Task", "Reference", "Done?"]
checklist_rows = [
    ["1",  "Read this full proposal document",                               "This document",              "[ ]"],
    ["2",  "Review the Figma prototype",                                     "Section 16 — Figma Link",    "[ ]"],
    ["3",  "Set up Node.js 20 LTS via nvm",                                  "Section 8.12",               "[ ]"],
    ["4",  "Install pnpm globally",                                          "Section 8.12",               "[ ]"],
    ["5",  "Clone the GitHub repository",                                    "Section 14.1",               "[ ]"],
    ["6",  "Run pnpm install",                                               "Section 8.12",               "[ ]"],
    ["7",  "Create .env.local from .env.example",                            "Section 8.9",                "[ ]"],
    ["8",  "Create Supabase project and fill in env vars",                   "Section 8.9",                "[ ]"],
    ["9",  "Run SQL migrations in Supabase",                                 "Section 8.12",               "[ ]"],
    ["10", "Run pnpm dev and verify app loads at localhost:3000",            "Section 8.12",               "[ ]"],
    ["11", "Seed first Admin user and verify login",                         "Section 8.12",               "[ ]"],
    ["12", "Install recommended VS Code extensions",                         "Section 8.12",               "[ ]"],
    ["13", "Understand the folder structure",                                "Section 8.12",               "[ ]"],
    ["14", "Review the API Endpoint Reference",                              "Section 8.8",                "[ ]"],
    ["15", "Review the Database Schema",                                     "Section 8.6.1",              "[ ]"],
    ["16", "Review the Functional Requirements table",                       "Section 5.6",                "[ ]"],
    ["17", "Review the Branching Strategy and create your feature branch",   "Section 8.10",               "[ ]"],
    ["18", "Make your first test commit and verify Vercel preview deploys",  "Section 8.10",               "[ ]"],
]
add_table_after(doc, get_last_idx(doc), checklist_headers, checklist_rows)
insert_paragraph_after(doc, get_last_idx(doc), "", "Normal")

# ═══════════════════════════════════════════════════════════════════════════════
# FIX 6: Add Appendix C — Naming Conventions
# ═══════════════════════════════════════════════════════════════════════════════

add_heading_after(doc, get_last_idx(doc), "Appendix C — Coding & Naming Conventions", level=2)
insert_paragraph_after(doc, get_last_idx(doc),
    "All contributors must follow these conventions to maintain a consistent and readable codebase.", "Normal")

conv_headers = ["Item", "Convention", "Example"]
conv_rows = [
    ["File names (components)", "PascalCase",                   "EventCard.tsx, UserTable.tsx"],
    ["File names (utilities)",  "camelCase",                    "formatDate.ts, fetchEvents.ts"],
    ["File names (pages)",      "lowercase with hyphens",       "page.tsx inside /events/[id]/edit/"],
    ["React components",        "PascalCase function",          "export default function EventCard() {}"],
    ["Variables & functions",   "camelCase",                    "const eventList = [], function getUser()"],
    ["Constants",               "UPPER_SNAKE_CASE",             "const MAX_PARTICIPANTS = 100"],
    ["Types & Interfaces",      "PascalCase, prefix with I for interfaces", "type EventStatus, interface IUser"],
    ["Database columns",        "snake_case",                   "created_at, user_id, full_name"],
    ["API routes",              "kebab-case resource names",    "/api/events, /api/training-programs"],
    ["Git branch names",        "feature/<short-name>",         "feature/event-registration, fix/zoom-link"],
    ["Git commit messages",     "Conventional Commits format",  "feat: add event creation form, fix: zoom link null error"],
    ["CSS classes (Tailwind)",  "Utility-first, no custom CSS", "className='flex items-center gap-4 p-4'"],
    ["Environment variables",   "UPPER_SNAKE_CASE with prefix", "NEXT_PUBLIC_SUPABASE_URL, ZOOM_SDK_KEY"],
    ["Supabase table names",    "snake_case plural",            "users, events, training_programs"],
]
add_table_after(doc, get_last_idx(doc), conv_headers, conv_rows)
insert_paragraph_after(doc, get_last_idx(doc), "", "Normal")

# ═══════════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════════

doc.save(DEST)
print(f"\nSUCCESS — Final document saved to:\n{DEST}")
print(f"Total paragraphs: {len(doc.paragraphs)}")
print(f"Total tables: {len(doc.tables)}")
