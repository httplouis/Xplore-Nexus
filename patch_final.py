# -*- coding: utf-8 -*-
"""
patch_final.py  —  Fixes all 6 issues found in PROJECT PROPOSAL (Final).docx:
  1. Duplicate 8.6.1 heading (remove old plain-text one)
  2. Section 13.6 appears before 13.5 — fix numbering
  3. Duplicate 8.7 — rename old Site Map to 8.7, rename new Auth to 8.9
  4. Duplicate 8.8 — rename Activity Diagram to correct number
  5. Activity Diagram section is empty — insert the full diagrams
  6. Section 15.3 Version Log is empty — insert table
  + Add Authentication flow + complete activity diagrams
"""

import shutil
from docx import Document
from docx.shared import RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SRC  = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Final).docx"
DEST = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Complete).docx"

# Work on a temp copy then overwrite
TEMP = SRC.replace("(Final)", "(Patching)")
shutil.copy2(SRC, TEMP)
doc = Document(TEMP)

# ─── helpers ──────────────────────────────────────────────────────────────────

def find_para_index(doc, fragment):
    for i, p in enumerate(doc.paragraphs):
        if fragment in p.text:
            return i
    return None

def insert_paragraph_after(doc, ref_index, text, style="Normal"):
    ref_para = doc.paragraphs[ref_index]
    new_el = OxmlElement("w:p")
    ref_para._element.addnext(new_el)
    new_p = doc.paragraphs[ref_index + 1]
    try:
        for s in doc.styles:
            try:
                if s.name and s.name.lower() == style.lower():
                    new_p.style = s
                    break
            except:
                pass
    except:
        pass
    if text:
        new_p.add_run(text)
    return new_p

def add_heading_after(doc, ref_index, text, level=3):
    p = insert_paragraph_after(doc, ref_index, "", f"Heading {level}")
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
    for bn in ('top','left','bottom','right','insideH','insideV'):
        b = OxmlElement(f'w:{bn}')
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), '4')
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), 'AAAAAA')
        tblBorders.append(b)
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
        rc = table.add_row().cells
        for j, val in enumerate(row_data):
            rc[j].text = str(val)
    ref_para._element.addnext(table._tbl)
    return table

def get_last(doc):
    return len(doc.paragraphs) - 1

# ══════════════════════════════════════════════════════════════════════════════
# FIX 1: Remove duplicate plain-text "8.6.1 Database Design / Schema" paragraph
# ══════════════════════════════════════════════════════════════════════════════

idx_old_861 = find_para_index(doc, "8.6.1 Database Design / Schema")
if idx_old_861 is not None:
    p = doc.paragraphs[idx_old_861]
    p._element.getparent().remove(p._element)
    print(f"FIX 1: Removed duplicate 8.6.1 at para {idx_old_861}")

# ══════════════════════════════════════════════════════════════════════════════
# FIX 2: Fix section ordering — 13.6 appears before 13.5
#         Rename existing 13.6 heading to 13.5 (Error Handling)
#         and rename old 13.5 (Reliability, which is after it) to 13.6
# ══════════════════════════════════════════════════════════════════════════════

idx_136 = find_para_index(doc, "13.6 Error Handling Strategy")
idx_135 = find_para_index(doc, "13.5 System Reliability")

if idx_136 and idx_135 and idx_136 < idx_135:
    # Swap the section numbers in the heading text
    p136 = doc.paragraphs[idx_136]
    p136.clear()
    p136.add_run("13.5 Error Handling Strategy")

    p135 = doc.paragraphs[idx_135]
    p135.clear()
    p135.add_run("13.6 System Reliability")
    print("FIX 2: Swapped 13.5 <-> 13.6 to correct order")

# ══════════════════════════════════════════════════════════════════════════════
# FIX 3: Fix duplicate 8.7 — old Site Map stays as 8.7,
#         rename new Auth heading from 8.7 → 8.9
# ══════════════════════════════════════════════════════════════════════════════

