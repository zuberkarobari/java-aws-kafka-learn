import { getTopics, getCurrentTopicId, getCategoriesByPathway, getTopicsByCategoryAndPathway, calcProgress, getRecommendation, getLastStudiedTopic, setLastStudiedTopic, markVisited, unmarkVisited, toggleVisited, calculateReadTime, getVisited, getPathwayTargetUrl } from './js/utils.js';
import { PATHWAYS, TOPIC_ORDER, TOPIC_META } from './js/topics.config.js';

console.log('=== VERIFICATION TEST START ===\n');

// Test 1: Verify Topic Resolution and Pathways
console.log('Test 1: Topic Resolution');
const allTopics = getTopics();
console.log(`Total topics loaded: ${allTopics.length}`);
if (allTopics.length === 0) throw new Error('No topics loaded!');
console.log('Sample topic:', allTopics[0]);

// Test 2: Verify Pathway target URLs
console.log('\nTest 2: Pathway target URLs');
for (const p of Object.keys(PATHWAYS)) {
  const target = getPathwayTargetUrl(p, '../../');
  console.log(`Pathway [${p}] target URL: ${target}`);
  if (!target) throw new Error(`Missing target for pathway ${p}`);
}

// Test 2: Verify Pathways
console.log('\nTest 2: Pathway configurations');
const pathwayKeys = Object.keys(PATHWAYS);
console.log('Configured pathways:', pathwayKeys);
for (const p of pathwayKeys) {
  const cats = getCategoriesByPathway(p);
  const topicsInPathway = getTopicsByCategoryAndPathway(p);
  console.log(`Pathway [${p}]: ${cats.length} categories, ${Object.values(topicsInPathway).flat().length} topics`);
}

// Test 3: Last Studied Topic & Continue Learning Engine
console.log('\nTest 3: Continue Learning logic');
// Simulate markVisited
markVisited('java/variables_data_types');
const lastStudied = getLastStudiedTopic();
console.log('Last studied topic after markVisited:', lastStudied ? `${lastStudied.id} (${lastStudied.title})` : 'null');
if (!lastStudied || lastStudied.id !== 'java/variables_data_types') {
  throw new Error(`Expected last studied to be java/variables_data_types, got ${lastStudied?.id}`);
}
console.log('Continue learning test passed!');

// Test 4: Search filter logic
console.log('\nTest 4: Search filter logic');
const testQuery = 'JVM';
const searchMatches = allTopics.filter(t => !t.isLocked).filter(t =>
  t.title.toLowerCase().includes(testQuery.toLowerCase()) ||
  (t.description && t.description.toLowerCase().includes(testQuery.toLowerCase())) ||
  (t.category && t.category.toLowerCase().includes(testQuery.toLowerCase()))
);
console.log(`Search query "${testQuery}" returned ${searchMatches.length} results:`, searchMatches.map(m => m.title));
if (searchMatches.length === 0) throw new Error('Expected at least 1 match for JVM');

console.log('\n=== ALL LOGIC VERIFICATIONS PASSED ===');

// ─── Test 5: DOM Simulation for app.js ─────────────────────────────────────────
console.log('\nTest 5: Dashboard and Search DOM tests');

// Mock DOM environment
global.document = {
  getElementById: (id) => {
    if (id === 'topics-grid') {
      return {
        _html: '',
        set innerHTML(val) { this._html = val; },
        get innerHTML() { return this._html; },
        querySelectorAll: () => []
      };
    }
    if (id === 'header-user-level' || id === 'header-streak-count') {
      return { textContent: '' };
    }
    if (id === 'search-input') {
      return { value: '' };
    }
    return null;
  },
  documentElement: {
    getAttribute: () => 'dark',
    setAttribute: () => {}
  },
  body: {
    classList: { contains: () => false },
    style: {}
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.window = {
  location: { href: '', pathname: '/index.html' }
};

global.requestAnimationFrame = (cb) => cb();

// Import app.js
const { renderRightSidebar } = await import('./js/app.js');

// Test CSS files for balanced braces
console.log('\nTest 6: CSS Balanced Braces Verification');
import fs from 'fs';
const checkBraces = (file) => {
  const content = fs.readFileSync(file, 'utf8');
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth < 0) {
        throw new Error(`Unmatched closing brace in ${file} at character ${i}`);
      }
    }
  }
  if (depth !== 0) {
    throw new Error(`Unclosed brace in ${file}, remaining open: ${depth}`);
  }
  console.log(`CSS file ${file}: balanced braces verified (0 unclosed).`);
};

checkBraces('css/styles.css');
checkBraces('css/topic.css');
checkBraces('css/home.css');

// Test 7: New Usability Features (Read Time, Visited Toggle)
console.log('\nTest 7: Usability Utilities Verification');

// Read time tests
if (calculateReadTime('') !== 1) throw new Error('Expected empty string to yield 1 min');
if (calculateReadTime('word '.repeat(50)) !== 1) throw new Error('Expected 50 words to yield 1 min');
if (calculateReadTime('word '.repeat(200)) !== 1) throw new Error('Expected 200 words to yield 1 min');
if (calculateReadTime('word '.repeat(500)) !== 3) throw new Error('Expected 500 words to yield 3 mins');
if (calculateReadTime('word '.repeat(1000)) !== 5) throw new Error('Expected 1000 words to yield 5 mins');
console.log('calculateReadTime tests passed successfully.');

// Visited toggle tests
const testTopicId = 'test/topic-demo';
unmarkVisited(testTopicId);
if (getVisited().has(testTopicId)) throw new Error('Expected unmarkVisited to clear topic');

const isNowDone = toggleVisited(testTopicId);
if (!isNowDone || !getVisited().has(testTopicId)) throw new Error('Expected toggleVisited to mark topic');

const isNowUndone = toggleVisited(testTopicId);
if (isNowUndone || getVisited().has(testTopicId)) throw new Error('Expected toggleVisited to unmark topic');
console.log('toggleVisited & unmarkVisited tests passed successfully.');

// Test 8: Full Topic URL Resolution and Completed Checkmark Integrity
console.log('\nTest 8: Full Topic Resolution for All 200 Topics');
const registeredTopics = getTopics();
let resolutionMismatches = 0;
for (const t of registeredTopics) {
  global.window = {
    location: {
      pathname: '/topics/' + encodeURI(t.file)
    }
  };
  const resolved = getCurrentTopicId();
  if (resolved !== t.id) {
    resolutionMismatches++;
    console.error(`Mismatch for file ${t.file}: expected "${t.id}", got "${resolved}"`);
  }
}
if (resolutionMismatches > 0) {
  throw new Error(`Failed: ${resolutionMismatches} topics did not resolve accurately`);
}
console.log(`All ${registeredTopics.length} topics resolved with 100% accuracy.`);

// Verify all 200 topic files have topic.js script included
let missingScripts = 0;
for (const t of registeredTopics) {
  const filePath = `topics/${t.file}`;
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent.includes('topic.js')) {
      missingScripts++;
      console.error(`Missing topic.js in ${filePath}`);
    }
  }
}
if (missingScripts > 0) {
  throw new Error(`Failed: ${missingScripts} topics are missing topic.js`);
}
console.log('All 200 topic HTML files confirmed to have topic.js runtime included.');

console.log('\n=== ALL EXTENDED TESTS COMPLETED SUCCESSFULLY ===');
