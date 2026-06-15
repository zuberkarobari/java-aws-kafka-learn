/**
 * wrap_all_pages.js
 * 
 * Scans all HTML topic files and upgrades them to use the standard
 * topic.js shell (header, sidebar, prev/next nav auto-injected).
 * 
 * Strategy:
 *   - Class A (standalone): wrap all content inside <main id="topic-content">, add CSS links + topic.js
 *   - Class C (Tailwind): replace the Tailwind sidebar/body structure with our shell, 
 *     preserving all <section> and content nodes inside <main id="topic-content">
 * 
 * Run: node scripts/wrap_all_pages.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOPICS_DIR = join(__dirname, '..', 'topics');

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAllHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      getAllHtmlFiles(full, files);
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Compute the relative CSS/JS prefix from a file's location.
 * e.g. topics/kafka/foo.html → ../../
 *      topics/spring-boot/foo.html → ../../
 *      topics/foo.html → ../
 */
function getPrefix(filePath) {
  const rel = relative(TOPICS_DIR, filePath);
  const depth = rel.split(/[\\/]/).length; // e.g. kafka/foo.html → 2 segments → depth 2
  return '../'.repeat(depth);
}

/**
 * Extract the page title from <title> tag
 */
function extractTitle(html) {
  const m = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return m ? m[1].trim() : 'Topic — Java Learn';
}

/**
 * Build the standard shell head (no Tailwind, just our design system)
 */
function buildStandardHead(title, prefix) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${prefix}css/styles.css" />
  <link rel="stylesheet" href="${prefix}css/topic.css" />
</head>
<body>`;
}

/**
 * Build the standard shell foot with topic.js
 */
function buildStandardFoot(prefix) {
  return `  <script type="module" src="${prefix}js/topic.js"></script>
</body>
</html>`;
}

// ── Class A Fix: Standalone pages ─────────────────────────────────────────────

function fixClassA(html, filePath) {
  const prefix = getPrefix(filePath);
  const title = extractTitle(html);

  // Extract body content (everything between <body> and </body>)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return null; // Can't parse, skip

  let bodyContent = bodyMatch[1].trim();

  // If already has topic-content, skip
  if (html.includes('id="topic-content"')) return null;

  return `${buildStandardHead(title, prefix)}
  <main id="topic-content">
${bodyContent}
  </main>
