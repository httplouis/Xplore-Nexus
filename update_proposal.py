# -*- coding: utf-8 -*-
"""
update_proposal.py
Reads the existing PROJECT PROPOSAL docx, applies all corrections and
adds all missing sections identified in the Technical Documentation Analysis,
then saves the result as a new file.
"""

import copy, shutil, os
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SRC  = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\Copy of PROJECT PROPOSAL (1).docx"
DEST = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Updated).docx"

shutil.copy2(SRC, DEST)
doc = Document(DEST)

# ─── helpers ────────────────────────────────────────────────────────────────

def find_para_index(doc, text_fragment):
    """Return the index of the first paragraph whose text contains text_fragment."""
    for i, p in enumerate(doc.paragraphs):
        if text_fragment in p.text:
            return i
    return None

def insert_paragraph_after(doc, ref_para_index, text, style="normal"):
    """Insert a new paragraph after ref_para_index."""
    ref_para = doc.paragraphs[ref_para_index]
    new_para = OxmlElement("w:p")
    ref_para._element.addnext(new_para)
    # refresh paragraph list reference
    new_p_obj = doc.paragraphs[ref_para_index + 1]
    new_p_obj.style = doc.styles[style] if style in [s.name for s in doc.styles] else doc.styles["Normal"]
    new_p_obj.text = text
    return new_p_obj

def add_heading_after(doc, ref_para_index, text, level=3):
    style_name = f"Heading {level}"
    return insert_paragraph_after(doc, ref_para_index, text, style_name)

def set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)

def bold_cell(cell):
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True
        if not para.runs:
            run = para.add_run(para.text)
            para.clear()
            para.add_run(run.text).bold = True

def set_table_borders(table):
    """Apply simple border to all cells via XML."""
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

def add_table_after(doc, ref_para_index, headers, rows, col_widths=None):
    """
    Inserts a table after ref_para_index.
    headers: list of column header strings
    rows: list of lists (row data)
    Returns the new table.
    """
    ref_para = doc.paragraphs[ref_para_index]
    table = doc.add_table(rows=1, cols=len(headers))
    # Use the style name available in the document
    try:
        table.style = doc.styles['TableNormal']
    except Exception:
        pass
    set_table_borders(table)

    # Header row
    hdr_cells = table.rows[0].cells
    for j, h in enumerate(headers):
        hdr_cells[j].text = h
        set_cell_bg(hdr_cells[j], "1E3A5F")
        for para in hdr_cells[j].paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Data rows
    for row_data in rows:
        row_cells = table.add_row().cells
        for j, val in enumerate(row_data):
            row_cells[j].text = str(val)

    if col_widths:
        for row in table.rows:
            for j, cell in enumerate(row.cells):
                cell.width = col_widths[j]

    # Move the table XML to after ref_para
    tbl_element = table._tbl
    ref_para._element.addnext(tbl_element)
    return table

# ─── 1. CORRECT: Section 8.2 Technology Stack – finalise DB decision ────────

idx = find_para_index(doc, "Supabase / MongoDB / Firebase")
if idx is not None:
    p = doc.paragraphs[idx]
    for run in p.runs:
        if "Supabase / MongoDB / Firebase" in run.text:
            run.text = run.text.replace(
                "Supabase / MongoDB / Firebase",
                "Supabase (PostgreSQL) — selected for built-in auth, real-time subscriptions, and seamless Next.js integration"
            )
    if not any("Supabase / MongoDB / Firebase" in r.text for r in p.runs):
        if "Supabase / MongoDB / Firebase" in p.text:
            p.clear()
            p.add_run(
                "Database: Supabase (PostgreSQL)\n"
                " Selected for built-in auth, real-time subscriptions, Row-Level Security, and native Next.js client support"
            )

# Also fix Deployment Architecture DB mention
idx2 = find_para_index(doc, "Supabase / MongoDB Atlas")
if idx2 is not None:
    p2 = doc.paragraphs[idx2]
    for run in p2.runs:
        if "Supabase / MongoDB Atlas" in run.text:
            run.text = run.text.replace("Supabase / MongoDB Atlas", "Supabase (PostgreSQL)")
    if "Supabase / MongoDB Atlas" in p2.text and not any("Supabase / MongoDB Atlas" in r.text for r in p2.runs):
        p2.clear()
        p2.add_run("Managed through Supabase (PostgreSQL)")

# ─── 2. ADD: Section 5.6 – Functional & Non-Functional Requirements ─────────

# Find "5.5 User Roles" section end — paragraph 196 "This structure ensures..."
anchor_text = "This structure ensures proper control, accountability, and security across the platform."
anchor_idx = find_para_index(doc, anchor_text)

