"""
Adds an auto-updating Table of Contents (TOC) and page numbers
to PROJECT PROPOSAL (Complete).docx using native Word field codes.

After opening the output file in Microsoft Word:
  - Press Ctrl+A (select all) → F9 (update all fields)
  - The TOC will populate with headings + correct page numbers
  - It auto-updates every time you do Ctrl+A → F9
"""

from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import copy, os

SRC  = r"c:\jolo\College\Work Related\Xplore Project Proposal\Dev\PROJECT PROPOSAL (Complete).docx"
DEST = r"c:\jolo\College\Work Related\Xplore Project Proposal\PROJECT PROPOSAL (Final).docx"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def make_run_elem():
    return OxmlElement('w:r')

def make_fld_char(fld_type, dirty=False):
    fc = OxmlElement('w:fldChar')
    fc.set(qn('w:fldCharType'), fld_type)
    if dirty:
        fc.set(qn('w:dirty'), 'true')
    return fc

# ─── 1. Build the TOC page XML ───────────────────────────────────────────────

def build_toc_title_para():
    """'TABLE OF CONTENTS' heading paragraph."""
    p = OxmlElement('w:p')

    pPr = OxmlElement('w:pPr')
    # Use the document's Heading 1 style if it exists, else a manual bold style
    pStyle = OxmlElement('w:pStyle')
    pStyle.set(qn('w:val'), 'Heading1')
    pPr.append(pStyle)

    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), 'center')
    pPr.append(jc)
    p.append(pPr)

    r = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    b = OxmlElement('w:b')
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '28')          # 14pt
    rPr.append(b)
    rPr.append(sz)
    r.append(rPr)

    t = OxmlElement('w:t')
    t.text = 'TABLE OF CONTENTS'
    r.append(t)
    p.append(r)
    return p


def build_toc_field_para():
    """The actual { TOC \\o "1-3" \\h \\z \\u } field paragraph."""
    p = OxmlElement('w:p')

    # begin
    r1 = make_run_elem()
    r1.append(make_fld_char('begin', dirty=True))
    p.append(r1)

    # instruction
    r2 = make_run_elem()
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = r' TOC \o "2-3" \h \z \u '
    r2.append(instr)
    p.append(r2)

    # separate
    r3 = make_run_elem()
    r3.append(make_fld_char('separate'))
    p.append(r3)

    # placeholder text (shown before first update)
    r4 = make_run_elem()
    rPr4 = OxmlElement('w:rPr')
    color = OxmlElement('w:color')
    color.set(qn('w:val'), '808080')
    rPr4.append(color)
    r4.append(rPr4)
    t4 = OxmlElement('w:t')
    t4.set(qn('xml:space'), 'preserve')
    t4.text = '[Open in Word → press Ctrl+A then F9 to generate TOC]'
    r4.append(t4)
    p.append(r4)

    # end
    r5 = make_run_elem()
    r5.append(make_fld_char('end'))
    p.append(r5)

    return p


def build_page_break_para():
    """A paragraph containing only a page break."""
    p  = OxmlElement('w:p')
    r  = OxmlElement('w:r')
    br = OxmlElement('w:br')
    br.set(qn('w:type'), 'page')
    r.append(br)
    p.append(r)
    return p


# ─── 2. Page numbers in footer ───────────────────────────────────────────────

def add_page_numbers(doc: Document):
    """Insert centered 'Page X of Y' numbers in the footer of every section."""
    for section in doc.sections:
        footer = section.footer
        footer.is_linked_to_previous = False

        # Reuse or create the first paragraph
        if footer.paragraphs:
            para = footer.paragraphs[0]
            # Clear existing runs
            for child in list(para._p):
                if child.tag in (qn('w:r'), qn('w:hyperlink')):
                    para._p.remove(child)
        else:
            para = footer.add_paragraph()

        para.alignment = WD_ALIGN_PARAGRAPH.CENTER

        def field_run(instruction: str):
            r = OxmlElement('w:r')
            rPr = OxmlElement('w:rPr')
            sz = OxmlElement('w:sz')
            sz.set(qn('w:val'), '20')   # 10pt
            rPr.append(sz)
            r.append(rPr)

            fc1 = make_fld_char('begin')
            r.append(fc1)
            instr = OxmlElement('w:instrText')
            instr.set(qn('xml:space'), 'preserve')
            instr.text = f' {instruction} '
            r.append(instr)
            fc2 = make_fld_char('separate')
            r.append(fc2)
            fc3 = make_fld_char('end')
            r.append(fc3)
            return r

        def text_run(text: str):
            r = OxmlElement('w:r')
            rPr = OxmlElement('w:rPr')
            sz = OxmlElement('w:sz')
            sz.set(qn('w:val'), '20')
            rPr.append(sz)
            r.append(rPr)
            t = OxmlElement('w:t')
            t.set(qn('xml:space'), 'preserve')
            t.text = text
            r.append(t)
            return r

        # Assemble: "Page { PAGE } of { NUMPAGES }"
        para._p.append(text_run('Page '))
        para._p.append(field_run('PAGE'))
        para._p.append(text_run(' of '))
        para._p.append(field_run('NUMPAGES'))


