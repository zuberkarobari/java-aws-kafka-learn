import os
import glob
from bs4 import BeautifulSoup
import re

KAFKA_DIR = r"c:\zuber-projects\DONE\study-site\topics\kafka"
OUTPUT_FILE = r"c:\zuber-projects\DONE\study-site\topics\questions and answers\kafka\kafka_top20.html"

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

html_files = glob.glob(os.path.join(KAFKA_DIR, "*.html"))

questions = []
for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        soup = BeautifulSoup(content, 'html.parser')
        h1 = soup.find('h1')
        p = soup.find('p')
        if h1 and p:
            q_text = h1.get_text(strip=True)
            a_text = p.get_text(strip=True)
            questions.append({"q": q_text, "a": a_text, "file": os.path.basename(file_path)})

# Sort alphabetically by file name or question
questions.sort(key=lambda x: x["q"])

TOTAL_QUESTIONS = len(questions)

HEADER_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Kafka — Top {TOTAL_QUESTIONS} Interview Q&A</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{{--bg:#07090f;--surface:#0c1018;--card:#0f1520;--border:#182030;--acc:#e879f9;--acc2:#22d3ee;--acc3:#fb923c;--acc4:#4ade80;--acc5:#f87171;--text:#dde8f5;--muted:#506070;--cb:#05080f;}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;font-size:15px;line-height:1.78}}
.hdr{{background:linear-gradient(135deg,#0a0d18 0%,#080b14 50%,#060810 100%);border-bottom:2px solid var(--border);padding:48px 44px 36px;position:relative;overflow:hidden}}
.hdr::before{{content:'';position:absolute;top:-80px;right:-60px;width:460px;height:460px;background:radial-gradient(circle,rgba(232,121,249,0.08) 0%,transparent 65%);pointer-events:none}}
.hdr::after{{content:'';position:absolute;bottom:-100px;left:100px;width:380px;height:380px;background:radial-gradient(circle,rgba(34,211,238,0.05) 0%,transparent 65%);pointer-events:none}}
.eye{{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--acc);text-transform:uppercase;margin-bottom:12px}}
.hdr h1{{font-size:46px;font-weight:700;letter-spacing:-2px;line-height:1.08;margin-bottom:10px}}
.hdr h1 .ms{{color:var(--acc)}}.hdr h1 .t10{{color:var(--acc2)}}
.hdesc{{color:var(--muted);font-size:14px;margin-bottom:24px;max-width:680px;line-height:1.7}}
.chips{{display:flex;flex-wrap:wrap;gap:9px}}
.chip{{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;padding:5px 14px;border-radius:3px;text-transform:uppercase}}
.cp{{background:rgba(232,121,249,0.08);border:1px solid rgba(232,121,249,0.2);color:var(--acc)}}
.cb{{background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.18);color:var(--acc2)}}
.co{{background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.18);color:var(--acc3)}}
.cg{{background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.18);color:var(--acc4)}}

.main{{max-width:1040px;margin:0 auto;padding:40px 32px}}

/* progress bar */
.prog{{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:14px 20px;margin-bottom:32px}}
.prog-label{{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);white-space:nowrap}}
.prog-track{{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}}
.prog-fill{{height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2));border-radius:3px;transition:width .4s}}
.prog-count{{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--acc);white-space:nowrap;font-weight:600}}

/* card */
.qc{{background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:20px;overflow:hidden;transition:all .25s}}
.qc:hover{{border-color:rgba(232,121,249,0.25);box-shadow:0 4px 32px rgba(232,121,249,0.06)}}
.qc.open{{border-color:rgba(232,121,249,0.4);box-shadow:0 4px 40px rgba(232,121,249,0.08)}}

/* question header */
.qq{{display:flex;align-items:flex-start;gap:16px;padding:20px 24px;cursor:pointer;user-select:none}}
.qnum{{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;min-width:44px;margin-top:2px}}
.qnum-inner{{background:rgba(232,121,249,0.12);border:1px solid rgba(232,121,249,0.25);color:var(--acc);padding:4px 10px;border-radius:4px;display:inline-block}}
.qbody{{flex:1}}
.qtxt{{font-weight:600;font-size:15.5px;line-height:1.5;color:var(--text);margin-bottom:6px}}
.qtags{{display:flex;gap:6px;flex-wrap:wrap}}
.tag{{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;padding:2px 9px;border-radius:2px;text-transform:uppercase}}
.tp{{background:rgba(232,121,249,0.08);border:1px solid rgba(232,121,249,0.18);color:var(--acc)}}
.tb{{background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.16);color:var(--acc2)}}
.to{{background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.16);color:var(--acc3)}}
.tg{{background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.16);color:var(--acc4)}}
.tr{{background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.16);color:var(--acc5)}}
.qarr{{color:var(--muted);font-size:18px;transition:transform .28s;min-width:20px;margin-top:3px;text-align:right}}
.qc.open .qarr{{transform:rotate(180deg);color:var(--acc)}}
.qc.open .qq{{border-bottom:1px solid var(--border)}}

