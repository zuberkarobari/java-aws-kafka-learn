import zipfile
import xml.etree.ElementTree as ET
import os
import re
import sys

# Define XML namespaces
NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def get_text_runs(paragraph):
    """Extract text runs and check formatting (monospace, bold)."""
    runs_data = []
    for r in paragraph.findall('w:r', NS):
        # Check font
        is_monospace = False
        rPr = r.find('w:rPr', NS)
        is_bold = False
        if rPr is not None:
            rFonts = r.find('w:rPr/w:rFonts', NS)
            if rFonts is not None:
                ascii_font = rFonts.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii', '')
                hAnsi_font = rFonts.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi', '')
                if any(f in (ascii_font or '').lower() or f in (hAnsi_font or '').lower() for f in ['consolas', 'courier', 'monospace', 'source code']):
                    is_monospace = True
            
            # Check bold
            bold_node = rPr.find('w:b', NS)
            if bold_node is not None:
                is_bold = True
        
        # Get text
        t_text = []
        for t in r.findall('w:t', NS):
            if t.text:
                t_text.append(t.text)
        
        if t_text:
            runs_data.append({
                'text': "".join(t_text),
                'code': is_monospace,
                'bold': is_bold
            })
    return runs_data

def parse_docx(docx_path):
    """Parse the docx file into a list of structured blocks."""
    if not os.path.exists(docx_path):
        print(f"Error: File not found: {docx_path}")
        return []

    with zipfile.ZipFile(docx_path) as z:
        doc_xml = z.read('word/document.xml')
        root = ET.fromstring(doc_xml)
        
        body = root.find('w:body', NS)
        if body is None:
            return []
            
        blocks = []
        
        # Read all paragraphs in document order (including inside tables)
        for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            runs = get_text_runs(p)
            if not runs:
                continue
            
            # Combine text and determine if the whole paragraph is code
            p_text = "".join(r['text'] for r in runs)
            if not p_text.strip():
                continue
                
            is_code = all(r['code'] for r in runs)
            
            # Check if paragraph style is heading or if all runs are bold
            is_bold = False
            pPr = p.find('w:pPr', NS)
            style_val = ""
            if pPr is not None:
                pStyle = pPr.find('w:pStyle', NS)
                if pStyle is not None:
                    style_val = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '')
            
            if 'heading' in (style_val or '').lower() or 'title' in (style_val or '').lower():
                is_bold = True
            else:
                # Check if all runs are bold
                text_runs_bold = [r['bold'] for r in runs if r['text'].strip()]
                if text_runs_bold and all(text_runs_bold):
                    is_bold = True
            
            # Simple heuristic backup: if line starts with standard code signs, treat as code
            stripped = p_text.strip()
            if not is_code:
                code_heuristics = [
                    '//', 'import ', 'package ', 'public class ', 'private ', 'public ',
                    'String ', 'int ', 'double ', 'boolean ', 'long ', 'System.out.',
                    'for (', 'while (', 'if (', 'try {', 'catch (', 'finally {', 'return ',
                    'new String', 'ConfigurationManager', 'instance =', 'synchronized ('
                ]
                if any(stripped.startswith(h) for h in code_heuristics) or (stripped.endswith(';') and ('=' in stripped or '(' in stripped)):
                    is_code = True
            
            blocks.append({
                'text': p_text,
                'is_code': is_code,
                'is_bold': is_bold,
                'raw_p': p
            })
            
        return blocks

