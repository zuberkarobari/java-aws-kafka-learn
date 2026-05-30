/**
 * topic.js — Topic page component injector
 * Reads the current page filename and injects ALL shared components:
 * header, sidebar, breadcrumb, prev/next nav, footer, Prism.js
 */

import {
  getTopics,
  getCurrentTopicId,
  getVisited,
  markVisited,
  getSavedTheme,
  saveTheme,
  getPathPrefix,
  getTopicsByCategoryAndPathway,
  getActivePathway,
} from './utils.js';
import { PATHWAYS } from './topics.config.js';
import { initCommandPalette } from './command-palette.js';

// ─── State ────────────────────────────────────────────────────────────────────

const prefix = getPathPrefix();
const currentId = getCurrentTopicId();
const topics = getTopics();
const activePathway = getActivePathway();

// Filter topics list by the active pathway to keep navigation consistent
const pathwayTopics = topics.filter(t => 
  PATHWAYS[activePathway]?.categories.includes(t.category)
);
const currentIndexInPathway = pathwayTopics.findIndex((t) => t.id === currentId);
const currentTopic = topics.find((t) => t.id === currentId) || null;
const prevTopic = currentIndexInPathway > 0 ? pathwayTopics[currentIndexInPathway - 1] : null;
const nextTopic = currentIndexInPathway < pathwayTopics.length - 1 ? pathwayTopics[currentIndexInPathway + 1] : null;

// ─── Theme ────────────────────────────────────────────────────────────────────

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
};

// ─── Header Injection ─────────────────────────────────────────────────────────