if anchor_idx is not None:
    # Insert blank line
    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

    # Section heading
    add_heading_after(doc, anchor_idx, "5.6 Functional & Non-Functional Requirements", level=3)
    anchor_idx += 1

    insert_paragraph_after(doc, anchor_idx,
        "The following tables define the system's functional and non-functional requirements derived from the feature "
        "set and user workflows described above. These requirements serve as the reference baseline for development, "
        "testing, and acceptance.", "Normal")
    anchor_idx += 1

    # 5.6.1 heading
    add_heading_after(doc, anchor_idx, "5.6.1 Functional Requirements", level=3)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

    fr_headers = ["ID", "Module", "Requirement", "Priority", "Role"]
    fr_rows = [
        ["FR-001", "Auth",          "Users must be able to register with email and password",                                                              "Must Have",  "All"],
        ["FR-002", "Auth",          "Users must be able to log in securely using JWT-based authentication",                                                "Must Have",  "All"],
        ["FR-003", "Auth",          "Admins must be able to assign roles (Admin, Organizer, User) to accounts",                                            "Must Have",  "Admin"],
        ["FR-004", "Auth",          "System must support password reset via email link",                                                                   "Must Have",  "All"],
        ["FR-005", "Events",        "Organizers must be able to create events with title, type, date/time, location, and participant limit",               "Must Have",  "Organizer, Admin"],
        ["FR-006", "Events",        "Organizers must be able to edit and delete events they created",                                                      "Must Have",  "Organizer, Admin"],
        ["FR-007", "Events",        "Users must be able to browse and register for available events",                                                      "Must Have",  "User"],
        ["FR-008", "Events",        "System must automatically track and log attendance for events",                                                       "Must Have",  "System"],
        ["FR-009", "Events",        "System must send automated confirmation emails upon successful registration",                                          "Must Have",  "System"],
        ["FR-010", "Events",        "Admins must be able to view participant lists for any event",                                                         "Must Have",  "Admin"],
        ["FR-011", "Events",        "Events must support both online and onsite types",                                                                    "Must Have",  "Organizer"],
        ["FR-012", "Events",        "Paid events must support payment processing before confirming registration",                                          "Should Have","User"],
        ["FR-013", "Meetings",      "Organizers must be able to schedule meetings with title, date/time, and duration",                                    "Must Have",  "Organizer, Admin"],
        ["FR-014", "Meetings",      "System must generate a Zoom meeting link via Zoom API upon scheduling",                                               "Must Have",  "System"],
        ["FR-015", "Meetings",      "Users must be able to join live meetings directly from the platform",                                                 "Must Have",  "User"],
        ["FR-016", "Meetings",      "Meetings must display status: Live, Upcoming, or Completed",                                                         "Must Have",  "All"],
        ["FR-017", "Meetings",      "System must support recurring meetings",                                                                              "Nice to Have","Organizer"],
        ["FR-018", "Training",      "Admins/Organizers must be able to create training programs with modules",                                             "Must Have",  "Admin, Organizer"],
        ["FR-019", "Training",      "Users must be able to enroll in training programs and track progress",                                                "Must Have",  "User"],
        ["FR-020", "Training",      "System must display a progress bar per training course per user",                                                     "Must Have",  "User"],
        ["FR-021", "Training",      "System must automatically generate and issue a certificate upon course completion",                                   "Must Have",  "System"],
        ["FR-022", "Training",      "Instructors must be able to view analytics for their training programs",                                              "Should Have","Organizer, Admin"],
        ["FR-023", "Analytics",     "Admins must view total events, active trainings, attendance rate, and engagement score on the dashboard",             "Must Have",  "Admin"],
        ["FR-024", "Analytics",     "System must display attendance trend charts over configurable time periods",                                          "Must Have",  "Admin"],
        ["FR-025", "Analytics",     "System must generate consolidated reports exportable as PDF or CSV",                                                  "Should Have","Admin"],
        ["FR-026", "Users",         "Admins must be able to view, add, edit, and deactivate user accounts",                                               "Must Have",  "Admin"],
        ["FR-027", "Users",         "Users must be able to edit their own profile (name, email, phone, avatar)",                                          "Must Have",  "All"],
        ["FR-028", "Notifications", "System must send in-app and email notifications for key events (registration, reminders, completions)",              "Must Have",  "System"],
        ["FR-029", "Settings",      "Users must be able to manage notification preferences",                                                               "Should Have","All"],
        ["FR-030", "Settings",      "Admins must be able to configure organization-level settings",                                                        "Should Have","Admin"],
        ["FR-031", "Payments",      "System must integrate PayMongo or Stripe for processing paid event registrations",                                    "Should Have","System"],
        ["FR-032", "Payments",      "System must generate a receipt/invoice after successful payment",                                                     "Should Have","System"],
    ]
    add_table_after(doc, anchor_idx, fr_headers, fr_rows)
    anchor_idx += 1

    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

    # 5.6.2 Non-Functional Requirements
    add_heading_after(doc, anchor_idx, "5.6.2 Non-Functional Requirements", level=3)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

    nfr_headers = ["ID", "Category", "Requirement", "Target / Metric", "Priority"]
    nfr_rows = [
        ["NFR-001","Performance",    "Pages must load within acceptable time on standard connection",                       "< 3 seconds initial load",                        "Must Have"],
        ["NFR-002","Performance",    "Dashboard analytics must reflect real-time data with minimal delay",                  "< 5 seconds refresh",                             "Must Have"],
        ["NFR-003","Scalability",    "System must support concurrent users without performance degradation",                "Up to 500 concurrent users (MVP)",                "Must Have"],
        ["NFR-004","Scalability",    "Database and hosting must support horizontal scaling as user base grows",             "Supabase / Vercel auto-scale",                    "Should Have"],
        ["NFR-005","Security",       "All data transmission must be encrypted",                                            "HTTPS / TLS enforced",                            "Must Have"],
        ["NFR-006","Security",       "User passwords must be hashed before storage",                                       "bcrypt (salt rounds >= 10)",                      "Must Have"],
        ["NFR-007","Security",       "All API endpoints must require authentication except public routes",                  "JWT Bearer token",                                "Must Have"],
        ["NFR-008","Security",       "System must implement RBAC to restrict access based on user role",                   "Admin / Organizer / User roles",                  "Must Have"],
        ["NFR-009","Security",       "System must protect against common vulnerabilities",                                 "OWASP Top 10 (SQL injection, XSS, CSRF)",         "Must Have"],
        ["NFR-010","Availability",   "System must maintain high uptime during business hours",                             ">= 99% uptime (Vercel SLA)",                      "Must Have"],
        ["NFR-011","Usability",      "UI must be responsive and functional across common screen sizes",                    "Desktop, tablet, mobile",                         "Must Have"],
        ["NFR-012","Usability",      "UI must follow a consistent design system with accessible color contrast",           "WCAG AA compliance (target)",                     "Should Have"],
        ["NFR-013","Maintainability","Codebase must follow modular component architecture for easy updates",               "Next.js App Router + TypeScript",                 "Must Have"],
        ["NFR-014","Maintainability","All API routes must be documented during development",                               "Inline JSDoc comments / OpenAPI",                 "Should Have"],
        ["NFR-015","Compatibility",  "System must function correctly on major modern browsers",                            "Chrome, Edge, Firefox, Safari",                   "Must Have"],
        ["NFR-016","Reliability",    "System must handle API failures from Zoom/Payment gateways gracefully",             "User-facing error messages, no crashes",           "Must Have"],
        ["NFR-017","Reliability",    "System must implement retry logic for critical external API calls",                  "Exponential backoff (Zoom, payment)",             "Should Have"],
        ["NFR-018","Data Integrity", "All form inputs must be validated on both client and server side",                   "Zod schema validation",                           "Must Have"],
        ["NFR-019","Compliance",     "User data must be handled in accordance with data privacy standards",                "RA 10173 / GDPR principles",                      "Must Have"],
        ["NFR-020","Deployment",     "System must support separate development, staging, and production environments",     "Vercel preview deployments",                      "Should Have"],
    ]
    add_table_after(doc, anchor_idx, nfr_headers, nfr_rows)
    anchor_idx += 1

    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