${buildStandardFoot(prefix)}`;
}

// ── Class C Fix: Tailwind pages ───────────────────────────────────────────────

/**
 * For Tailwind pages, we need to:
 * 1. Remove their own <aside> sidebar (it's Tailwind-only, replaces ours)
 * 2. Find the <main> element that contains the actual content
 * 3. Wrap everything in our standard shell with id="topic-content"
 */
function fixClassC(html, filePath) {
  const prefix = getPrefix(filePath);
  const title = extractTitle(html);

  // Already properly wrapped, skip
  if (html.includes('id="topic-content"')) return null;

  // Find all <script> tags that are not the Tailwind config (keep inline scripts)
  // We'll preserve accordion scripts and other interactive JS inside the content
  
  // Extract the main scrollable content area
  // Tailwind pages structure: <aside>...</aside> <main ...>...</main>
  // We want everything inside the <main> element
  
  let mainContent = '';
  
  // Try to find main content area - Tailwind pages use either:
  // <main id="main-scroll" ...> or <div class="max-w-4xl ..."> as the content wrapper
  const mainMatch = html.match(/<main[^>]*(?:id="main-scroll"|class="[^"]*flex-1[^"]*")[^>]*>([\s\S]*?)<\/main>/i);
  
  if (mainMatch) {
    mainContent = mainMatch[1].trim();
  } else {
    // Fallback: extract body and remove <aside> element
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (!bodyMatch) return null;
    
    let bodyContent = bodyMatch[1];
    // Remove aside element
    bodyContent = bodyContent.replace(/<aside[\s\S]*?<\/aside>/i, '');
    mainContent = bodyContent.trim();
  }

  // Extract any inline <script> blocks (for accordions, etc.)
  const inlineScripts = [];
  mainContent = mainContent.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    inlineScripts.push(match);
    return '';
  });

  // Tailwind pages use light-mode only. We add a compat style block 
  // that makes them look reasonable in dark mode too by scoping the bg/text colors
  const tailwindCompat = `
  <!-- Tailwind CSS preserved for page content -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* Tailwind page compat — ensure content renders in both themes */
    #topic-content { font-family: 'Inter', sans-serif; }
    #topic-content h1, #topic-content h2, #topic-content h3,
    #topic-content h4, #topic-content h5, #topic-content h6 {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    /* Light-mode Tailwind content: keep white cards readable in dark theme */
    [data-theme="dark"] #topic-content .bg-white {
      background: #1c2128 !important;
      border-color: rgba(255,255,255,0.08) !important;
      color: #e6edf3 !important;
    }
    [data-theme="dark"] #topic-content .bg-slate-50,
    [data-theme="dark"] #topic-content .bg-slate-100,
    [data-theme="dark"] #topic-content .bg-slate-200 {
      background: #161b22 !important;
    }
    [data-theme="dark"] #topic-content .text-slate-800,
    [data-theme="dark"] #topic-content .text-slate-900,
    [data-theme="dark"] #topic-content .text-slate-700 {
      color: #e6edf3 !important;
    }
    [data-theme="dark"] #topic-content .text-slate-600,
    [data-theme="dark"] #topic-content .text-slate-500 {
      color: #8b949e !important;
    }
    [data-theme="dark"] #topic-content .border-slate-100,
    [data-theme="dark"] #topic-content .border-slate-200 {
      border-color: rgba(255,255,255,0.08) !important;
    }
    [data-theme="dark"] #topic-content .shadow-sm,
    [data-theme="dark"] #topic-content .shadow {
      box-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
    }
    /* Accordion content fix */
    .accordion-content { transition: all 0.4s ease; max-height: 0; opacity: 0; overflow: hidden; }
    .accordion-content.open { max-height: 2000px; opacity: 1; padding-top: 1rem; padding-bottom: 1.5rem; }
    .accordion-icon { transition: transform 0.4s ease; }
    .open .accordion-icon { transform: rotate(180deg); }
    .mac-window { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  </style>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${prefix}css/styles.css" />
  <link rel="stylesheet" href="${prefix}css/topic.css" />
  ${tailwindCompat}
</head>
<body>
  <main id="topic-content">
    <div class="max-w-4xl mx-auto px-6 md:px-12 py-10 space-y-16 pb-24">
${mainContent}
    </div>
  </main>
${inlineScripts.join('\n')}
  <script type="module" src="${prefix}js/topic.js"></script>
</body>
</html>`;
}

// ── Directories to NEVER touch (they have bespoke flow layouts) ──────────────
const EXCLUDED_DIRS = [
  join(TOPICS_DIR, 'key-topics'),
];

const isExcluded = (filePath) =>
  EXCLUDED_DIRS.some(excl => filePath.startsWith(excl));

// ── Main execution ─────────────────────────────────────────────────────────────

const allFiles = getAllHtmlFiles(TOPICS_DIR);
let fixedA = 0, fixedC = 0, skipped = 0, errors = 0;

for (const filePath of allFiles) {
  try {
    const html = readFileSync(filePath, 'utf8');
    const relPath = relative(TOPICS_DIR, filePath);

    // Skip protected directories (e.g. key-topics — bespoke flow layout)
    if (isExcluded(filePath)) {
      skipped++;
      continue;
    }

    // Skip if already properly wrapped with topic.js
    if (html.includes('topic.js') && html.includes('id="topic-content"')) {
      skipped++;
      continue;
    }

    let result = null;
    
    if (html.includes('cdn.tailwindcss.com')) {
      // Class C - Tailwind page
      result = fixClassC(html, filePath);
      if (result) {
        writeFileSync(filePath, result, 'utf8');
        console.log(`[C→Fixed] ${relPath}`);
        fixedC++;
      }
    } else if (!html.includes('id="topic-content"')) {
      // Class A - Standalone page
      result = fixClassA(html, filePath);
      if (result) {
        writeFileSync(filePath, result, 'utf8');
        console.log(`[A→Fixed] ${relPath}`);
        fixedA++;
      }
    } else {
      skipped++;
    }
  } catch (err) {
    console.error(`[ERROR] ${filePath}: ${err.message}`);
    errors++;
  }
}

console.log(`\n=== DONE ===`);
console.log(`Class A fixed: ${fixedA}`);
console.log(`Class C fixed: ${fixedC}`);
console.log(`Skipped (already good): ${skipped}`);
console.log(`Errors: ${errors}`);