const injectHeader = () => {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'site-header';
  header.innerHTML = `
    <div class="header-inner">
      <a href="${prefix}index.html" class="header-logo" aria-label="Go to homepage">
        <span class="logo-icon">☕</span>
        <span class="logo-text">Java Learn</span>
      </a>

      <!-- Pathway Navigation Tabs (Redirect Context) -->
      <nav class="pathway-nav" id="pathway-nav" aria-label="Learning Pathways">
        <a href="${prefix}index.html?pathway=dashboard" class="pathway-tab ${activePathway === 'dashboard' ? 'active' : ''}" data-pathway="dashboard">
          <span class="tab-icon">📊</span>
          <span class="tab-text">Dashboard</span>
        </a>
        ${Object.entries(PATHWAYS).map(([id, pw]) => `
          <a href="${prefix}index.html?pathway=${id}" class="pathway-tab ${id === activePathway ? 'active' : ''}" data-pathway="${id}">
            <span class="tab-icon">${pw.icon}</span>
            <span class="tab-text">${pw.title}</span>
          </a>
        `).join('')}
      </nav>

      <div class="header-actions">
        <a href="${prefix}index.html" class="btn-home" aria-label="Home">
          <span>🏠</span> Home
        </a>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <span id="theme-icon">☀️</span>
        </button>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar" aria-expanded="false">
          <span class="hamburger"></span>
        </button>
      </div>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);
};

// ─── Breadcrumb Injection ─────────────────────────────────────────────────────

const injectBreadcrumb = () => {
  if (!currentTopic) return;

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  breadcrumb.innerHTML = `
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="${prefix}index.html">Home</a>
      </li>
      <li class="breadcrumb-sep" aria-hidden="true">›</li>
      <li class="breadcrumb-item">
        <a href="${prefix}index.html#cat-${slugify(currentTopic.category)}">${currentTopic.category}</a>
      </li>
      <li class="breadcrumb-sep" aria-hidden="true">›</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        ${currentTopic.title}
      </li>
    </ol>
  `;
  return breadcrumb;
};

// ─── Sidebar Injection ────────────────────────────────────────────────────────

const injectSidebar = () => {
  const byCategory = getTopicsByCategoryAndPathway(activePathway);
  const visited = getVisited();

  const sidebar = document.createElement('aside');
  sidebar.className = 'topic-sidebar';
  sidebar.id = 'topic-sidebar';
  sidebar.setAttribute('aria-label', 'Topics navigation');

  const categoriesHtml = Object.entries(byCategory)
    .map(([cat, catTopics]) => `
      <div class="sidebar-group">
        <h3 class="sidebar-group-title">${cat}</h3>
        <ul class="sidebar-topic-list">
          ${catTopics.map((t) => {
            const isCurrent = t.id === currentId;
            const fileHref = `${prefix}topics/${t.file}`;
            
            if (t.isLocked) {
              return `
                <li>
                  <div class="sidebar-topic-link" style="opacity: 0.55; cursor: default;" title="Roadmap Planned Topic">
                    <span class="sidebar-topic-icon">${t.icon}</span>
                    <span>${t.title}</span>
                    <span style="font-size: 0.65rem; margin-left: auto; color: var(--text-muted);">🔒</span>
                  </div>
                </li>
              `;
            }

            return `
              <li>
                <a href="${fileHref}"
                   class="sidebar-topic-link ${isCurrent ? 'sidebar-topic-active' : ''} ${visited.has(t.id) ? 'sidebar-topic-visited' : ''}"
                   ${isCurrent ? 'aria-current="page"' : ''}>
                  <span class="sidebar-topic-icon">${t.icon}</span>
                  <span>${t.title}</span>
                  ${visited.has(t.id) ? '<span class="sidebar-check">✓</span>' : ''}
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `).join('');

  sidebar.innerHTML = `
    <div class="sidebar-inner">
      <div class="sidebar-search-wrap">
        <input type="search" class="sidebar-search" id="sidebar-search" placeholder="Filter topics…" aria-label="Filter topics">
      </div>
      <div class="sidebar-categories" id="sidebar-categories">
        ${categoriesHtml}
      </div>
    </div>
  `;

  return sidebar;
};

// ─── Prev/Next Nav Injection ──────────────────────────────────────────────────

const injectPrevNext = () => {
  const nav = document.createElement('nav');
  nav.className = 'prev-next-nav';
  nav.setAttribute('aria-label', 'Previous and next topics');
  nav.innerHTML = `
    <div class="prev-next-inner">
      <div class="prev-link-wrap">
        ${prevTopic ? `
          <a href="${prefix}topics/${prevTopic.file}" class="prev-next-link prev-link" id="prev-topic-link">
            <span class="prev-next-dir">← Previous</span>
            <span class="prev-next-title">${prevTopic.icon} ${prevTopic.title}</span>
          </a>
        ` : '<span></span>'}
      </div>
      <div class="next-link-wrap">
        ${nextTopic ? `
          <a href="${prefix}topics/${nextTopic.file}" class="prev-next-link next-link" id="next-topic-link">
            <span class="prev-next-dir">Next →</span>
            <span class="prev-next-title">${nextTopic.icon} ${nextTopic.title}</span>
          </a>
        ` : '<span></span>'}
      </div>
    </div>
  `;
  return nav;
};

// ─── Footer Injection ─────────────────────────────────────────────────────────

const injectFooter = () => {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <span>☕ Java Learn</span>
      <span class="footer-sep">·</span>
      <span>Built for learners</span>
    </div>
  `;
  return footer;
};

// ─── Sidebar Filter ───────────────────────────────────────────────────────────

const initSidebarFilter = () => {
  const input = document.getElementById('sidebar-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    document.querySelectorAll('.sidebar-topic-link').forEach((link) => {
      const text = link.textContent.toLowerCase();
      const li = link.closest('li');
      if (li) li.style.display = text.includes(query) ? '' : 'none';
    });

    // Hide empty groups
    document.querySelectorAll('.sidebar-group').forEach((group) => {
      const visible = group.querySelectorAll('li:not([style*="display: none"])').length;
      group.style.display = visible > 0 ? '' : 'none';
    });
  });
};

// ─── Sidebar Toggle (mobile) ──────────────────────────────────────────────────

const initSidebarToggle = () => {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('topic-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', 'false');
    overlay?.classList.remove('overlay-visible');
  };

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('sidebar-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    overlay?.classList.toggle('overlay-visible', isOpen);
  });

  overlay?.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
};

// ─── Prism.js ─────────────────────────────────────────────────────────────────

const loadPrism = () => {
  // Load Prism CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
  document.head.appendChild(link);

  // Load Prism core + Java + markup
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js';
  script.onload = () => {
    const autoloader = document.createElement('script');
    autoloader.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js';
    document.head.appendChild(autoloader);
  };
  document.head.appendChild(script);
};

// ─── Layout Assembly ──────────────────────────────────────────────────────────

const assembleLayout = () => {
  const originalContent = document.getElementById('topic-content');
  if (!originalContent) return;

  const breadcrumb = injectBreadcrumb();
  const sidebar = injectSidebar();
  const prevNext = injectPrevNext();
  const footer = injectFooter();

  // Build wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'topic-layout';
  wrapper.innerHTML = '<div id="sidebar-overlay" class="sidebar-overlay"></div>';
  wrapper.appendChild(sidebar);

  const main = document.createElement('div');
  main.className = 'topic-main';

  if (breadcrumb) main.appendChild(breadcrumb);

  const article = document.createElement('article');
  article.className = 'topic-article';
  // Move original content into article
  article.appendChild(originalContent);
  main.appendChild(article);
  main.appendChild(prevNext);
  wrapper.appendChild(main);

  document.body.appendChild(wrapper);
  document.body.appendChild(footer);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── Init ─────────────────────────────────────────────────────────────────────

const init = () => {
  const theme = getSavedTheme();
  applyTheme(theme);

  injectHeader();
  assembleLayout();

  // Set page title from topic
  if (currentTopic) {
    document.title = `${currentTopic.title} — Java Learn`;
  }

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  initSidebarToggle();
  initSidebarFilter();
  loadPrism();

  // Mark topic as visited
  if (currentId) markVisited(currentId);

  // Scroll active sidebar item into view
  requestAnimationFrame(() => {
    document.querySelector('.sidebar-topic-active')?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  });

  initCommandPalette();
};

document.addEventListener('DOMContentLoaded', init);

