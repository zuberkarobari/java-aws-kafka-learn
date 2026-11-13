/**
 * convert-to-pdf.mjs
 * 
 * Converts all AWS day HTML files to PDF using Puppeteer.
 * - Resolves external CSS (styles.css, topic.css) via file:// protocol
 * - Expands ALL hidden content: panels, tabs, accordions, concept steppers
 * - Preserves every letter, code block, table, and structure
 * - Outputs PDFs to a ./pdfs/ subdirectory
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AWS_DIR = __dirname;
const PDF_DIR = path.join(AWS_DIR, 'pdfs');
const CSS_DIR = path.resolve(AWS_DIR, '..', '..', 'css');

// All 15 unique day files (excluding the duplicate)
const HTML_FILES = [
  'aws_day1_full_session.html',
  'aws_day2_ec2.html',
  'aws_day3_s3.html',
  'aws_day4_vpc.html',
  'aws_day5_iam.html',
  'aws_day6_cli_sdk.html',
  'aws_day7_ec2_deep.html',
  'aws_day8_alb_asg.html',
  'aws_day9_rds.html',
  'aws_day10_e2e_deployment.html',
  'aws_day11_route53_cloudfront.html',
  'aws_day12_ecs_docker.html',
  'aws_day13_elasticache_dynamodb.html',
  'aws_day14_cloudwatch.html',
  'aws_day15_cicd.html',
];

/**
 * Read external CSS files and return combined content.
 */
function getExternalCSS() {
  const stylesCSS = fs.readFileSync(path.join(CSS_DIR, 'styles.css'), 'utf-8');
  const topicCSS = fs.readFileSync(path.join(CSS_DIR, 'topic.css'), 'utf-8');
  return stylesCSS + '\n' + topicCSS;
}