# ─── 3. ADD: Section 5.7 User Stories ────────────────────────────────────────

    add_heading_after(doc, anchor_idx, "5.7 User Stories & Acceptance Criteria", level=3)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx,
        "The following user stories define the expected system behaviors from each role's perspective and serve as "
        "the basis for sprint planning and acceptance testing.", "Normal")
    anchor_idx += 1

    us_headers = ["ID", "Role", "User Story", "Acceptance Criteria"]
    us_rows = [
        ["US-001","Organizer",   "As an Organizer, I want to create an event so that participants can register.",
         "Given I am logged in as Organizer, when I fill in event details and click Create, then the event appears in the list with status Upcoming."],
        ["US-002","User",        "As a User, I want to register for an event so that I can attend it.",
         "Given an event exists, when I click Register, then I receive a confirmation email and the event appears in My Events."],
        ["US-003","User",        "As a User, I want to join a live meeting from the platform so I do not need external links.",
         "Given a meeting is Live, when I click Join Now, then I am directed into the Zoom session within the platform."],
        ["US-004","User",        "As a User, I want to track my training progress so I know how much is left.",
         "Given I am enrolled in a training, when I view it, then a progress bar reflects my completed modules."],
        ["US-005","System",      "As the System, I want to issue a certificate upon training completion automatically.",
         "Given a user completes all modules, then a certificate PDF is generated and available in their profile."],
        ["US-006","Admin",       "As an Admin, I want to manage user roles so I can control platform access.",
         "Given I am logged in as Admin, when I assign a role to a user, then their permissions update immediately."],
        ["US-007","Admin",       "As an Admin, I want to view consolidated analytics so I can track platform engagement.",
         "Given I navigate to Analytics, then I see attendance trends, event counts, and engagement scores updated in real time."],
    ]
    add_table_after(doc, anchor_idx, us_headers, us_rows)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