def clean_time_references(text):
    """Remove all time range, time slot, and duration references from text."""
    if not text:
        return ""
    # Remove patterns like "7:00 – 7:15 AM", "12:00 – 12:45 PM", "7:00-7:15 AM", "7:00 to 7:15 AM"
    text = re.sub(r'\b\d{1,2}:\d{2}\s*[\-–—to/]+\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b', '', text)
    # Remove single times like "7:00 AM", "6:00 PM", "7:00am", "12:00pm", "1:30 PM", etc.
    text = re.sub(r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b', '', text)
    # Remove parenthesized durations like "(15 minutes)", "(75 minutes)", "(60 minutes)", "(1.5 hrs)", "(~7.5 hrs)"
    text = re.sub(r'\(\s*~\d+(?:\.\d+)?\s*(?:minutes|mins|min|hours|hrs|hr|sec|seconds)\s*\)', '', text)
    text = re.sub(r'\(\s*\d+(?:\.\d+)?\s*(?:minutes|mins|min|hours|hrs|hr|sec|seconds)\s*\)', '', text)
    # Remove bracketed durations like "[15 min]", "[2 min]", "[5 min reading]"
    text = re.sub(r'\[\s*\d+\s*(?:minutes|mins|min|hours|hrs|hr|sec|seconds|reading)*\s*\]', '', text)
    # Remove trailing/leading dashes or punctuation left over
    text = re.sub(r'\s*[\-–—]+\s*$', '', text)
    text = re.sub(r'^\s*[\-–—]+\s*', '', text)
    # Clean multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def compile_blocks_to_html(blocks, day_num, title_override=None):
    """Compile structured blocks into beautiful premium checklist HTML without time references."""
    html_content = []
    
    # State tracking for code blocks and checklists
    in_code_block = False
    current_code = []
    
    in_checklist = False
    
    questions_count = 0
    h2_count = 0
    
    # Standard metadata headers
    day_title = f"Day {day_num} Study Checklist"
    day_subtitle = ""
    prepared_for = "Md Zuber"
    target_role = "Senior Java Backend Engineer (5–8 LPA+)"
    
    # Try to extract actual metadata from first few blocks dynamically
    for idx, b in enumerate(blocks[:8]):
        t = b['text'].strip()
        if "DAY " in t and ("STUDY CHECKLIST" in t or "REVIEW" in t or "MOCK" in t):
            day_title = t
            # If the next block exists and is not code, it is the subtitle
            if idx + 1 < len(blocks):
                next_t = blocks[idx+1]['text'].strip()
                if len(next_t) < 150 and not blocks[idx+1]['is_code'] and not next_t.startswith("Prepared"):
                    day_subtitle = next_t
            break
            
    # Process blocks
    i = 0
    while i < len(blocks):
        block = blocks[i]
        text = block['text']
        is_code = block['is_code']
        stripped_raw = text.strip()
        
        # 1. Handle Code Blocks
        if is_code:
            if not in_code_block:
                # Close any active checklist
                if in_checklist:
                    html_content.append("    </ul>")
                    in_checklist = False
                in_code_block = True
                current_code = []
            
            current_code.append(text)
            i += 1
            continue
        else:
            if in_code_block:
                # Output gathered code
                code_text = "\n".join(current_code)
                # Escape HTML tags
                code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                html_content.append(f'    <pre><code class="language-java">{code_text}</code></pre>')
                in_code_block = False
                current_code = []
                
        # Skip title and initial setup meta blocks
        if any(h in stripped_raw for h in ["Prepared for:", "Target:", "Day Status", "Time Block", "What You Will Cover", "What You'll Be Doing"]):
            i += 1
            continue
            
        # Clean times from raw text
        cleaned_text = clean_time_references(stripped_raw)
        
        # 2. Skip purely time-based blocks or empty blocks
        if not cleaned_text or any(s in cleaned_text.lower() for s in ["start", "finish", "lunch", "break", "time block", "study time", "topics", "cards"]):
            if any(k in cleaned_text.lower() for k in ["start", "finish", "lunch", "break", "topics", "cards"]) or re.search(r'\b\d{1,2}:\d{2}', stripped_raw):
                i += 1
                continue
                
        # 3. Handle Checklist Items
        if "☐" in text or stripped_raw.startswith("☐") or (stripped_raw.startswith("-") and "☐" in text):
            if not in_checklist:
                # Open checklist
                html_content.append('    <ul class="study-checklist">')
                in_checklist = True
                
            clean_item = stripped_raw.replace("☐", "").strip()
            clean_item = clean_time_references(clean_item)
            
            if clean_item:
                html_content.append(f'      <li><span class="checkbox-label">{clean_item}</span></li>')
            i += 1
            continue
        else:
            if in_checklist:
                html_content.append("    </ul>")
                in_checklist = False
                
        # 4. Handle Golden Rules
        if cleaned_text.lower().startswith("today's golden rule") or cleaned_text.lower().startswith("today's rule") or cleaned_text.lower().startswith("golden rule"):
            # The rule content is likely in the next block
            rule_text = ""
            if i + 1 < len(blocks):
                rule_text = clean_time_references(blocks[i+1]['text'].strip())
                
            html_content.append(f"""
    <div class="mentor-card" style="border-left-color: var(--warning) !important;">
      <div class="mentor-avatar">🏆</div>
      <div class="mentor-bubble">
        <h4 class="mentor-title" style="color: var(--warning) !important;">Today's Golden Rule</h4>
        <p class="mentor-text">{rule_text}</p>
      </div>
    </div>
            """)
            i += 2
            continue

        # 5. Handle Mock Interview Q&A Accordions
        is_question = False
        if stripped_raw.startswith("🎤"):
            is_question = True
        elif re.match(r'^Q\d*[\.:]\s*', stripped_raw, re.IGNORECASE):
            is_question = True

        if is_question:
            questions_count += 1
            question_text = stripped_raw.replace("🎤", "").strip()
            # Strip Q1. Q2: prefix
            question_text = re.sub(r'^Q\d*[\.:]\s*', '', question_text, flags=re.IGNORECASE).strip()
            question_text = clean_time_references(question_text)
            
            # Gather the ideal answer from subsequent blocks
            i += 1
            answer_paras = []
            while i < len(blocks):
                next_block = blocks[i]
                next_text = next_block['text'].strip()
                
                # Check if the next block starts a new checklist, header, code, question, or mentor tip
                if next_block['is_code']:
                    break
                if any(h in next_text for h in ["☐", "🔵", "🟢", "🟠", "🟣", "🔴", "🎤", "💻", "🗣", "💬"]):
                    break
                # Check if it starts a new question
                if re.match(r'^Q\d*[\.:]\s*', next_text, re.IGNORECASE):
                    break
                # Check if it starts a new main section heading
                if re.match(r'^(?:Section\s+\d+|Topic\s+\d+)', next_text, re.IGNORECASE):
                    break
                # Check if it is a bold heading
                if next_block.get('is_bold', False) and len(next_text) < 120 and not any(k in next_text.lower() for k in ["start", "finish", "lunch", "break"]):
                    if not next_text.endswith(":") and not next_text.endswith("?"):
                        break
                        
                ans_text = next_text
                if ans_text.startswith("💡") or ans_text.startswith("Ideal Answer:") or ans_text.startswith("Answer:") or ans_text.startswith("A:") or ans_text.startswith("A. "):
                    ans_text = re.sub(r'^(?:💡|Ideal Answer:|Answer:|A[\.:])\s*', '', ans_text, flags=re.IGNORECASE).strip()
                ans_text = clean_time_references(ans_text)
                if ans_text:
                    answer_paras.append(ans_text)
                i += 1
                
            answer_body = "<br><br>".join(answer_paras)
            html_content.append(f"""
    <div class="interview-card">
      <div class="interview-question-header">
        <span class="interview-question-title">
          <span class="interview-question-number">Q{questions_count}:</span> {question_text}
        </span>
        <span class="interview-chevron">▼</span>
      </div>
      <div class="interview-answer-panel">
        <div class="interview-ideal-answer">
          <span class="ideal-answer-label">💡 Ideal Answer (Amazon/GS Standard)</span>
          <p class="ideal-answer-content">{answer_body}</p>
        </div>
      </div>
    </div>
            """)
            continue
            
        # 6. Handle Headers
        is_h2 = False
        is_h3 = False
        
        # Check Section/Topic/Emoji headings
        h2_match = re.match(r'^(?:Section\s+\d+|Topic\s+\d+|[🔵🟢🟠🟣🔴⚡💪🏆📚🧠📅🔥☀️🌙🥗💻🎤]|\d+\.)', cleaned_text, re.IGNORECASE)
        
        # Determine if it's just a single emoji or number (to be merged with next paragraph)
        is_just_emoji_or_num = False
        single_match = re.match(r'^([🔵🟢🟠🟣🔴⚡💪🏆📚🧠📅🔥☀️🌙🥗💻🎤]|\d+\.)$', cleaned_text)
        if single_match:
            is_just_emoji_or_num = True
            
        if is_just_emoji_or_num and i + 1 < len(blocks):
            next_block = blocks[i+1]
            if not next_block['is_code'] and not any(next_block['text'].strip().startswith(x) for x in ["☐", "🗣", "💬", "🎤", "Q"]):
                # Intelligently combine emoji/number with the next paragraph text as a header!
                combined_header = f"{cleaned_text} {clean_time_references(next_block['text'].strip())}"
                
                # Auto-insert dashed section divider line before H2 (except the first main section)
                if h2_count > 0:
                    html_content.append('    <hr class="section-divider" />')
                html_content.append(f'    <h2>{combined_header}</h2>')
                h2_count += 1
                i += 2
                continue

        # Evaluate heading match
        if h2_match:
            # If it's a round or exercise or problem list, make it H3
            if any(h in cleaned_text for h in ["Round ", "Exercise ", "Task:", "Problem ", "Practice "]) or re.match(r'^\d+\.', cleaned_text):
                is_h3 = True
            else:
                is_h2 = True
        elif block.get('is_bold', False) and len(cleaned_text) < 120 and not stripped_raw.startswith("☐") and not any(k in cleaned_text.lower() for k in ["start", "finish", "lunch", "break", "today's", "note:", "what you"]):
            if not cleaned_text.endswith(":") and not cleaned_text.endswith("?"):
                is_h3 = True
                
        if is_h2:
            if h2_count > 0:
                html_content.append('    <hr class="section-divider" />')
            html_content.append(f'    <h2>{cleaned_text}</h2>')
            h2_count += 1
            i += 1
            continue
        elif is_h3:
            html_content.append(f'    <h3>{cleaned_text}</h3>')
            i += 1
            continue
            
        # 7. Handle Mentor Conversational Cards
        if stripped_raw.startswith("🗣") or stripped_raw.startswith("💬") or stripped_raw.startswith("📣"):
            emoji = stripped_raw[0]
            clean_text = stripped_raw[1:].strip()
            if clean_text.startswith("The Mentor Explains:") or clean_text.startswith("A note from your senior mentor:") or clean_text.startswith("Day"):
                mentor_title = clean_text
                # Let's collect the text paragraphs of this mentor card
                mentor_paras = []
                i += 1
                while i < len(blocks) and not blocks[i]['is_code'] and not any(h in blocks[i]['text'] for h in ["☐", "🔵", "🟢", "🟠", "🟣", "🔴", "🎤", "💻"]):
                    p_text = clean_time_references(blocks[i]['text'].strip())
                    if p_text.startswith("💬") or p_text.startswith("🗣"):
                        p_text = p_text[1:].strip()
                    if p_text:
                        mentor_paras.append(p_text)
                    i += 1
                
                mentor_body = "<br><br>".join(mentor_paras)
                html_content.append(f"""
    <div class="mentor-card">
      <div class="mentor-avatar">👨‍💻</div>
      <div class="mentor-bubble">
        <h4 class="mentor-title">{mentor_title}</h4>
        <p class="mentor-text">{mentor_body}</p>
      </div>
    </div>
                """)
                continue
            else:
                # Single paragraph mentor note
                html_content.append(f"""
    <div class="mentor-card">
      <div class="mentor-avatar">👨‍💻</div>
      <div class="mentor-bubble">
        <h4 class="mentor-title">Senior Mentor Tip</h4>
        <p class="mentor-text">{clean_time_references(clean_text)}</p>
      </div>
    </div>
                """)
                i += 1
                continue
                
        # 8. Default: Standard Paragraphs
        if cleaned_text:
            html_content.append(f'    <p>{cleaned_text}</p>')
            
        i += 1
        
    # Ensure active tags closed
    if in_checklist:
        html_content.append("    </ul>")
    if in_code_block:
        code_text = "\n".join(current_code)
        code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        html_content.append(f'    <pre><code class="language-java">{code_text}</code></pre>')

    # ─── Assemble full template ───
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{day_title} — Interactive Study Checklist for {prepared_for}" />
  <title>{day_title} — {day_subtitle or 'Senior Prep'}</title>
  <link rel="stylesheet" href="../../css/styles.css" />
  <link rel="stylesheet" href="../../css/topic.css" />
</head>
<body class="study-checklist-page">
  
  <!-- Topic Header Toolbar -->
  <header class="topic-header" style="position: sticky; top: 0; background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: var(--space-4) 0; z-index: 100;">
    <div style="max-width: var(--content-max); margin: 0 auto; padding: 0 var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
      <a href="../../index.html?pathway=studyplan" style="text-decoration: none; color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: var(--space-2);">
        <span>←</span> Back to Study Plan
      </a>
      <div class="pw" style="display: flex; align-items: center; gap: var(--space-3); min-width: 200px;">
        <div class="pt" style="flex: 1; height: 6px; background: var(--border); border-radius: var(--radius-pill); overflow: hidden;">
          <div class="pf" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.3s;"></div>
        </div>
        <span class="pl" style="font-size: 0.75rem; font-weight: 700; color: var(--accent);">0% Completed</span>
      </div>
    </div>
  </header>

  <main id="topic-content" style="max-width: var(--content-max); margin: var(--space-8) auto; padding: 0 var(--space-6);">
    
    <div class="hero-eyebrow" style="margin-bottom: var(--space-3); display: inline-block;">📅 Day {day_num} Checklist</div>
    <h1 style="margin-top: 0;">{day_subtitle or day_title}</h1>
    <p style="font-size: 1.05rem; color: var(--text-secondary);">
      Prepared for: <strong>{prepared_for}</strong> &middot; Target: <strong>{target_role}</strong>
    </p>
    
    <hr />

    <!-- Main Content rendered by compiler -->
    {"\n".join(html_content)}

    <!-- Dynamic Self-Assessment Matrix -->
    <div class="self-assessment-card">
      <div class="self-assessment-info">
        <h4 class="self-assessment-title">Daily Self-Assessment & Reflection</h4>
        <p class="self-assessment-desc">Rate your confidence in today's core concepts to update your dashboard Heatmap.</p>
      </div>
      <div class="star-rating-widget">
        <!-- Injected by checklist.js -->
      </div>
    </div>

  </main>

  <script type="module" src="../../js/checklist.js"></script>
</body>
</html>
"""
    return full_html

def main():
    docs_dir = r"c:\zuber-projects\DONE\study-site\topics\docs"
    output_dir = r"c:\zuber-projects\DONE\study-site\topics\checklists"
    
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(docs_dir):
        print(f"Error: Docs directory does not exist: {docs_dir}")
        sys.exit(1)
        
    compiled_count = 0
    # List files in the docs directory and match DayX
    for filename in sorted(os.listdir(docs_dir), key=lambda x: [int(s) if s.isdigit() else s for s in re.split(r'(\d+)', x)]):
        match = re.match(r'Day(\d+)_Study_Checklist_Zuber(?:\s*\(\d+\))?\.docx', filename)
        if match:
            day_num = int(match.group(1))
            docx_path = os.path.join(docs_dir, filename)
            output_filename = f"day{day_num}.html"
            output_path = os.path.join(output_dir, output_filename)
            
            print(f"\nProcessing Day {day_num}: {filename}...")
            blocks = parse_docx(docx_path)
            
            if not blocks:
                print(f"  Warning: No blocks extracted for Day {day_num}. Skipping.")
                continue
                
            print(f"  Extracted {len(blocks)} blocks.")
            
            title_override = f"Day {day_num} Study Checklist"
            html_output = compile_blocks_to_html(blocks, day_num=day_num, title_override=title_override)
            
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html_output)
                
            print(f"  Successfully compiled -> {output_path}")
            compiled_count += 1
            
    print(f"\nDone! Successfully compiled {compiled_count} checklists.")

if __name__ == "__main__":
    main()
