/**
 * ═══════════════════════════════════════════════════════════════
 *  HTML → PDF Converter Framework
 *  Author: @zubairkarobari
 * ═══════════════════════════════════════════════════════════════
 *
 *  HOW IT WORKS (step by step):
 *  ─────────────────────────────
 *  1. Puppeteer launches a headless Chromium browser (invisible)
 *  2. For each HTML file, it opens the file via file:// protocol
 *     so relative paths (CSS, images) resolve correctly
 *  3. External CSS (styles.css, topic.css) is also injected
 *     inline as a safety net, in case paths don't resolve
 *  4. JavaScript runs inside the page to EXPAND all hidden
 *     content — tabs, panels, accordions, concept steppers —
 *     so nothing is lost in the PDF
 *  5. Light-theme CSS overrides are injected so PDFs look clean
 *     on paper (dark backgrounds → white)
 *  6. Chromium's built-in PDF printer generates the PDF with:
 *     - A4 page size with comfortable margins
 *     - Header: topic file name
 *     - Footer: @zubairkarobari + page numbers
 *     - printBackground: true (preserves colored boxes, badges)
 *  7. The PDF is saved to a /pdfs/ subfolder inside the target
 *
 *  USAGE:
 *  ──────
 *  # Convert a specific folder:
 *  node html-to-pdf.mjs topics/aws
 *  node html-to-pdf.mjs topics/spring-boot
 *  node html-to-pdf.mjs topics/java
 *  node html-to-pdf.mjs topics/kafka
 *
 *  # Convert ALL topic folders at once:
 *  node html-to-pdf.mjs --all
 *
 *  # Convert specific files:
 *  node html-to-pdf.mjs topics/aws/aws_day1_full_session.html topics/aws/aws_day2_ec2.html
 *
 *  REQUIREMENTS:
 *  ─────────────
 *  npm install puppeteer   (run once in the project root)
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ─── Resolve paths ───────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = __dirname;
const CSS_DIR = path.join(PROJECT_ROOT, 'css');
const TOPICS_DIR = path.join(PROJECT_ROOT, 'topics');

// ─── Branding ────────────────────────────────────────────────
const BRAND = '@zubairkarobari';

// ─── Read external CSS (cached once) ─────────────────────────
function loadExternalCSS() {
  let css = '';
  const stylesPath = path.join(CSS_DIR, 'styles.css');
  const topicPath = path.join(CSS_DIR, 'topic.css');

  if (fs.existsSync(stylesPath)) {
    css += fs.readFileSync(stylesPath, 'utf-8') + '\n';
  }
  if (fs.existsSync(topicPath)) {
    css += fs.readFileSync(topicPath, 'utf-8') + '\n';
  }
  return css;
}

// ─── Discover HTML files ─────────────────────────────────────
function findHTMLFiles(targetPath) {
  const absPath = path.resolve(PROJECT_ROOT, targetPath);
  const stat = fs.statSync(absPath);

  if (stat.isFile() && absPath.endsWith('.html')) {
    return [absPath];
  }

  if (stat.isDirectory()) {
    return fs.readdirSync(absPath)
      .filter(f => f.endsWith('.html'))
      .filter(f => !f.includes('(1)')) // skip duplicate files
      .sort()
      .map(f => path.join(absPath, f));
  }

  return [];
}

// ─── Get all topic subdirectories ────────────────────────────
function getAllTopicDirs() {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs.readdirSync(TOPICS_DIR)
    .map(d => path.join(TOPICS_DIR, d))
    .filter(d => fs.statSync(d).isDirectory());
}

// ─── Format file name for header ─────────────────────────────
function formatTitle(htmlFile) {
  return path.basename(htmlFile, '.html')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Core: Expand all hidden content ─────────────────────────
// This is THE critical step. Without this, tabbed/accordion
// content would be invisible in the PDF.
async function expandAllContent(page) {
  await page.evaluate(() => {
    // 1. Show all tab panels (.panel, .cpanel)
    document.querySelectorAll('.panel, .cpanel').forEach(el => {
      el.style.display = 'block';
      el.classList.add('active');
    });

    // 2. Show all concept stepper panels
    document.querySelectorAll('.cs-panel').forEach(el => {
      el.style.display = 'block';
      el.classList.add('active');
    });

    // 3. Expand all interview Q&A accordions
    document.querySelectorAll('.iq').forEach(el => {
      el.classList.add('open');
    });
    document.querySelectorAll('.iq-ans').forEach(el => {
      el.style.display = 'block';
    });

    // 4. Show item details
    document.querySelectorAll('.it-detail').forEach(el => {
      el.style.display = 'block';
    });

    // 5. Force-show any inline-hidden elements
    document.querySelectorAll(
      '[style*="display:none"], [style*="display: none"]'
    ).forEach(el => {
      el.style.display = 'block';
    });

    // 6. Show .topic elements (used in some days)
    document.querySelectorAll('.topic').forEach(el => {
      el.style.display = 'block';
    });

    // 7. Expand <details> elements
    document.querySelectorAll('details').forEach(el => {
      el.setAttribute('open', '');
    });

    // 8. Remove max-height clipping
    document.querySelectorAll('[style*="max-height"]').forEach(el => {
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
    });

    // 9. Add section labels between panels
    document.querySelectorAll('.panel').forEach(panel => {
      const id = panel.id || '';
      const tabName = id.replace('p-', '').toUpperCase();
      if (tabName && !panel.querySelector('.pdf-section-header')) {
        const header = document.createElement('div');
        header.className = 'pdf-section-header';
        header.style.cssText = `
          font-size: 16px; font-weight: 600; color: #0C447C;
          background: #E6F1FB; padding: 10px 16px; border-radius: 8px;
          margin: 20px 0 12px 0; border-left: 4px solid #185FA5;
        `;
        header.textContent = `── ${tabName} ──`;
        panel.insertBefore(header, panel.firstChild);
      }
    });
  });
}

// ─── Light theme CSS for readable PDFs ───────────────────────
const LIGHT_THEME_CSS = `
  :root {
    --color-text-primary: #1a1a2e;
    --color-text-secondary: #4a4a5a;
    --color-text-tertiary: #6a6a7a;
    --color-background-primary: #ffffff;
    --color-background-secondary: #f8f9fa;
    --color-border-primary: #ccc;
    --color-border-secondary: #ddd;
    --color-border-tertiary: #e8e8e8;
    --border-radius-md: 6px;
    --border-radius-lg: 10px;
    --font-sans: 'Inter', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Consolas', monospace;
    --bg-base: #ffffff;
    --bg-surface: #f8f9fa;
    --bg-elevated: #f0f0f5;
    --text-primary: #1a1a2e;
    --text-secondary: #4a4a5a;
    --text-muted: #8a8a9a;
    --border: #e0e0e0;
  }
  body {
    background: #ffffff !important;
    color: #1a1a2e !important;
  }
  .ntab {
    background: #E6F1FB !important;
    color: #0C447C !important;
    border-color: #85B7EB !important;
  }
  .ntab.active {
    background: #0C447C !important;
    color: #ffffff !important;
  }
  .cs-btn {
    background: #E6F1FB !important;
    color: #0C447C !important;
    border-color: #85B7EB !important;
  }
  .cs-btn.active {
    background: #0C447C !important;
    color: #ffffff !important;
  }
`;

const PRINT_CSS = `
  @media print {
    .panel, .cpanel, .cs-panel, .iq-ans, .it-detail, .topic {
      display: block !important;
    }
    .iq, .card, .cs-item, .highlight-box, .lede {
      break-inside: avoid;
    }
    .cmd, pre, code {
      break-inside: avoid;
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    .next-btn, .mark-btn { display: none !important; }
  }
`;

// ─── Convert a single HTML file to PDF ───────────────────────
async function convertFile(browser, htmlFilePath, outputDir, externalCSS) {
  const fileName = path.basename(htmlFilePath);
  const pdfName = fileName.replace('.html', '.pdf');
  const pdfPath = path.join(outputDir, pdfName);
  const title = formatTitle(fileName);

  console.log(`  📄 Converting: ${fileName}`);

  const page = await browser.newPage();

  // Step 1: Open the HTML file via file:// so relative paths work
  const fileUrl = `file:///${htmlFilePath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Step 2: Inject external CSS as backup
  await page.addStyleTag({ content: externalCSS });

  // Step 3: Expand ALL hidden content
  await expandAllContent(page);

  // Step 4: Apply light theme + print overrides
  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await page.addStyleTag({ content: PRINT_CSS });

  // Step 5: Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:9px; color:#888; width:100%; text-align:center; padding:5px 15mm;">
        ${title}
      </div>
    `,
    footerTemplate: `
      <div style="font-size:9px; color:#888; width:100%; display:flex; justify-content:space-between; padding:5px 15mm;">
        <span>${BRAND}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await page.close();
  console.log(`  ✅ Saved: ${pdfName}`);
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════╗
║          HTML → PDF Converter Framework              ║
║          ${BRAND}                          ║
╚══════════════════════════════════════════════════════╝

USAGE:
  node html-to-pdf.mjs <folder-or-file> [...]
  node html-to-pdf.mjs --all

EXAMPLES:
  node html-to-pdf.mjs topics/aws
  node html-to-pdf.mjs topics/spring-boot
  node html-to-pdf.mjs topics/java topics/kafka
  node html-to-pdf.mjs topics/aws/aws_day1_full_session.html
  node html-to-pdf.mjs --all    (converts ALL topic folders)

OUTPUT:
  PDFs are saved to a /pdfs/ subfolder inside each target folder.
  Every page has "${BRAND}" in the footer.
`);
    process.exit(0);
  }

  // Collect all HTML files to convert
  let filesToConvert = []; // { file, outputDir }

  if (args.includes('--all')) {
    const dirs = getAllTopicDirs();
    console.log(`\n🔍 Found ${dirs.length} topic folders\n`);
    for (const dir of dirs) {
      const files = findHTMLFiles(dir);
      const outputDir = path.join(dir, 'pdfs');
      files.forEach(f => filesToConvert.push({ file: f, outputDir }));
    }
  } else {
    for (const arg of args) {
      const absPath = path.resolve(PROJECT_ROOT, arg);
      const files = findHTMLFiles(absPath);
      const outputDir = fs.statSync(absPath).isDirectory()
        ? path.join(absPath, 'pdfs')
        : path.join(path.dirname(absPath), 'pdfs');
      files.forEach(f => filesToConvert.push({ file: f, outputDir }));
    }
  }

  if (filesToConvert.length === 0) {
    console.error('❌ No HTML files found at the specified path(s).');
    process.exit(1);
  }

  console.log(`🚀 HTML → PDF Converter`);
  console.log(`   Files to convert: ${filesToConvert.length}`);
  console.log(`   Branding: ${BRAND}\n`);

  // Load CSS once
  const externalCSS = loadExternalCSS();
  if (externalCSS) {
    console.log('📎 Loaded external CSS (styles.css + topic.css)\n');
  }

  // Create all output directories
  const outputDirs = [...new Set(filesToConvert.map(f => f.outputDir))];
  outputDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files',
    ],
  });
  console.log('🌐 Browser launched\n');

  let success = 0;
  let failed = 0;

  for (const { file, outputDir } of filesToConvert) {
    try {
      await convertFile(browser, file, outputDir, externalCSS);
      success++;
    } catch (err) {
      console.error(`  ❌ Failed: ${path.basename(file)} — ${err.message}`);
      failed++;
    }
  }

  await browser.close();

  console.log('\n────────────────────────────────');
  console.log(`✅ Success: ${success} / ${filesToConvert.length}`);
  if (failed > 0) console.log(`❌ Failed:  ${failed}`);
  outputDirs.forEach(dir => console.log(`📁 PDFs: ${dir}`));
  console.log('────────────────────────────────\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