# ─── 4. ADD: Section 5.8 Notification System Design ─────────────────────────

    add_heading_after(doc, anchor_idx, "5.8 Notification System Design", level=3)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx,
        "The platform will deliver two types of notifications to keep users informed of relevant activity:", "Normal")
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "In-App Notifications — displayed in the header bell icon inside the platform.", "Normal")
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "Email Notifications — sent automatically by the system via transactional email (Resend or SendGrid).", "Normal")
    anchor_idx += 1

    notif_headers = ["Trigger Event", "Channel", "Recipient"]
    notif_rows = [
        ["Successful event registration",            "Email + In-App", "Registrant"],
        ["Session starting in 1 hour",               "Email + In-App", "Registered Users"],
        ["Session starting in 15 minutes",           "In-App",         "Registered Users"],
        ["Meeting scheduled by Organizer",           "Email",          "Invited Participants"],
        ["Training enrollment confirmed",            "Email + In-App", "Enrollee"],
        ["Training module completed",                "In-App",         "Enrollee"],
        ["Training course 100% completed + cert",   "Email + In-App", "Enrollee"],
        ["Payment successful",                       "Email",          "Payer"],
        ["New user account created (by Admin)",      "Email",          "New User"],
        ["Role changed by Admin",                    "In-App",         "Affected User"],
    ]
    add_table_after(doc, anchor_idx, notif_headers, notif_rows)
    anchor_idx += 1
    insert_paragraph_after(doc, anchor_idx, "", "Normal")
    anchor_idx += 1

# ─── 5. ADD: Section 8.6.1 – Expanded Database Schema ───────────────────────