idx_auth_87 = find_para_index(doc, "8.7 Authentication & Authorization Flow")
if idx_auth_87:
    p = doc.paragraphs[idx_auth_87]
    p.clear()
    run = p.add_run("8.9 Authentication & Authorization Flow")
    print(f"FIX 3: Renamed duplicate 8.7 Auth section to 8.9")

# ══════════════════════════════════════════════════════════════════════════════
# FIX 4: Fix duplicate 8.8 — API stays 8.8, Activity Diagram → 8.10
# ══════════════════════════════════════════════════════════════════════════════

idx_actd = find_para_index(doc, "8.8 Activity Diagram")
if idx_actd:
    p = doc.paragraphs[idx_actd]
    p.clear()
    run = p.add_run("8.10 Activity Diagrams")
    run.bold = True
    print(f"FIX 4: Renamed duplicate 8.8 Activity Diagram to 8.10")

# ══════════════════════════════════════════════════════════════════════════════
# FIX 5: Fill in the Activity Diagrams section (8.10) with full content
# ══════════════════════════════════════════════════════════════════════════════

idx_act = find_para_index(doc, "8.10 Activity Diagrams")
if idx_act:
    walk = idx_act
    insert_paragraph_after(doc, walk,
        "The following activity diagrams describe the step-by-step flow of actions, decision points, "
        "and system responses for each major module of Xplore Nexus.", "Normal")
    walk += 1
    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1

    all_diagrams = [
        ("Authentication Flow  (Entry Point)", [
            "  START",
            "     |",
            "     v",
            "  [Open Login Page]",
            "     |",
            "     v",
            "  [Enter Credentials]",
            "     |",
            "     v",
            "  [Validate Credentials]  <-- (System)",
            "     |",
            "     v",
            "  <> Valid?",
            "  |",
            "  +-- INVALID --> [Display Error Message]",
            "  |                       |",
            "  |                       +--> (back to Enter Credentials)",
            "  |",
            "  +-- VALID --> [Generate JWT Session Token]  <-- (System)",
            "                        |",
            "                        v",
            "               [Load Dashboard]  <-- (System)",
            "                        |",
            "                        v",
            "               [View Dashboard & Select Module]",
            "                        |",
            "                        v",
            "               <> Which Module?",
            "               |",
            "               +-- Event Management    --> [ See: Event Management Flow ]",
            "               +-- Meeting Coordination --> [ See: Meeting Coordination Flow ]",
            "               +-- Training Management  --> [ See: Training Management Flow ]",
        ]),
        ("Event Management Flow", [
            "  [Create / View Event]",
            "           |",
            "           v",
            "  [Input Event Details]",
            "  (Title, Date, Location, Participants)",
            "           |",
            "           v",
            "  [Submit Event]",
            "           |",
            "           v",
            "  [Save Event to Database]  <-- (System)",
            "           |",
            "           v",
            "  <> Needs Admin Approval?",
            "  |",
            "  +-- YES --> [Review & Approve Event]  <-- (Admin)",
            "  |                    |",
            "  |                    v  Approved",
            "  |          [Notify Participants]  <-- (System)",
            "  |                    |",
            "  +-- NO  ------------+",
            "                      |",
            "                      v",
            "           [Log Action to Database]",
            "                      |",
            "                      v",
            "           [Return to Dashboard]",
        ]),
        ("Meeting Coordination Flow", [
            "  [Schedule Meeting]",
            "           |",
            "           v",
            "  [Select Participants & Time]",
            "           |",
            "           v",
            "  [Check Participant Availability]  <-- (System)",
            "           |",
            "           v",
            "  <> Time Slot Available?",
            "  |",
            "  +-- NOT AVAILABLE --> [Adjust Time Slot]",
            "  |                           |",
            "  |                           +--> (back to Check Availability)",
            "  |",
            "  +-- AVAILABLE --> [Confirm Meeting & Send Invites]  <-- (System)",
            "                               |",
            "                               v",
            "                   [Generate Zoom Meeting Link]  <-- (Zoom API)",
            "                               |",
            "                               v",
            "                   [Log Action to Database]",
            "                               |",
            "                               v",
            "                   [Return to Dashboard]",
        ]),
        ("Training Management Flow", [
            "  [Browse Available Trainings]",
            "           |",
            "           v",
            "  [Enroll in Training]",
            "           |",
            "           v",
            "  [Record Enrollment]  <-- (System)",
            "           |",
            "           v",
            "  [Send Confirmation Notification]  <-- (System)",
            "           |",
            "           v",
            "  [Access Training Modules]",
            "           |",
            "           v",
            "  <> Training Completed?",
            "  |",
            "  +-- NO  --> [Continue Modules]",
            "  |                  |",
            "  |                  +--> (back to Access Training Modules)",
            "  |",
            "  +-- YES --> [Generate Certificate]  <-- (System)",
            "                       |",
            "                       v",
            "           [Log Action to Database]",
            "                       |",
            "                       v",
            "           [Return to Dashboard]",
            "                       |",
            "                       v",
            "                     END",
        ]),
    ]

    for section_title, lines in all_diagrams:
        insert_paragraph_after(doc, walk, "", "Normal")
        walk += 1
        add_heading_after(doc, walk, section_title, level=3)
        walk += 1
        insert_paragraph_after(doc, walk, "", "Normal")
        walk += 1
        for line in lines:
            insert_paragraph_after(doc, walk, line, "Normal")
            walk += 1
        insert_paragraph_after(doc, walk, "", "Normal")
        walk += 1

    print(f"FIX 5: Inserted all 4 activity diagrams into Section 8.10")

