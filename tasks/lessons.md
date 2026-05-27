# Learning Lessons & Design Patterns

## Design Aesthetics
- **Harmonious Accents**: Use pathway-specific HSL variables (orange, green, blue, purple, pink) to color-theme specific sub-tabs and cards.
- **Micro-animations**: Keep focus-rings and active states fluid using transitions (`150ms ease-out`).
- **Tactile Inputs**: Custom checkbox states and hover raises make standard elements feel premium and alive.

## Technical Architectures
- **Specificity Rules**: Prefix styles with `#topic-content` or namespace IDs to dynamically override nested inline styles, preserving clean modular layout separations.
- **LocalStorage State**: Sync complex planner and date tracking arrays directly inside simple localStorage string representations for local static-served static sites.

## Content Verification & Metadata Integrity
- **Analyze actual file contents before naming**: Never guess or assume the contents of technical files (e.g., Q&A or DSA prep files) based solely on their filenames. Always inspect the actual HTML structure, header titles, batch names, and question counts (e.g., confirming the exactly 5 question accordions inside each file) to populate highly accurate titles, question range tags (e.g., "Q1–Q5", "Q6–Q10"), and precise subtopic summaries.

## Document Parsing & Compiling Insights
- **Nested Table Paragraphs in Word (.docx)**: When parsing Word documents (`.docx`) using Python's standard `xml.etree.ElementTree`, top-level paragraphs inside `w:body` are retrieved using `.findall('w:p', NS)`. However, any text, lists, or tables formatted inside Word tables are deeply nested in `w:tbl/w:tr/w:tc/w:p` and will be entirely missed. To ensure 100% text extraction in exact document order, always use `.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')` to traverse every single paragraph node in the document tree.