schema_anchor = find_para_index(doc, "8.6 API Design Overview")
if schema_anchor is not None:
    # Walk forward to find end of 8.6 content
    end_idx = schema_anchor
    for i in range(schema_anchor, min(schema_anchor + 80, len(doc.paragraphs))):
        if "8.7" in doc.paragraphs[i].text or "9." in doc.paragraphs[i].text:
            end_idx = i - 1
            break
    else:
        end_idx = schema_anchor + 30

    # Find the schema section specifically
    schema_section = find_para_index(doc, "8.6.1")
    if schema_section is None:
        schema_section = end_idx

    # Insert after the last paragraph in 8.6 block
    walk = schema_section
    for i in range(schema_section, min(schema_section + 40, len(doc.paragraphs))):
        t = doc.paragraphs[i].text.strip()
        if t and ("8.7" in t or "9. Risk" in t):
            walk = i - 1
            break
        walk = i

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    add_heading_after(doc, walk, "8.6.1 Database Schema — Complete Table Definitions", level=3)
    walk += 1
    insert_paragraph_after(doc, walk,
        "The following tables represent the complete database schema for Xplore Nexus. "
        "Previously missing columns and tables have been added.", "Normal")
    walk += 1

    tables_data = {
        "users": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",              "UUID",      "Primary key (auto-generated)"],
                ["email",           "VARCHAR",   "Unique, required"],
                ["password_hash",   "TEXT",      "bcrypt hashed"],
                ["full_name",       "VARCHAR",   ""],
                ["role",            "ENUM",      "admin | organizer | user"],
                ["avatar_url",      "TEXT",      "Profile photo URL — ADDED"],
                ["phone",           "VARCHAR",   "Optional — ADDED"],
                ["department",      "VARCHAR",   "User's department — ADDED"],
                ["organization_id", "UUID FK",   "For multi-tenant support — ADDED"],
                ["status",          "ENUM",      "active | inactive"],
                ["created_at",      "TIMESTAMP", ""],
                ["updated_at",      "TIMESTAMP", ""],
            ]
        },
        "events": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",               "UUID",      "Primary key"],
                ["title",            "VARCHAR",   ""],
                ["description",      "TEXT",      "ADDED"],
                ["type",             "ENUM",      "online | onsite"],
                ["location",         "VARCHAR",   "Physical address or 'Online' — ADDED"],
                ["start_time",       "TIMESTAMP", ""],
                ["end_time",         "TIMESTAMP", "ADDED"],
                ["max_participants", "INTEGER",   "Capacity limit — ADDED"],
                ["organizer_id",     "UUID FK",   "References users.id"],
                ["status",           "ENUM",      "upcoming | live | completed | cancelled — ADDED"],
                ["is_paid",          "BOOLEAN",   "ADDED"],
                ["price",            "DECIMAL",   "0.00 if free — ADDED"],
                ["created_at",       "TIMESTAMP", ""],
            ]
        },
        "meetings": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",              "UUID",      "Primary key"],
                ["title",           "VARCHAR",   ""],
                ["host_id",         "UUID FK",   "References users.id"],
                ["zoom_meeting_id", "VARCHAR",   "From Zoom API — ADDED"],
                ["zoom_join_url",   "TEXT",      "Meeting join link"],
                ["start_time",      "TIMESTAMP", "ADDED"],
                ["end_time",        "TIMESTAMP", "ADDED"],
                ["duration_min",    "INTEGER",   "Duration in minutes"],
                ["max_participants","INTEGER",   "ADDED"],
                ["status",          "ENUM",      "upcoming | live | completed — ADDED"],
                ["created_at",      "TIMESTAMP", ""],
            ]
        },
        "trainings": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",             "UUID",      "Primary key"],
                ["title",          "VARCHAR",   ""],
                ["description",    "TEXT",      "ADDED"],
                ["category",       "VARCHAR",   "e.g. Leadership, Tech — ADDED"],
                ["instructor_id",  "UUID FK",   "References users.id"],
                ["thumbnail_url",  "TEXT",      "Course cover image — ADDED"],
                ["duration_hours", "DECIMAL",   "Estimated total hours — ADDED"],
                ["status",         "ENUM",      "draft | published | archived — ADDED"],
                ["created_at",     "TIMESTAMP", ""],
            ]
        },
        "certificates": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",              "UUID",      "Primary key"],
                ["user_id",         "UUID FK",   "References users.id"],
                ["training_id",     "UUID FK",   "References trainings.id"],
                ["issued_at",       "TIMESTAMP", "ADDED"],
                ["certificate_url", "TEXT",      "PDF download URL — ADDED"],
                ["expiry_date",     "DATE",      "Optional — ADDED"],
            ]
        },
        "user_training_progress": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",               "UUID",      "Primary key"],
                ["user_id",          "UUID FK",   "References users.id"],
                ["training_id",      "UUID FK",   "References trainings.id"],
                ["progress_percent", "INTEGER",   "0–100"],
                ["status",           "ENUM",      "enrolled | in_progress | completed — ADDED"],
                ["completed_at",     "TIMESTAMP", "NULL until completed — ADDED"],
                ["last_accessed_at", "TIMESTAMP", "ADDED"],
            ]
        },
        "payments (NEW TABLE)": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",           "UUID",      "Primary key"],
                ["user_id",      "UUID FK",   "References users.id"],
                ["event_id",     "UUID FK",   "References events.id"],
                ["amount",       "DECIMAL",   "Amount charged"],
                ["currency",     "VARCHAR",   "Default: PHP"],
                ["status",       "ENUM",      "pending | paid | failed | refunded"],
                ["provider",     "ENUM",      "paymongo | stripe"],
                ["reference_id", "VARCHAR",   "External provider transaction ID"],
                ["paid_at",      "TIMESTAMP", "NULL until confirmed"],
                ["created_at",   "TIMESTAMP", ""],
            ]
        },
        "notifications (NEW TABLE)": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",         "UUID",      "Primary key"],
                ["user_id",    "UUID FK",   "References users.id"],
                ["title",      "VARCHAR",   "Short notification title"],
                ["message",    "TEXT",      "Notification body"],
                ["is_read",    "BOOLEAN",   "Default: false"],
                ["type",       "VARCHAR",   "e.g. event_reminder, cert_issued"],
                ["created_at", "TIMESTAMP", ""],
            ]
        },
        "organizations (NEW TABLE — Multi-Tenant)": {
            "headers": ["Column", "Type", "Notes"],
            "rows": [
                ["id",         "UUID",      "Primary key"],
                ["name",       "VARCHAR",   "Organization name"],
                ["slug",       "VARCHAR",   "Unique URL-safe identifier"],
                ["logo_url",   "TEXT",      "Optional"],
                ["plan",       "ENUM",      "free | pro | enterprise"],
                ["created_at", "TIMESTAMP", ""],
            ]
        },
    }

    for table_name, table_def in tables_data.items():
        insert_paragraph_after(doc, walk, "", "Normal")
        walk += 1
        add_heading_after(doc, walk, f"Table: {table_name}", level=3)
        walk += 1
        add_table_after(doc, walk, table_def["headers"], table_def["rows"])
        walk += 1

    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1

# ─── 6. ADD: Section 8.7 Authentication & Authorization Flow ────────────────