# ══════════════════════════════════════════════════════════════════════════════
# FIX 6: Populate Section 15.3 Version Log table
# ══════════════════════════════════════════════════════════════════════════════

idx_153 = find_para_index(doc, "15.3 Version Update")
if idx_153:
    walk = idx_153
    insert_paragraph_after(doc, walk, "", "Normal")
    walk += 1
    insert_paragraph_after(doc, walk,
        "The following Version Log must be updated every time a significant change is made to "
        "the system or this documentation. All contributors should add a new entry per release.", "Normal")
    walk += 1

    ver_headers = ["Version", "Date", "Author", "Summary of Changes"]
    ver_rows = [
        ["v0.1.0", "April 2025",  "Intern Dev",
         "Initial project proposal drafted. System planning, objectives, and scope defined."],
        ["v0.2.0", "April 2025",  "Intern Dev",
         "UI/UX wireframes completed in Figma. Dashboard, Events, Meetings, Training layouts finalized."],
        ["v0.3.0", "April 2025",  "Intern Dev",
         "Technical documentation fully expanded: FR/NFR table, Auth flow, API endpoints, DB schema (all tables), environment variables, CI/CD strategy, glossary, site map, activity diagrams, developer onboarding guide."],
        ["v1.0.0", "TBD",         "Intern Dev",
         "MVP launch. Core modules functional: Events, Meetings, Training, Analytics, User Management."],
        ["v1.1.0", "TBD",         "Next Developer",
         "Payment integration (PayMongo), certificate generation, email notification system fully operational."],
        ["v1.2.0", "TBD",         "Next Developer",
         "Advanced analytics: exportable PDF/CSV reports, attendance trend charts, engagement scoring."],
        ["v2.0.0", "TBD",         "Next Developer",
         "Multi-tenant organization support added. SaaS public launch preparation begins."],
    ]
    add_table_after(doc, walk, ver_headers, ver_rows)
    walk += 1
    insert_paragraph_after(doc, walk, "", "Normal")
    print(f"FIX 6: Populated Section 15.3 Version Log with 7 entries")

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════

import os
doc.save(TEMP)
# Now overwrite the Final file
shutil.copy2(TEMP, DEST)
os.remove(TEMP)

print(f"\nSUCCESS — Patched document saved to:\n{DEST}")
final_doc = Document(DEST)
print(f"Total paragraphs: {len(final_doc.paragraphs)}")
print(f"Total tables: {len(final_doc.tables)}")
