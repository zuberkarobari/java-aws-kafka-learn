import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

import os from 'os';

const rootDir = process.cwd();
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer-test-'));

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8192, async () => {
  console.log('Static server listening on 8192');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      userDataDir: tempUserDataDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    console.log('\n--- TESTING /topics/java/java-basics.html ---');
    await page.goto('http://localhost:8192/topics/java/java-basics.html', { waitUntil: 'networkidle0' });

    const topicPageData = await page.evaluate(() => {
      const topicMain = document.querySelector('.topic-main');
      const topicArticle = document.querySelector('.topic-article');
      const topicContent = document.getElementById('topic-content');
      const layout = document.querySelector('.topic-layout');
      const bodyChildren = Array.from(document.body.children).map(c => `${c.tagName}.${c.className}#${c.id}`);

      return {
        bodyChildren,
        hasLayout: !!layout,
        layoutChildren: layout ? Array.from(layout.children).map(c => `${c.tagName}.${c.className}#${c.id}`) : [],
        topicMain: topicMain ? {
          display: getComputedStyle(topicMain).display,
          visibility: getComputedStyle(topicMain).visibility,
          opacity: getComputedStyle(topicMain).opacity,
          width: topicMain.offsetWidth,
          height: topicMain.offsetHeight,
          color: getComputedStyle(topicMain).color,
          bg: getComputedStyle(topicMain).backgroundColor
        } : null,
        topicContent: topicContent ? {
          display: getComputedStyle(topicContent).display,
          visibility: getComputedStyle(topicContent).visibility,
          width: topicContent.offsetWidth,
          height: topicContent.offsetHeight,
          htmlLength: topicContent.innerHTML.length,
          h1: document.querySelector('h1')?.textContent
        } : null
      };
    });

    console.log('TOPIC PAGE DATA:', JSON.stringify(topicPageData, null, 2));

    console.log('\n--- TESTING /index.html ---');
    await page.goto('http://localhost:8192/index.html', { waitUntil: 'networkidle0' });

    const indexData = await page.evaluate(() => {
      const dashboard = document.querySelector('.dashboard-main-wrapper');
      const errorDiv = document.querySelector('#topics-grid div[style*="color:red"], #topics-grid div[style*="color: red"]');
      return {
        hasDashboard: !!dashboard,
        error: errorDiv ? errorDiv.innerText : null
      };
    });

    console.log('INDEX PAGE DATA:', JSON.stringify(indexData, null, 2));

  } catch (e) {
    console.error('Test error:', e);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
