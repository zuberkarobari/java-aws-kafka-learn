# Dashboard Refinements: Light Theme Default, Category Mapping on Tasks, Search Alignment & Grid Layout

## Plan
- [x] 1. **Default Theme to Light**:
  - [x] Update `getSavedTheme()` in `js/utils.js` to return `'light'` by default (instead of `'dark'`) with safe `typeof localStorage` guards.
  - [x] Ensure `index.html` has `<html lang="en" data-theme="light">` and moon icon ready to toggle.
  - [x] Verify `js/topic.js`, `js/checklist.js`, and `js/app.js` initialize with `light` mode and checkboxes/icons are properly synchronized.
- [x] 2. **Add Categories Mapping to Tasks in "Today's Plan" (Right Sidebar)**:
  - [x] In `js/utils.js`, add `getTaskCategoryInfo(task)` mapping tasks to specific categories/tracks (e.g. `Core Java`, `AWS Cloud`, `Spring Boot`, `Kafka`, `Interview Prep`).
  - [x] In `js/app.js`, update `renderRightSidebar()` to render a chromatic category badge/pill next to each task in the timeline.
  - [x] In `css/home.css`, add styling for `.task-category-pill` with track-matched colors (amber for Java, emerald for Spring, cyan for AWS, purple for Kafka, rose for Interview).
- [x] 3. **Fix Search Bar Alignment in Topbar**:
  - [x] Align `.main-topbar` to match `.dashboard-main-wrapper` layout (`max-width: 1200px; margin: 0 auto var(--space-6); width: 100%;`).
  - [x] Fix vertical centering of `.search-icon`, placeholder, text, and keyboard shortcut `/` within `.search-wrap`.
  - [x] Enhance border and shadow consistency in both light and dark themes.
- [x] 4. **Featured Big Card for Core Java + 2x2 Equal Grid for Remaining 4 Tracks**:
  - [x] In `css/home.css`, configure `.learning-tracks-grid` for desktop as a 3-column, 2-row grid (`grid-template-columns: 1.15fr 1fr 1fr;`).
  - [x] Make `.track-card-java` span 2 rows (`grid-column: 1; grid-row: 1 / span 2;`) as a featured card with rich vertical spacing, topic tags preview, and prominent CTA.
  - [x] Ensure the 4 remaining track cards (Spring Boot, AWS, Kafka, Interview Prep) form an even, identical-sized 2x2 grid adjacent to it.
  - [x] Provide responsive fallbacks for tablet (featured card on top full-width, 2x2 below) and mobile (single column stack).
- [x] 5. **Automated Testing & Verification**:
  - [x] Run `node test-verification.mjs` (ensure all 8 test suites pass, 0 unclosed braces in CSS, 200/200 topics resolve accurately).
  - [x] Verify theme default behavior in clean browser session simulation.
  - [x] Check task category mappings and search bar alignment.

## Review
- **Default Theme**: Site now boots into light mode by default with elegant pastel gradients and synced slider toggle.
- **Task Category Mapping**: Each item in "Today's Plan" now displays a track-coded category tag (e.g., `☕ Core Java`, `☁️ AWS Cloud`, `🐿️ Kafka`) with custom pastel/ambient styling.
- **Search Alignment**: Fixed the topbar width to match the 1200px container, so the search input aligns symmetrically with the left edge of the hero cockpit and track cards, with centered icon and `/` badge.
- **Curriculum Grid Layout**: Replaced the uneven 3+2 card layout with a structured grid featuring **Core Java** as the tall anchor card on the left (spanning 2 rows with subtopic preview pills), paired with a balanced 2x2 grid for Spring Boot, AWS, Kafka, and Interview Prep.
- **Verification**: All 8 test suites passed with 0 errors and 0 unclosed braces.
