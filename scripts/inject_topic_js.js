import fs from 'fs';
import path from 'path';

const folders = ['topics/key-topics', 'topics/microservice', 'topics/design pattern'];
let updated = 0;

for (const folder of folders) {
  if (!fs.existsSync(folder)) continue;
  for (const file of fs.readdirSync(folder)) {
    if (!file.endsWith('.html')) continue;
    const full = path.join(folder, file);
    let content = fs.readFileSync(full, 'utf8');
    if (!content.includes('topic.js')) {
      if (!content.includes('styles.css')) {
        const headInjection = '\n  <link rel="stylesheet" href="../../css/styles.css" />\n  <link rel="stylesheet" href="../../css/topic.css" />\n';
        if (content.includes('</head>')) {
          content = content.replace('</head>', headInjection + '</head>');
        }
      }
      const scriptInjection = '\n  <script type="module" src="../../js/topic.js"></script>\n';
      if (content.includes('</body>')) {
        content = content.replace('</body>', scriptInjection + '</body>');
      } else {
        content = content + scriptInjection;
      }
      fs.writeFileSync(full, content, 'utf8');
      updated++;
    }
  }
}

console.log('Successfully updated files:', updated);

