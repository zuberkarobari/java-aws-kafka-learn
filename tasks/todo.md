# Dashboard Refinements: Light Theme Default, Category Mapping on Tasks, Search Alignment & Grid Layout

## Plan
- [ ] 1. **Default Theme to Light**:
  - [ ] Update `getSavedTheme()` in `js/utils.js` to return `'light'` by default (instead of `'dark'`).
  - [ ] Ensure `index.html` has `<html lang="en" data-theme="light">` (already in place).
  - [ ] Verify `js/topic.js` and `js/app.js` initialize with `light` mode and checkboxes/icons are properly synchronized.
- [ ] 2. **Add Categories Mapping to Tasks in "Today's Plan" (Right Sidebar)**:
  - [ ] In `js/utils.js`, add helper `getTaskCategoryInfo(task)` mapping tasks to specific categories/tracks (e.g. `Core Java`, `AWS Cloud`, `Spring Boot`, `Kafka Streaming`, `Interview Prep`).
  - [ ] In `js/app.js`, update `renderRightSidebar()` to render a chromatic category badge/pill next to or within each task in the timeline.
  - [ ] In `css/home.css`, add styling for `.task-category-pill` with track-matched colors (amber for Java, emerald for Spring, cyan for AWS, purple for Kafka, rose for Interview).
- [ ] 3. **Fix Search Bar Alignment in Topbar**:
  - [ ] Align `.main-topbar` to match `.dashboard-main-wrapper` layout (`max-width: 1200px; margin: 0 auto; width: 100%;`).
  - [ ] Fix vertical centering of `.search-icon`, placeholder, text, and keyboard shortcut `/` within `.search-wrap`.
  - [ ] Enhance border and shadow consistency in both light and dark themes.
- [ ] 4. **Featured Big Card for Core Java + 2x2 Equal Grid for Remaining 4 Tracks**:
  - [ ] In `css/home.css`, configure `.learning-tracks-grid` for desktop as a 3-column, 2-row grid (`grid-template-columns: 1.15fr 1fr 1fr;`).
  - [ ] Make `.track-card-java` span 2 rows (`grid-row: 1 / span 2;`) as a featured card with rich vertical spacing, topic tags preview, and prominent CTA.
  - [ ] Ensure the 4 remaining track cards (Spring Boot, AWS, Kafka, Interview Prep) form an even, identical-sized 2x2 grid adjacent to it.
  - [ ] Provide responsive fallbacks for tablet (featured card on top full-width, 2x2 below) and mobile (single column stack).
- [ ] 5. **Automated Testing & Verification**:
  - [ ] Run `node test-verification.mjs` (ensure all 8 test suites pass, 0 unclosed braces in CSS, 200/200 topics resolve accurately).
  - [ ] Verify theme default behavior in clean browser session simulation.
  - [ ] Check task category mappings and search bar alignment.

## Review
(To be updated upon completion)
