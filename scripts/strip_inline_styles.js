/**
 * strip_inline_styles.js
 *
 * For Class B pages (already have topic.js + id="topic-content") that STILL have
 * conflicting <style> blocks in their <head> — this script removes those style blocks
 * and ensures they use the design system CSS variables.
 *
 * Run: node scripts/strip_inline_styles.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOPICS_DIR = join(__dirname, '..', 'topics');

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
 * Compute relative prefix for CSS/JS from file location
 */
function getPrefix(filePath) {
  const rel = relative(TOPICS_DIR, filePath);
  const depth = rel.split(/[\\/]/).length;
  return '../'.repeat(depth);
}

/**
 * Check if a <style> block appears to be a custom design override
 * (not a Prism theme, not a small utility block)
 * Returns true if the style block should be removed.
 */
function isConflictingStyleBlock(styleContent) {
  // Keep: empty/tiny style blocks (under 200 chars)
  if (styleContent.trim().length < 200) return false;
  
  // Keep: prism-related styles
  if (styleContent.includes('prism') || styleContent.includes('token')) return false;
  
  // Remove: styles that define their own color system, body background, etc.
  const conflictingPatterns = [
    /body\s*\{[^}]*background/i,
    /--bg-main:/i,
    /--bg-card:/i,
    /--primary:/i,
    /background\s*:\s*#0d|background\s*:\s*#1a|background\s*:\s*#161|background\s*:\s*#0a/i,
    /font-family\s*:\s*'Inter'.*body/is,
  ];
  
  return conflictingPatterns.some(p => p.test(styleContent));
}

let strippedCount = 0;
let cssLinkAddedCount = 0;
let totalFixed = 0;
let skipped = 0;

for (const filePath of getAllHtmlFiles(TOPICS_DIR)) {
  const html = readFileSync(filePath, 'utf8');
  const relPath = relative(TOPICS_DIR, filePath);
  
  // Only process Class B: has topic.js AND topic-content AND is NOT a Tailwind page already converted
  const hasTopicJs = html.includes('topic.js');
  const hasTopicContent = html.includes('id="topic-content"');
  
  if (!hasTopicJs || !hasTopicContent) {
    skipped++;
    continue;
  }

  let modified = false;
  let result = html;

  // 1. Find and remove conflicting <style> blocks in <head>
  result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, content) => {
    if (isConflictingStyleBlock(content)) {
      console.log(`  [STRIP STYLE] ${relPath} (${content.trim().length} chars)`);
      modified = true;
      strippedCount++;
      return '<!-- inline styles removed by strip_inline_styles.js -->';
    }
    return match;
  });

  // 2. Ensure both CSS links are present in <head>
  const prefix = getPrefix(filePath);
  const stylesCssRef = `${prefix}css/styles.css`;
  const topicCssRef = `${prefix}css/topic.css`;

  if (!result.includes('styles.css') && result.includes('</head>')) {
    result = result.replace('</head>', 
      `  <link rel="stylesheet" href="${stylesCssRef}" />\n  <link rel="stylesheet" href="${topicCssRef}" />\n</head>`
    );
    modified = true;
    cssLinkAddedCount++;
    console.log(`  [ADD CSS LINKS] ${relPath}`);
  } else if (!result.includes('topic.css') && result.includes('</head>')) {
    result = result.replace('</head>', 
      `  <link rel="stylesheet" href="${topicCssRef}" />\n</head>`
    );
    modified = true;
    cssLinkAddedCount++;
    console.log(`  [ADD TOPIC CSS] ${relPath}`);
  }

  if (modified) {
    writeFileSync(filePath, result, 'utf8');
    totalFixed++;
  }
}

console.log('\n=== DONE ===');
console.log(`Style blocks stripped: ${strippedCount}`);
console.log(`CSS links added: ${cssLinkAddedCount}`);
console.log(`Files modified: ${totalFixed}`);
console.log(`Files skipped (already clean): ${skipped}`);