auth_anchor = find_para_index(doc, "8.6 API Design Overview")
if auth_anchor:
    # Navigate to end of 8.6 block
    end_86 = auth_anchor
    for i in range(auth_anchor, min(auth_anchor + 120, len(doc.paragraphs))):
        t = doc.paragraphs[i].text.strip()
        if t and "9. Risk" in t:
            end_86 = i - 1
            break
        end_86 = i

    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1
    add_heading_after(doc, end_86, "8.7 Authentication & Authorization Flow", level=2)
    end_86 += 1
    insert_paragraph_after(doc, end_86,
        "The platform uses Supabase Auth (built on GoTrue) combined with JWT-based session management. "
        "The following describes the complete authentication and access control flow:", "Normal")
    end_86 += 1

    auth_items = [
        ("Login Method",       "Email and password. OAuth (Google) may be added as a future enhancement."),
        ("Registration",       "Invite-only for Organizers and Admins. Standard users can self-register via the public signup page."),
        ("Session Strategy",   "Supabase issues a JWT access token (1-hour expiry) and a refresh token (7-day expiry stored in an HttpOnly cookie). The client refreshes silently before expiry."),
        ("Password Reset",     "User requests reset via email. Supabase sends a one-time link valid for 24 hours. On click, user sets a new password."),
        ("Admin Account Setup","The first Admin account is seeded directly in Supabase. Subsequent Admins are created by an existing Admin through the Users Management module."),
        ("RBAC Enforcement",   "Role is stored in the users table and injected into the JWT claims. All Next.js API routes validate the role claim. Supabase Row-Level Security (RLS) policies provide a second enforcement layer at the database level."),
        ("Public Routes",      "POST /api/auth/login, POST /api/auth/register, GET /api/events (browse only). All other routes require a valid JWT Bearer token."),
    ]

    for label, detail in auth_items:
        insert_paragraph_after(doc, end_86, f"{label}: {detail}", "Normal")
        end_86 += 1

    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1

# ─── 7. ADD: Section 8.8 API Endpoint Reference (Draft) ─────────────────────

    add_heading_after(doc, end_86, "8.8 API Endpoint Reference (Draft)", level=2)
    end_86 += 1
    insert_paragraph_after(doc, end_86,
        "The following table lists the planned REST API endpoints. This is a living reference — "
        "additional endpoints will be added during development. All protected routes require the "
        "Authorization: Bearer <token> header.", "Normal")
    end_86 += 1

    api_headers = ["Method", "Route", "Description", "Auth Required"]
    api_rows = [
        ["POST",   "/api/auth/register",            "Register a new user account",                     "No"],
        ["POST",   "/api/auth/login",               "Log in and receive JWT + refresh token",           "No"],
        ["POST",   "/api/auth/logout",              "Invalidate session",                               "Yes"],
        ["POST",   "/api/auth/reset-password",      "Request password reset email",                     "No"],
        ["GET",    "/api/events",                   "List all upcoming events",                         "No"],
        ["POST",   "/api/events",                   "Create a new event",                               "Yes (Organizer/Admin)"],
        ["GET",    "/api/events/:id",               "Get event details",                                "No"],
        ["PUT",    "/api/events/:id",               "Update an event",                                  "Yes (Organizer/Admin)"],
        ["DELETE", "/api/events/:id",               "Delete an event",                                  "Yes (Admin)"],
        ["POST",   "/api/events/:id/register",      "Register current user for an event",               "Yes"],
        ["GET",    "/api/events/:id/participants",  "List event participants",                           "Yes (Admin/Organizer)"],
        ["GET",    "/api/meetings",                 "List all meetings",                                 "Yes"],
        ["POST",   "/api/meetings",                 "Schedule a new Zoom meeting",                      "Yes (Organizer/Admin)"],
        ["GET",    "/api/meetings/:id",             "Get meeting details + Zoom join URL",               "Yes"],
        ["DELETE", "/api/meetings/:id",             "Cancel a meeting",                                  "Yes (Admin)"],
        ["GET",    "/api/trainings",                "List all published trainings",                      "Yes"],
        ["POST",   "/api/trainings",                "Create a training program",                         "Yes (Admin/Organizer)"],
        ["GET",    "/api/trainings/:id",            "Get training program details",                      "Yes"],
        ["POST",   "/api/trainings/:id/enroll",     "Enroll current user in a training",                "Yes"],
        ["PUT",    "/api/trainings/:id/progress",   "Update user progress in a training",               "Yes"],
        ["GET",    "/api/users",                    "List all users",                                    "Yes (Admin)"],
        ["GET",    "/api/users/:id",                "Get user profile",                                  "Yes"],
        ["PUT",    "/api/users/:id",                "Update user profile or role",                       "Yes"],
        ["GET",    "/api/analytics/summary",        "Get dashboard metrics summary",                    "Yes (Admin)"],
        ["GET",    "/api/notifications",            "Get current user's notifications",                 "Yes"],
        ["PUT",    "/api/notifications/:id/read",   "Mark notification as read",                        "Yes"],
        ["POST",   "/api/payments/initiate",        "Initiate a payment for a paid event",              "Yes"],
        ["POST",   "/api/payments/webhook",         "Handle PayMongo/Stripe webhook callback",          "No (verified by signature)"],
    ]
    add_table_after(doc, end_86, api_headers, api_rows)
    end_86 += 1
    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1