# ─── 3. Find insertion point + insert TOC ────────────────────────────────────

def find_first_heading1(body):
    """
    Return the first <w:p> element that uses a Heading 1 style.
    This is where we insert the TOC *before*.
    """
    for p in body.findall(qn('w:p')):
        pPr = p.find(qn('w:pPr'))
        if pPr is None:
            continue
        pStyle = pPr.find(qn('w:pStyle'))
        if pStyle is None:
            continue
        val = pStyle.get(qn('w:val'), '')
        # Match common Heading 1 style names used by Word
        if val in ('Heading1', 'Heading 1', '1', 'heading1', 'heading 1'):
            return p
    return None


def find_first_section_heading(body):
    """
    Find the paragraph that starts '1.' with any heading style —
    that's where the first real section begins. TOC goes just before it.
    """
    from docx.oxml.ns import qn as _qn
    for p in body.findall(_qn('w:p')):
        # get style
        pPr = p.find(_qn('w:pPr'))
        if pPr is None:
            continue
        pStyle = pPr.find(_qn('w:pStyle'))
        if pStyle is None:
            continue
        val = pStyle.get(_qn('w:val'), '')
        if 'Heading' in val or 'heading' in val:
            # get text content
            texts = [t.text or '' for t in p.findall('.//' + _qn('w:t'))]
            full = ''.join(texts).strip()
            if full.startswith('1.') or full.startswith('1 '):
                return p
    return None


def insert_toc(doc: Document):
    body = doc.element.body

    insertion_point = find_first_section_heading(body)

    if insertion_point is None:
        # Fallback — after first 16 paragraphs (skip cover page)
        paras = body.findall(qn('w:p'))
        insertion_point = paras[16] if len(paras) > 16 else paras[0]
        print("[!] Fallback: inserting TOC after cover page paragraphs.")
    else:
        print("[+] Found '1. Project Overview' -- inserting TOC before it.")

    idx = list(body).index(insertion_point)

    # Insert in reverse order so indices stay correct:
    # 4. page break (back to content)
    # 3. TOC field
    # 2. TOC title heading
    # 1. page break (give TOC its own page)
    body.insert(idx, build_page_break_para())   # after TOC — new page for content
    body.insert(idx, build_toc_field_para())    # the { TOC } field
    body.insert(idx, build_toc_title_para())    # "TABLE OF CONTENTS" heading
    body.insert(idx, build_page_break_para())   # before TOC — page break from cover


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"Opening: {SRC}")
    doc = Document(SRC)

    print("Adding page numbers (Page X of Y) to all section footers…")
    add_page_numbers(doc)

    print("Inserting auto-updating Table of Contents field…")
    insert_toc(doc)

    os.makedirs(os.path.dirname(DEST), exist_ok=True)
    doc.save(DEST)
    print("\nDone! Saved to:\n   " + DEST)
    print("")
    print("--------------------------------------------------")
    print(" NEXT STEPS in Microsoft Word:")
    print("  1. Open the saved file")
    print("  2. Press  Ctrl + A  (select all)")
    print("  3. Press  F9        (update all fields)")
    print("  4. Choose 'Update entire table' when prompted")
    print("  -> TOC will populate with headings & page numbers.")
    print("  -> Repeat Ctrl+A + F9 any time you add/delete pages.")
    print("--------------------------------------------------")

if __name__ == '__main__':
    main()
