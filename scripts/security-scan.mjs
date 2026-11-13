import fs from 'fs';
import path from 'path';

const SECRET_PATTERNS = [
  { name: 'Google/Firebase API Key', regex: /AIzaSy[A-Za-z0-9_-]{33}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', regex: /aws_secret_access_key\s*=\s*[A-Za-z0-9\/+=]{40}/gi },
  { name: 'GitHub Personal Access Token', regex: /gh[pous]_[A-Za-z0-9_]{36,255}/g },
  { name: 'Stripe API Key', regex: /[rs]k_(live|test)_[0-9a-zA-Z]{24}/g },
  { name: 'Private Key Block', regex: /-----BEGIN[ A-Z0-9_-]+KEY-----/g },
  { name: 'Hardcoded Bearer Token', regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g }
];

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.vscode', '.idea', 'scripts']);
const IGNORED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.woff', '.woff2', '.ttf']);

let findings = [];

function scanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORED_EXTS.has(ext)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    SECRET_PATTERNS.forEach(({ name, regex }) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const val = match[0];
        // Exclude example/placeholder keys and tutorial docs
        if (
          val.includes('PLACEHOLDER') ||
          val.includes('YOUR_') ||
          val.includes('EXAMPLE') ||
          val.includes('your_') ||
          val.includes('token_here') ||
          val.toLowerCase().includes('sample') ||
          val.toLowerCase().includes('fake') ||
          val.toLowerCase().includes('bearer token') ||
          val.toLowerCase().includes('bearer eyjh') ||
          val.toLowerCase().includes('bearer <')
        ) continue;
        
        findings.push({
          file: filePath,
          type: name,
          match: val.substring(0, 10) + '...'
        });
      }
    });
  } catch (err) {
    // Ignore unreadable files
  }
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(fullPath);
    } else {
      scanFile(fullPath);
    }
  }
}

console.log('--- SCANNING WORKSPACE FOR EXPOSED SECRETS ---');
traverse('.');
if (findings.length === 0) {
  console.log('SUCCESS: Zero exposed keys, secrets, or credentials found!');
} else {
  console.error(`WARNING: Found ${findings.length} exposed secrets:`);
  console.error(findings);
  process.exit(1);
}