# ─── 8. ADD: Section 8.9 Environment Variables Reference ────────────────────

    add_heading_after(doc, end_86, "8.9 Environment Variables Reference", level=2)
    end_86 += 1
    insert_paragraph_after(doc, end_86,
        "The following environment variables must be configured in a .env.local file for local development "
        "and in the Vercel project settings for production. Never commit secret values to the repository.", "Normal")
    end_86 += 1

    env_headers = ["Variable", "Description", "Example / Source"]
    env_rows = [
        ["NEXT_PUBLIC_SUPABASE_URL",      "Supabase project URL",                      "https://xxxx.supabase.co"],
        ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase public anon key",                  "Supabase dashboard > API Keys"],
        ["SUPABASE_SERVICE_ROLE_KEY",     "Supabase service role key (server-only)",   "Supabase dashboard > API Keys"],
        ["ZOOM_SDK_KEY",                  "Zoom Meeting SDK API key",                  "Zoom Marketplace app credentials"],
        ["ZOOM_SDK_SECRET",               "Zoom Meeting SDK secret",                   "Zoom Marketplace app credentials"],
        ["ZOOM_ACCOUNT_ID",               "Zoom Server-to-Server OAuth account ID",    "Zoom Marketplace"],
        ["ZOOM_CLIENT_ID",                "Zoom OAuth client ID",                      "Zoom Marketplace"],
        ["ZOOM_CLIENT_SECRET",            "Zoom OAuth client secret",                  "Zoom Marketplace"],
        ["PAYMONGO_SECRET_KEY",           "PayMongo secret key for server API calls",  "PayMongo dashboard"],
        ["PAYMONGO_PUBLIC_KEY",           "PayMongo public key for client-side",       "PayMongo dashboard"],
        ["PAYMONGO_WEBHOOK_SECRET",       "PayMongo webhook signing secret",           "PayMongo dashboard > Webhooks"],
        ["RESEND_API_KEY",                "Resend email API key for transactional mail","Resend dashboard"],
        ["NEXT_PUBLIC_APP_URL",           "Base URL of the deployed application",      "https://xplorenexus.vercel.app"],
        ["NEXTAUTH_SECRET",               "Secret for signing NextAuth sessions",      "Generate: openssl rand -base64 32"],
    ]
    add_table_after(doc, end_86, env_headers, env_rows)
    end_86 += 1
    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1

# ─── 9. ADD: Section 8.10 CI/CD and Branching Strategy ──────────────────────

    add_heading_after(doc, end_86, "8.10 CI/CD and Branching Strategy", level=2)
    end_86 += 1
    insert_paragraph_after(doc, end_86,
        "The project follows a trunk-based Git workflow with feature branches and Vercel preview deployments.", "Normal")
    end_86 += 1

    branch_headers = ["Branch", "Purpose", "Auto-Deploy Target"]
    branch_rows = [
        ["main",            "Production-ready code only. Protected branch — requires PR approval.",  "Production (xplorenexus.vercel.app)"],
        ["develop",         "Integration branch for tested features before merging to main.",        "Staging (xplorenexus-dev.vercel.app)"],
        ["feature/<name>",  "Feature-specific branches (e.g. feature/event-registration).",         "Preview URL (unique per PR)"],
        ["fix/<name>",      "Bug fix branches.",                                                    "Preview URL (unique per PR)"],
    ]
    add_table_after(doc, end_86, branch_headers, branch_rows)
    end_86 += 1

    insert_paragraph_after(doc, end_86,
        "Deployment is triggered automatically by Vercel on every push. Production deploys only trigger on "
        "merge to main via approved Pull Request.", "Normal")
    end_86 += 1
    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1

# ─── 10. ADD: Section 8.11 Payment Flow ─────────────────────────────────────

    add_heading_after(doc, end_86, "8.11 Payment Flow", level=2)
    end_86 += 1
    insert_paragraph_after(doc, end_86,
        "For paid events, the payment flow is as follows. The primary payment gateway is PayMongo "
        "(Philippines-based); Stripe is the alternative for international users:", "Normal")
    end_86 += 1

    pf_rows_data = [
        ("Step 1 — User Initiates Registration",
         "User clicks Register on a paid event. The frontend calls POST /api/payments/initiate with the event_id."),
        ("Step 2 — Payment Intent Created",
         "The server creates a payment intent via the PayMongo API and returns a checkout URL."),
        ("Step 3 — User Completes Payment",
         "User is redirected to the PayMongo-hosted checkout page. They enter payment details."),
        ("Step 4 — Webhook Confirmation",
         "PayMongo calls POST /api/payments/webhook. The server verifies the signature and marks payment status as paid."),
        ("Step 5 — Registration Confirmed",
         "The event registration record is created. A confirmation email with receipt is sent to the user."),
        ("Step 6 — Failure Handling",
         "If payment fails, the user is redirected back with an error. The payment record status is set to failed. No registration is created."),
        ("Refunds",
         "Refunds must be initiated manually by an Admin through the PayMongo dashboard for the MVP phase. Automated refund flow is a future enhancement."),
    ]
    for step, desc in pf_rows_data:
        insert_paragraph_after(doc, end_86, f"{step}: {desc}", "Normal")
        end_86 += 1
    insert_paragraph_after(doc, end_86, "", "Normal")
    end_86 += 1