/* answer */
.ans{{display:none;padding:26px 26px 28px 84px}}
.qc.open .ans{{display:block}}
.ai{{font-size:13px;color:var(--muted);font-style:italic;padding:9px 16px;border-left:2px solid var(--acc);margin-bottom:20px;background:rgba(232,121,249,0.03);border-radius:0 5px 5px 0;line-height:1.65}}

/* bullet list */
.bl{{list-style:none;display:flex;flex-direction:column;gap:16px}}
.bl li{{display:flex;gap:14px;align-items:flex-start}}
.bi{{width:24px;height:24px;min-width:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;margin-top:2px}}
.i1{{background:rgba(232,121,249,0.14);color:var(--acc)}}
.bc{{flex:1;font-size:14.5px;line-height:1.8;color:var(--text)}}

@media(max-width:600px){{.hdr{{padding:28px 18px 22px}}.hdr h1{{font-size:30px}}.main{{padding:20px 14px}}.ans{{padding:20px 16px}}}}
</style>
  <link rel="stylesheet" href="../../../css/styles.css" />
  <link rel="stylesheet" href="../../../css/topic.css" />
  </head>
<body>
  <main id="topic-content">
<div class="hdr">
  <div class="eye">Interview Preparation · Distributed Systems</div>
  <h1><span class="ms">Kafka</span><br/><span class="t10">Top {TOTAL_QUESTIONS} Most Asked</span></h1>
  <div class="hdesc">The {TOTAL_QUESTIONS} questions that appear in virtually every Kafka messaging interview.</div>
  <div class="chips">
    <span class="chip cp">Partitions</span>
    <span class="chip cb">Brokers</span>
    <span class="chip co">Offsets</span>
    <span class="chip cg">Consumer Groups</span>
    <span class="chip cp">Replication</span>
  </div>
</div>

<div class="main">
  <div class="prog">
    <span class="prog-label">PROGRESS</span>
    <div class="prog-track"><div class="prog-fill" id="pF" style="width:0%"></div></div>
    <span class="prog-count" id="pL">0 / {TOTAL_QUESTIONS} reviewed</span>
  </div>
"""

FOOTER_HTML = """
</div>
  </main>
<script>
  let openCount = 0;
  function tog(el) {
    let qc = el.parentElement;
    let wasOpen = qc.classList.contains('open');
    qc.classList.toggle('open');
    if (!wasOpen && !qc.dataset.viewed) {
      qc.dataset.viewed = "true";
      openCount++;
      let pct = Math.round((openCount / """ + str(TOTAL_QUESTIONS) + """) * 100);
      document.getElementById('pF').style.width = pct + '%';
      document.getElementById('pL').innerText = openCount + ' / """ + str(TOTAL_QUESTIONS) + """ reviewed';
    }
  }
</script>
</body>
</html>
"""

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    out.write(HEADER_HTML)
    
    for i, q in enumerate(questions):
        idx = str(i + 1).zfill(2)
        out.write(f'''
  <!-- ══════════════════════ Q{i+1} ══════════════════════ -->
  <div class="qc" id="q{i+1}">
    <div class="qq" onclick="tog(this)">
      <span class="qnum"><span class="qnum-inner">{idx}</span></span>
      <div class="qbody">
        <div class="qtxt">{q["q"]}</div>
        <div class="qtags"><span class="tag tp">Kafka Concept</span></div>
      </div>
      <span class="qarr">▾</span>
    </div>
    <div class="ans">
      <ul class="bl">
        <li><span class="bi i1">01</span><div class="bc">{q["a"]}</div></li>
      </ul>
    </div>
  </div>
''')

    out.write(FOOTER_HTML)

print(f"Generated {OUTPUT_FILE} with {TOTAL_QUESTIONS} questions.")