async function convertFile(browser, htmlFile, externalCSS) {
  const filePath = path.join(AWS_DIR, htmlFile);
  const pdfName = htmlFile.replace('.html', '.pdf');
  const pdfPath = path.join(PDF_DIR, pdfName);

  console.log(`  📄 Converting: ${htmlFile}`);

  const page = await browser.newPage();

  // Navigate to the file using file:// protocol so relative paths work
  const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Inject external CSS inline (in case relative paths don't resolve)
  await page.addStyleTag({ content: externalCSS });

  // Expand ALL hidden content so nothing is lost in PDF
  await page.evaluate(() => {
    // ─── 1. Show all panels (tab-based navigation) ───
    document.querySelectorAll('.panel').forEach(el => {
      el.style.display = 'block';
      el.classList.add('active');
    });
    document.querySelectorAll('.cpanel').forEach(el => {
      el.style.display = 'block';
      el.classList.add('active');
    });

    // ─── 2. Show all concept stepper panels ───
    document.querySelectorAll('.cs-panel').forEach(el => {
      el.style.display = 'block';
      el.classList.add('active');
    });

    // ─── 3. Expand all interview Q&A accordions ───
    document.querySelectorAll('.iq').forEach(el => {
      el.classList.add('open');
    });
    document.querySelectorAll('.iq-ans').forEach(el => {
      el.style.display = 'block';
    });

    // ─── 4. Show all item details (used in some days) ───
    document.querySelectorAll('.it-detail').forEach(el => {
      el.style.display = 'block';
    });

    // ─── 5. Show any inline-hidden elements ───
    document.querySelectorAll('[style*="display:none"], [style*="display: none"]').forEach(el => {
      el.style.display = 'block';
    });

    // ─── 6. Show any elements with .topic.active that are hidden ───
    document.querySelectorAll('.topic').forEach(el => {
      el.style.display = 'block';
    });

    // ─── 7. Expand all details/summary elements ───
    document.querySelectorAll('details').forEach(el => {
      el.setAttribute('open', '');
    });

    // ─── 8. Remove any max-height constraints that might clip content ───
    document.querySelectorAll('[style*="max-height"]').forEach(el => {
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
    });

    // ─── 9. Add section dividers between panels for readability ───
    document.querySelectorAll('.panel').forEach(panel => {
      // Find the panel's corresponding tab name
      const id = panel.id || '';
      const tabName = id.replace('p-', '').toUpperCase();
      if (tabName && !panel.querySelector('.pdf-section-header')) {
        const header = document.createElement('div');
        header.className = 'pdf-section-header';
        header.style.cssText = `
          font-size: 16px;
          font-weight: 600;
          color: #0C447C;
          background: #E6F1FB;
          padding: 10px 16px;
          border-radius: 8px;
          margin: 20px 0 12px 0;
          border-left: 4px solid #185FA5;
          page-break-before: auto;
        `;
        header.textContent = `── ${tabName} ──`;
        panel.insertBefore(header, panel.firstChild);
      }
    });
  });

  // Add PDF-specific print styles
  await page.addStyleTag({
    content: `
      @media print {
        /* Ensure all content is visible */
        .panel, .cpanel, .cs-panel, .iq-ans, .it-detail, .topic {
          display: block !important;
        }
        .iq { break-inside: avoid; }
        
        /* Hide interactive-only elements */
        .nav, .cs-nav, .ntab, .cs-btn, .next-btn, .mark-btn,
        .progress-dots, .sc { 
          /* Keep visible but style for print */
        }
        .next-btn { display: none !important; }
        .mark-btn { display: none !important; }
        
        /* Prevent awkward page breaks */
        .card, .iq, .cs-item, .highlight-box, .lede {
          break-inside: avoid;
        }
        
        /* Code blocks should not break across pages */
        .cmd, pre, code {
          break-inside: avoid;
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }
        
        /* Ensure proper spacing */
        body {
          font-size: 12px;
          line-height: 1.6;
        }
        
        /* Force light theme colors for PDF readability */
        :root {
          --color-text-primary: #1a1a2e !important;
          --color-text-secondary: #4a4a5a !important;
          --color-text-tertiary: #6a6a7a !important;
          --color-background-primary: #ffffff !important;
          --color-background-secondary: #f8f9fa !important;
          --color-border-primary: #ccc !important;
          --color-border-secondary: #ddd !important;
          --color-border-tertiary: #e8e8e8 !important;
          --border-radius-md: 6px !important;
          --border-radius-lg: 10px !important;
          --font-sans: 'Inter', -apple-system, sans-serif !important;
          --font-mono: 'JetBrains Mono', 'Consolas', monospace !important;
        }
      }
    `
  });

  // Also add light theme overrides directly (non-print) for Puppeteer rendering
  await page.addStyleTag({
    content: `
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
      
      /* Make nav tabs visible as labels in PDF */
      .ntab {
        background: #E6F1FB !important;
        color: #0C447C !important;
        border-color: #85B7EB !important;
        cursor: default !important;
      }
      .ntab.active {
        background: #0C447C !important;
        color: #ffffff !important;
      }
      
      /* Concept stepper buttons as labels */
      .cs-btn {
        background: #E6F1FB !important;
        color: #0C447C !important;
        border-color: #85B7EB !important;
      }
      .cs-btn.active {
        background: #0C447C !important;
        color: #ffffff !important;
      }
    `
  });

  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:9px; color:#888; width:100%; text-align:center; padding:5px 15mm;">
        ${htmlFile.replace('.html', '').replace(/_/g, ' ').toUpperCase()}
      </div>
    `,
    footerTemplate: `
      <div style="font-size:9px; color:#888; width:100%; display:flex; justify-content:space-between; padding:5px 15mm;">
        <span>@zubairkarobari</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await page.close();
  console.log(`  ✅ Saved: ${pdfName}`);
}

async function main() {
  console.log('🚀 AWS HTML → PDF Converter');
  console.log(`   Source: ${AWS_DIR}`);
  console.log(`   Output: ${PDF_DIR}`);
  console.log(`   Files:  ${HTML_FILES.length}\n`);

  // Create output directory
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  // Read external CSS once
  const externalCSS = getExternalCSS();
  console.log('📎 Loaded external CSS (styles.css + topic.css)\n');

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

  let successCount = 0;
  let failCount = 0;

  for (const htmlFile of HTML_FILES) {
    try {
      await convertFile(browser, htmlFile, externalCSS);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed: ${htmlFile} — ${err.message}`);
      failCount++;
    }
  }

  await browser.close();

  console.log('\n────────────────────────────────');
  console.log(`✅ Success: ${successCount} / ${HTML_FILES.length}`);
  if (failCount > 0) {
    console.log(`❌ Failed:  ${failCount}`);
  }
  console.log(`📁 PDFs saved to: ${PDF_DIR}`);
  console.log('────────────────────────────────\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