# ─── 11. ADD: Section 13.6 Error Handling Strategy ──────────────────────────

err_anchor = find_para_index(doc, "13.")
# Walk to find end of Section 13
if err_anchor:
    end_13 = err_anchor
    for i in range(err_anchor, min(err_anchor + 120, len(doc.paragraphs))):
        t = doc.paragraphs[i].text.strip()
        if t and "14." in t:
            end_13 = i - 1
            break
        end_13 = i

    insert_paragraph_after(doc, end_13, "", "Normal")
    end_13 += 1
    add_heading_after(doc, end_13, "13.6 Error Handling Strategy", level=3)
    end_13 += 1
    insert_paragraph_after(doc, end_13,
        "The platform follows a consistent error handling approach across all layers:", "Normal")
    end_13 += 1

    err_items = [
        ("HTTP Status Codes",  "400 Bad Request (validation errors), 401 Unauthorized (missing/invalid token), 403 Forbidden (insufficient role), 404 Not Found, 500 Internal Server Error."),
        ("Error Response Shape","All API errors return a JSON object: { error: string, code: string, details?: any }. This ensures frontend components can display consistent user-facing messages."),
        ("Client-Side Errors", "Form validation errors are shown inline using Zod parsing. Network/API errors display a toast notification with a user-friendly message."),
        ("Server-Side Logging","All unhandled exceptions are logged with stack traces. Production logs are captured via Vercel Log Drains (or a logging service like Logtail)."),
        ("External API Failures","Failures from Zoom or PayMongo APIs return a user-facing error ('Unable to create meeting, please try again') while the full error is logged server-side."),
        ("Graceful Degradation","If the analytics service is unavailable, the dashboard displays cached data with a 'Data may be delayed' banner instead of crashing."),
    ]
    for label, detail in err_items:
        insert_paragraph_after(doc, end_13, f"{label}: {detail}", "Normal")
        end_13 += 1
    insert_paragraph_after(doc, end_13, "", "Normal")
    end_13 += 1

# ─── 12. ADD: Appendix A – Glossary ─────────────────────────────────────────

last_idx = len(doc.paragraphs) - 1
insert_paragraph_after(doc, last_idx, "", "Normal")
last_idx += 1
add_heading_after(doc, last_idx, "Appendix A — Glossary", level=2)
last_idx += 1
insert_paragraph_after(doc, last_idx,
    "The following terms are used throughout this document and the Xplore Nexus platform:", "Normal")
last_idx += 1

glossary_headers = ["Term", "Definition"]
glossary_rows = [
    ["Administrator (Admin)",  "A user role with full system access, including user management, role assignment, and system settings."],
    ["Organizer",              "A user role responsible for creating and managing events, meetings, and training programs."],
    ["Participant (User)",     "A standard user who can register for events, enroll in training, and join meetings."],
    ["RBAC",                   "Role-Based Access Control — a security model that restricts system access based on assigned user roles."],
    ["JWT",                    "JSON Web Token — a compact, URL-safe token format used for authentication and session management."],
    ["Live Session",           "An event or meeting that is currently in progress and available for users to join in real time."],
    ["Module",                 "A single unit of content within a training program (e.g., a video lesson or quiz section)."],
    ["Engagement Score",       "A composite metric reflecting user activity levels across events, meetings, and training on the platform."],
    ["Supabase",               "An open-source Firebase alternative providing PostgreSQL database, authentication, real-time subscriptions, and storage."],
    ["Zoom API",               "The Zoom Meeting SDK & REST API used to programmatically create and manage video meetings within the platform."],
    ["PayMongo",               "A Philippines-based payment gateway used for processing online payments within the platform."],
    ["Stripe",                 "An international payment gateway used as an alternative to PayMongo for non-Philippine users."],
    ["SSR",                    "Server-Side Rendering — a Next.js feature where pages are rendered on the server per request for improved SEO and performance."],
    ["RLS",                    "Row-Level Security — a Supabase/PostgreSQL feature that enforces data access rules at the database query level."],
    ["CI/CD",                  "Continuous Integration / Continuous Deployment — automated pipelines that build, test, and deploy code on each push."],
    ["WCAG",                   "Web Content Accessibility Guidelines — international standards for making web interfaces accessible to users with disabilities."],
    ["MVP",                    "Minimum Viable Product — the initial version of the product with only core functionality needed for launch."],
    ["Webhook",                "An HTTP callback triggered by an external service (e.g., PayMongo calls the platform's webhook URL upon payment confirmation)."],
]
add_table_after(doc, last_idx, glossary_headers, glossary_rows)
last_idx += 1

# ─── Save ─────────────────────────────────────────────────────────────────────

doc.save(DEST)
print(f"SUCCESS — Saved updated document to:\n{DEST}")
