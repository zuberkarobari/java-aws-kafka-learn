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

## CSS Grid and Layout Robustness
- **CSS Grid Child Discipline**: Never inject fixed or overlay viewport backdrops (such as `#sidebar-overlay`) directly into CSS grid containers (like `.topic-layout`). Backdrops should always be mounted to `document.body`. Additionally, explicitly assign `grid-column: 1` and `grid-column: 2` to grid children so third-party or dynamic nodes cannot displace layout columns.
- **Search Context Awareness**: When a top-level search bar exists on a multi-view application, ensure typing a query dynamically shifts into search results mode regardless of the active tab (e.g. Dashboard), rather than returning early without processing `filterText`.
- **Resilient Fallback Chains**: State accessors (like `getLastStudiedTopic()`) must check both in-memory state and `localStorage` to avoid breaking when run in test/SSR or private browsing environments.
- **Single Scroll Container on Sidebars**: Avoid setting `overflow-y: auto` on both the outer sidebar and its child containers. Keep `.topic-sidebar` at `overflow: hidden;` and make `.sidebar-categories` the sole scroll container to prevent scroll competition and scroll position resets.
- **Horizontal Flex Tab Navigation Overflow**: Flex child tab bars with `overflow-x: auto` must have `flex: 1 1 auto; min-width: 0;` (to override flexbox default `min-width: auto`), wheel listener for horizontal scrolling, and auto-scroll `activeTab.scrollIntoView({ inline: 'center' })` so active tabs are never clipped off-screen.
- **Seamless Web Book Navigation**: On multi-page static technical documentation, intercepting internal topic clicks with fetch-based in-place content swapping eliminates full page reloads, preserves sidebar scroll, updates breadcrumbs and progress seamlessly, and keeps `pushState` history intact.
- **Passive & RAF-Throttled Scroll Listeners for High Scale**: Real-time reading depth bars and floating actions must use `{ passive: true }` and `requestAnimationFrame` debouncing on `window.addEventListener('scroll')` to ensure 60/120 fps smoothness without causing layout thrashing on heavy technical articles.
- **Defensive Keyboard Navigation**: When implementing keyboard shortcuts (e.g. `[`/`]`, `/`, `t`), always guard against active input fields (`INPUT`, `TEXTAREA`, `SELECT`, `contenteditable`) and open modal overlays to prevent interfering with typing.
- **Canonical Topic ID Decoding & Script Completeness**: When URLs contain spaces or special characters (e.g. `questions%20and%20answers`), always pass paths through `decodeURIComponent` and match against the canonical topic registry before writing to or checking `localStorage`. Additionally, ensure every topic HTML file includes the runtime module script so completion events fire regardless of entry point.
- **Default Category Fallbacks in Topic Registries**: If a topic in `TOPIC_ORDER` lacks an entry in `TOPIC_META`, fallback logic (`meta.category || 'Fundamentals'`) will silently dump unrelated topics (e.g. `microservices_fundamentals`) into `Fundamentals`. Always ensure every registered topic has an explicit entry in `TOPIC_META` with appropriate pathway categorization.
- **Component Sub-Renderers & Function Parameter Discipline**: When breaking large UI views into modular sub-renderers (`renderHeroHtml`, `renderStatsRowHtml`, `renderTracksHtml`), ensure all required variables are either derived directly or explicitly passed as parameters, preventing runtime `ReferenceError` crashes.
