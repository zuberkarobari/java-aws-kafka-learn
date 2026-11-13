/**
 * topic.js — Topic page component injector & seamless navigation router
 * Reads the current page filename and injects ALL shared components:
 * header, sidebar, breadcrumb, prev/next nav, footer, Prism.js
 * Provides independent sidebar scrolling with persistent scroll position
 * and seamless in-page topic transitions without page reloads.
 */

import {
  getTopics,
  getCurrentTopicId,
  getVisited,
  markVisited,
  toggleVisited,
  calculateReadTime,
  getSavedTheme,
  saveTheme,
  getPathPrefix,
  getTopicsByCategoryAndPathway,
  getActivePathway,
  calcProgress,
  getPathwayTargetUrl,
} from './utils.js';
import { PATHWAYS } from './topics.config.js';
import { initCommandPalette, openCommandPalette } from './command-palette.js';
import { hasQuizForTopic, openQuiz } from './quiz.js';

// ─── State ────────────────────────────────────────────────────────────────────

const prefix = getPathPrefix();
const topics = getTopics();
let currentId = getCurrentTopicId();
let currentTopic = topics.find((t) => t.id === currentId) || null;
let activePathway = getActivePathway();

const SIDEBAR_SCROLL_KEY = 'java_learn_sidebar_scroll';

let pathwayCategories = [];
let pathwayTopics = [];
let currentIndexInPathway = -1;
let prevTopic = null;
let nextTopic = null;

const recomputePathwayState = () => {
  // Self-healing: if the current topic is not in the active pathway, find a pathway that contains it
  if (currentTopic) {
    const isCurrentInActive = activePathway &&
      PATHWAYS[activePathway] &&
      PATHWAYS[activePathway].categories.includes(currentTopic.category);
    if (!isCurrentInActive) {
      const matchingPathway = Object.keys(PATHWAYS).find(pwId =>
        PATHWAYS[pwId]?.categories?.includes(currentTopic.category)
      );
      if (matchingPathway) {
        activePathway = matchingPathway;
        try { localStorage.setItem('java-learn-active-pathway', activePathway); } catch { }
      }
    }
  }

  pathwayCategories = PATHWAYS[activePathway]?.categories || [];
  pathwayTopics = topics.filter(t => pathwayCategories.includes(t.category));
  currentIndexInPathway = pathwayTopics.findIndex((t) => t.id === currentId);
  prevTopic = currentIndexInPathway > 0 ? pathwayTopics[currentIndexInPathway - 1] : null;
  nextTopic = currentIndexInPathway < pathwayTopics.length - 1 ? pathwayTopics[currentIndexInPathway + 1] : null;
};

recomputePathwayState();

// ─── Theme ────────────────────────────────────────────────────────────────────

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
};

// ─── Header Injection ─────────────────────────────────────────────────────────

const injectHeader = () => {
  if (document.getElementById('site-header')) return;

  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'site-header';
  header.innerHTML = `
    <div class="header-inner">
      <a href="${prefix}index.html" class="header-logo" aria-label="Go to homepage">
        <span class="logo-icon" style="display: flex; align-items: center;"><img src="https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg" alt="Java Logo" width="28" height="28"></span>
        <span class="logo-text">Java Learn</span>
      </a>

      <!-- Pathway Navigation Container with smooth horizontal controls -->
      <div class="pathway-nav-container">
        <button class="nav-scroll-btn nav-scroll-prev" id="nav-scroll-prev" aria-label="Scroll pathways left" title="Scroll left">‹</button>
        <nav class="pathway-nav" id="pathway-nav" aria-label="Learning Pathways">
          <a href="${prefix}index.html?pathway=dashboard" class="pathway-tab ${activePathway === 'dashboard' ? 'active' : ''}" data-pathway="dashboard" title="Dashboard">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Dashboard</span>
          </a>
          ${Object.entries(PATHWAYS).map(([id, pw]) => {
    const targetUrl = getPathwayTargetUrl(id, prefix);
    return `
              <a href="${targetUrl}" class="pathway-tab ${id === activePathway ? 'active' : ''}" data-pathway="${id}" title="${pw.title}">
                <span class="tab-icon">${pw.icon}</span>
                <span class="tab-text">${pw.title}</span>
              </a>
            `;
  }).join('')}
        </nav>
        <button class="nav-scroll-btn nav-scroll-next" id="nav-scroll-next" aria-label="Scroll pathways right" title="Scroll right">›</button>
      </div>

      <div class="header-actions">
        <a href="${prefix}index.html" class="btn-home" aria-label="Home" title="Return to Homepage">
          <span aria-hidden="true">🏠</span> <span class="btn-home-label">Home</span>
        </a>
        <button id="header-search-btn" class="header-search-btn" aria-label="Search topics" title="Quick Search (Press / or Ctrl+K)">
          <span aria-hidden="true">🔍</span>
        </button>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme" title="Toggle dark/light mode">
          <span id="theme-icon">☀️</span>
        </button>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar" aria-expanded="false" title="Toggle navigation drawer">
          <span class="hamburger"></span>
        </button>
      </div>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);
  initHeaderInteractions();
};

const initHeaderInteractions = () => {
  const pathwayNav = document.getElementById('pathway-nav');
  const prevBtn = document.getElementById('nav-scroll-prev');
  const nextBtn = document.getElementById('nav-scroll-next');

  if (pathwayNav) {
    // Horizontal wheel scroll over pathway tabs
    pathwayNav.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        pathwayNav.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // Arrow buttons
    prevBtn?.addEventListener('click', () => {
      pathwayNav.scrollBy({ left: -220, behavior: 'smooth' });
    });
    nextBtn?.addEventListener('click', () => {
      pathwayNav.scrollBy({ left: 220, behavior: 'smooth' });
    });

    // Auto-scroll active tab into view
    requestAnimationFrame(() => {
      const activeTab = pathwayNav.querySelector('.pathway-tab.active');
      if (activeTab) {
        activeTab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    });
  }
};

const updatePathwayTabsState = () => {
  const tabs = document.querySelectorAll('.pathway-tab');
  tabs.forEach(tab => {
    const isTarget = tab.getAttribute('data-pathway') === activePathway;
    tab.classList.toggle('active', isTarget);
    if (isTarget) {
      tab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  });
};

// ─── Breadcrumb Injection ─────────────────────────────────────────────────────

const injectBreadcrumb = () => {
  if (!currentTopic) return null;

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  breadcrumb.innerHTML = getBreadcrumbHTML(currentTopic);
  return breadcrumb;
};

const getBreadcrumbHTML = (topic) => {
  if (!topic) return '';
  const contentEl = document.getElementById('topic-content');
  const readMinutes = calculateReadTime(contentEl ? contentEl.innerText : '');
  return `
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="${prefix}index.html">Home</a>
      </li>
      <li class="breadcrumb-sep" aria-hidden="true">›</li>
      <li class="breadcrumb-item">
        <a href="${prefix}index.html?pathway=${activePathway}#cat-${slugify(topic.category)}">${topic.category}</a>
      </li>
      <li class="breadcrumb-sep" aria-hidden="true">›</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        ${topic.title}
      </li>
    </ol>
    <span class="breadcrumb-read-time" title="Estimated reading time">
      <span aria-hidden="true">⏱️</span> ${readMinutes} min read
    </span>
  `;
};

const updateBreadcrumbUI = (topic) => {
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb && topic) {
    breadcrumb.innerHTML = getBreadcrumbHTML(topic);
  }
};

// ─── Sidebar Injection ────────────────────────────────────────────────────────

const generateSidebarCategoriesHTML = () => {
  const byCategory = getTopicsByCategoryAndPathway(activePathway);
  const visited = getVisited();

  return Object.entries(byCategory)
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
                   data-topic-id="${t.id}"
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
};

const injectSidebar = () => {
  const sidebar = document.createElement('aside');
  sidebar.className = 'topic-sidebar';
  sidebar.id = 'topic-sidebar';
  sidebar.setAttribute('aria-label', 'Topics navigation');

  sidebar.innerHTML = `
    <div class="sidebar-inner">
      <div class="sidebar-mobile-header">
        <span class="sidebar-mobile-title">Topics Navigation</span>
        <button type="button" class="sidebar-mobile-close" id="sidebar-mobile-close" aria-label="Close topics sidebar">✕</button>
      </div>
      <div class="sidebar-search-wrap">
        <input type="search" class="sidebar-search" id="sidebar-search" placeholder="Filter topics…" aria-label="Filter topics">
      </div>
      <div class="sidebar-categories" id="sidebar-categories">
        ${generateSidebarCategoriesHTML()}
      </div>
    </div>
  `;

  return sidebar;
};

const rebuildSidebarCategories = () => {
  const container = document.getElementById('sidebar-categories');
  if (container) {
    container.innerHTML = generateSidebarCategoriesHTML();
    initSidebarFilter();
    initSidebarScroll();
  }
};

const updateSidebarActiveState = (topicId) => {
  const visited = getVisited();
  const links = document.querySelectorAll('.sidebar-topic-link');

  links.forEach(link => {
    const id = link.getAttribute('data-topic-id');
    if (!id) return;
    const isCurrent = id === topicId;
    link.classList.toggle('sidebar-topic-active', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }

    const isVisited = visited.has(id);
    link.classList.toggle('sidebar-topic-visited', isVisited);
    const existingCheck = link.querySelector('.sidebar-check');
    if (isVisited) {
      if (!existingCheck) {
        const check = document.createElement('span');
        check.className = 'sidebar-check';
        check.textContent = '✓';
        link.appendChild(check);
      }
    } else if (existingCheck) {
      existingCheck.remove();
    }
  });
};

// ─── Sidebar Independent Scroll & Persistence ─────────────────────────────────

const initSidebarScroll = () => {
  const scrollContainer = document.getElementById('sidebar-categories');
  if (!scrollContainer) return;

  // Track user scroll position in sessionStorage
  scrollContainer.addEventListener('scroll', () => {
    try {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(scrollContainer.scrollTop));
    } catch { }
  }, { passive: true });

  // Restore scroll position
  try {
    const savedScroll = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (savedScroll !== null) {
      scrollContainer.scrollTop = parseInt(savedScroll, 10);
    }
  } catch { }

  // Auto-scroll to keep active topic visible without resetting to top
  requestAnimationFrame(() => {
    ensureActiveSidebarVisible(false);
  });
};

const ensureActiveSidebarVisible = (smooth = true) => {
  const scrollContainer = document.getElementById('sidebar-categories');
  const activeLink = scrollContainer?.querySelector('.sidebar-topic-active');
  if (!scrollContainer || !activeLink) return;

  const containerRect = scrollContainer.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();

  // If outside comfortable viewport, scroll smoothly into view
  const isComfortablyVisible = (
    linkRect.top >= containerRect.top + 36 &&
    linkRect.bottom <= containerRect.bottom - 36
  );

  if (!isComfortablyVisible) {
    activeLink.scrollIntoView({
      block: 'center',
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

// ─── Prev/Next Nav Injection ──────────────────────────────────────────────────

const injectProgressBar = () => {
  const { percent } = calcProgress(activePathway);
  const isVisited = currentId ? getVisited().has(currentId) : false;

  const container = document.createElement('div');
  container.className = 'topic-sticky-progress';

  container.innerHTML = `
    <span class="topic-progress-text">Topic progress: ${percent}%</span>
    <div class="topic-progress-track">
      <div class="topic-progress-fill" style="width: ${percent}%;"></div>
    </div>
    <button id="sticky-btn-toggle-completed" class="sticky-btn-complete ${isVisited ? 'completed' : ''}">
      ${isVisited ? '✓ Completed' : 'Mark Done'}
    </button>
  `;
  container.querySelector('#sticky-btn-toggle-completed')?.addEventListener('click', handleToggleCompleted);
  return container;
};

const updateProgressBarUI = () => {
  const { percent } = calcProgress(activePathway);
  const bar = document.querySelector('.topic-sticky-progress');
  if (!bar) return;
  const label = bar.querySelector('.topic-progress-text');
  const fill = bar.querySelector('.topic-progress-fill');
  if (label) label.textContent = `Topic progress: ${percent}%`;
  if (fill) fill.style.width = `${percent}%`;

  const isVisited = currentId ? getVisited().has(currentId) : false;
  const stickyBtn = bar.querySelector('#sticky-btn-toggle-completed');
  if (stickyBtn) {
    stickyBtn.className = `sticky-btn-complete ${isVisited ? 'completed' : ''}`;
    stickyBtn.innerHTML = isVisited ? '✓ Completed' : 'Mark Done';
  }
};

const getPrevNextHTML = (prev, next) => `
  <div class="prev-next-inner">
    <div class="prev-link-wrap">
      ${prev ? `
        <a href="${prefix}topics/${prev.file}" class="prev-next-link prev-link" id="prev-topic-link" title="Previous: ${prev.title} (Press [ or p)">
          <span class="prev-next-dir">← Previous Topic <span class="kbd-shortcut-hint">[</span></span>
          <span class="prev-next-title">${prev.icon} ${prev.title}</span>
        </a>
      ` : ''}
    </div>
    <div class="next-link-wrap">
      ${next ? `
        <a href="${prefix}topics/${next.file}" class="prev-next-link next-link" id="next-topic-link" title="Next: ${next.title} (Press ] or n)">
          <span class="prev-next-dir">Next Topic → <span class="kbd-shortcut-hint">]</span></span>
          <span class="prev-next-title">${next.icon} ${next.title}</span>
        </a>
      ` : ''}
    </div>
  </div>
`;

const injectPrevNext = () => {
  if (!prevTopic && !nextTopic) return null;

  const nav = document.createElement('nav');
  nav.className = 'prev-next-nav';
  nav.setAttribute('aria-label', 'Previous and next topics');
  nav.innerHTML = getPrevNextHTML(prevTopic, nextTopic);
  return nav;
};

const updatePrevNextUI = () => {
  const nav = document.querySelector('.prev-next-nav');
  if (!nav) return;
  nav.innerHTML = getPrevNextHTML(prevTopic, nextTopic);
};

// ─── Footer Injection ─────────────────────────────────────────────────────────

const injectFooter = () => {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <span style="display: inline-flex; align-items: center; gap: 6px;">
        <img src="https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg" alt="Java Logo" width="16" height="16">
        Java Learn
      </span>
      <span class="footer-sep">·</span>
      <span>Built for learners</span>
    </div>
  `;
  return footer;
};

// ─── Reading Depth Progress Bar & Floating Back to Top ──────────────

const injectReadingProgressBar = () => {
  let bar = document.getElementById('reading-progress-bar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'reading-progress-bar';
  bar.className = 'reading-progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  document.body.appendChild(bar);
  return bar;
};

const updateReadingProgress = () => {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  progressBar.style.width = `${clamped}%`;
  progressBar.setAttribute('aria-valuenow', clamped);
};

const injectBackToTop = () => {
  let btn = document.getElementById('btn-back-to-top');
  if (btn) return btn;
  btn = document.createElement('button');
  btn.id = 'btn-back-to-top';
  btn.className = 'btn-back-to-top';
  btn.setAttribute('aria-label', 'Scroll back to top');
  btn.setAttribute('title', 'Back to top (Press t)');
  btn.innerHTML = '↑';
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);
  return btn;
};

const updateBackToTopVisibility = () => {
  const btn = document.getElementById('btn-back-to-top');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 350);
};

let readingScrollTicking = false;
const initReadingScrollListeners = () => {
  window.addEventListener('scroll', () => {
    if (!readingScrollTicking) {
      window.requestAnimationFrame(() => {
        updateReadingProgress();
        updateBackToTopVisibility();
        readingScrollTicking = false;
      });
      readingScrollTicking = true;
    }
  }, { passive: true });
};

// ─── Code Block Copy to Clipboard ─────────────────────────────

const copyCodeToClipboard = async (btn, text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    btn.innerHTML = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '📋 Copy';
      btn.classList.remove('copied');
    }, 2000);
  } catch {
    btn.innerHTML = 'Error';
    setTimeout(() => { btn.innerHTML = '📋 Copy'; }, 2000);
  }
};

const initCodeCopyButtons = (root = document) => {
  const preElements = root.querySelectorAll('#topic-content pre');
  preElements.forEach((pre) => {
    if (pre.querySelector('.btn-copy-code')) return;
    const btn = document.createElement('button');
    btn.className = 'btn-copy-code';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.setAttribute('title', 'Copy code');
    btn.innerHTML = '📋 Copy';
    btn.addEventListener('click', () => {
      const codeEl = pre.querySelector('code') || pre;
      copyCodeToClipboard(btn, codeEl.innerText.trim());
    });
    pre.appendChild(btn);
  });
};

// ─── Table of Contents (On this page) ─────────────────────────

const getHeadingsList = () => {
  const contentEl = document.getElementById('topic-content');
  if (!contentEl) return [];
  return Array.from(contentEl.querySelectorAll('h2, h3'));
};

const buildTableOfContents = () => {
  const headings = getHeadingsList();
  if (headings.length < 2) return null;

  const nav = document.createElement('nav');
  nav.className = 'topic-toc-bar';
  nav.id = 'topic-toc-bar';
  nav.setAttribute('aria-label', 'On this page navigation');

  const label = document.createElement('span');
  label.className = 'toc-label';
  label.innerHTML = '<span>📑</span> On this page:';
  nav.appendChild(label);

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'toc-pills';

  headings.forEach((h, index) => {
    if (!h.id) {
      h.id = slugify(h.textContent) || `section-${index + 1}`;
    }
    const pill = document.createElement('a');
    pill.className = 'toc-pill';
    pill.href = `#${h.id}`;
    pill.textContent = h.textContent.replace(/^[\d.]+\s*/, '').trim();
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(h.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${h.id}`);
      }
    });
    pillsWrap.appendChild(pill);
  });

  nav.appendChild(pillsWrap);
  return nav;
};

const updateTableOfContentsUI = () => {
  const existingToc = document.getElementById('topic-toc-bar');
  const newToc = buildTableOfContents();
  if (existingToc && newToc) {
    existingToc.parentNode.replaceChild(newToc, existingToc);
  } else if (existingToc && !newToc) {
    existingToc.remove();
  } else if (!existingToc && newToc) {
    const main = document.querySelector('.topic-main');
    const article = document.querySelector('.topic-article');
    if (main && article) {
      main.insertBefore(newToc, article);
    }
  }
};

// ─── Gamified Completion Card & XP Toast ──────────────────────

const showXPToast = (message, xpBadge = '+10 XP') => {
  let container = document.querySelector('.xp-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'xp-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.innerHTML = `
    <span class="xp-toast-badge">${xpBadge}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
};

const getCompletionCardHTML = (isVisited) => `
  <div class="complete-info">
    <span class="complete-icon">🎯</span>
    <div>
      <h4 class="complete-title">Topic Completion</h4>
      <p class="complete-subtitle">Mark this topic complete to record your study session and earn XP.</p>
    </div>
  </div>
  <button id="btn-toggle-completed" class="btn-toggle-completed ${isVisited ? 'completed' : ''}" aria-pressed="${isVisited}">
    ${isVisited ? '✓ Completed' : 'Mark as Completed'}
  </button>
`;

const handleToggleCompleted = () => {
  if (!currentId) return;
  const isNowCompleted = toggleVisited(currentId);

  updateSidebarActiveState(currentId);
  updateProgressBarUI();
  updateCompletionCardUI();

  if (isNowCompleted) {
    showXPToast('Topic completed! Study session logged.', '+10 XP');
  } else {
    showXPToast('Topic marked as uncompleted.', 'Updated');
  }
};

const injectCompletionCard = () => {
  const isVisited = currentId ? getVisited().has(currentId) : false;
  const card = document.createElement('div');
  card.className = 'topic-complete-card';
  card.id = 'topic-complete-card';
  card.innerHTML = getCompletionCardHTML(isVisited);
  card.querySelector('#btn-toggle-completed')?.addEventListener('click', handleToggleCompleted);
  return card;
};

const updateCompletionCardUI = () => {
  const card = document.getElementById('topic-complete-card');
  if (!card) return;
  const isVisited = currentId ? getVisited().has(currentId) : false;
  card.innerHTML = getCompletionCardHTML(isVisited);
  card.querySelector('#btn-toggle-completed')?.addEventListener('click', handleToggleCompleted);
};

// ─── Keyboard Navigation ───────────────────────────────────────

const initKeyboardNavigation = () => {
  window.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable) {
      return;
    }
    if (document.querySelector('.cmd-overlay.active') || document.querySelector('.quiz-overlay')) {
      return;
    }

    if (e.key === ']' || e.key === 'n' || (e.altKey && e.key === 'ArrowRight')) {
      if (nextTopic) {
        e.preventDefault();
        navigateToTopic(`${prefix}topics/${nextTopic.file}`, true);
      }
    } else if (e.key === '[' || e.key === 'p' || (e.altKey && e.key === 'ArrowLeft')) {
      if (prevTopic) {
        e.preventDefault();
        navigateToTopic(`${prefix}topics/${prevTopic.file}`, true);
      }
    } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};

// ─── Sidebar Filter ───────────────────────────────────────────────────────────

const initSidebarFilter = () => {
  const input = document.getElementById('sidebar-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
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

// ─── Responsive Tables Helper ────────────────────────────────────────────────
const makeTablesResponsive = (container = document) => {
  const tables = container.querySelectorAll('table');
  tables.forEach((table) => {
    if (!table.parentElement.classList.contains('table-responsive-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
};

// ─── Sidebar Toggle (mobile) ──────────────────────────────────────────────────

const initSidebarToggle = () => {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('topic-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const mobileClose = document.getElementById('sidebar-mobile-close');
  if (!toggle || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('sidebar-open');
    sidebar.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    overlay?.classList.remove('overlay-visible');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('sidebar-open');
    sidebar.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    overlay?.classList.toggle('overlay-visible', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileClose?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
};

// ─── Prism.js ─────────────────────────────────────────────────────────────────

const loadPrism = () => {
  if (!document.querySelector('link[href*="prism-tomorrow"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);
  }

  if (!window.Prism && !document.querySelector('script[src*="prism-core"]')) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js';
    script.onload = () => {
      const autoloader = document.createElement('script');
      autoloader.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js';
      document.head.appendChild(autoloader);
    };
    document.head.appendChild(script);
  }
};

// ─── Seamless In-Page Navigation Router ───────────────────────────────────────

const navigateToTopic = async (targetUrl, updateHistory = true) => {
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      window.location.href = targetUrl;
      return;
    }
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const newContent = doc.getElementById('topic-content');
    if (!newContent) {
      window.location.href = targetUrl;
      return;
    }

    // Parse target topic ID with full URI decoding and canonical matching
    const normalizedUrl = targetUrl.replace(/\\/g, '/');
    const match = normalizedUrl.match(/\/topics\/(.+?)(?:\.html)?(?:[?#].*)?$/);
    const extracted = match ? match[1] : '';
    let decoded = extracted;
    try {
      decoded = decodeURIComponent(extracted);
    } catch { }

    const directMatch = topics.find(t => t.id === decoded || t.file === `${decoded}.html`);
    const rawMatch = topics.find(t => t.id === extracted || t.file === `${extracted}.html`);
    const newTopic = directMatch || rawMatch || null;
    const newTopicId = newTopic ? newTopic.id : decoded;

    // Update history & title
    if (updateHistory) {
      history.pushState({ topicId: newTopicId, url: targetUrl }, '', targetUrl);
    }
    if (newTopic) {
      document.title = `${newTopic.title} — Java Learn`;
    }

    currentId = newTopicId;
    currentTopic = newTopic;

    // Mark visited & update state
    if (newTopicId) {
      markVisited(newTopicId);
    }

    // Fast, smooth swap of article content
    const currentContent = document.getElementById('topic-content');
    if (currentContent) {
      currentContent.classList.add('topic-content-switching');
      setTimeout(() => {
        currentContent.innerHTML = newContent.innerHTML;
        currentContent.classList.remove('topic-content-switching');
        if (window.Prism) {
          window.Prism.highlightAllUnder(currentContent);
        }
        initCodeCopyButtons(currentContent);
        makeTablesResponsive(currentContent);
      }, 100);
    }

    // Scroll reading pane to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Close mobile drawer if open
    const sidebar = document.getElementById('topic-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');
    sidebar?.classList.remove('sidebar-open');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('overlay-visible');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Recompute pathway state and rebuild sidebar if pathway changed
    const prevPathway = activePathway;
    recomputePathwayState();

    if (activePathway !== prevPathway) {
      rebuildSidebarCategories();
      updatePathwayTabsState();
    } else {
      updateSidebarActiveState(newTopicId);
    }

    // Update controls
    updateBreadcrumbUI(newTopic);
    updateTableOfContentsUI();
    updateCompletionCardUI();
    updatePrevNextUI();
    updateProgressBarUI();
    updateReadingProgress();

    // Auto-scroll sidebar to keep active topic visible without resetting to top
    ensureActiveSidebarVisible(true);

  } catch (err) {
    console.warn('Seamless navigation fallback to full reload:', err);
    window.location.href = targetUrl;
  }
};

const initSeamlessNavigation = () => {
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    // Do not intercept modified or special clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    // Intercept only topic-to-topic navigation
    if (url.pathname.includes('/topics/')) {
      e.preventDefault();
      navigateToTopic(url.href, true);
    }
  });

  window.addEventListener('popstate', () => {
    navigateToTopic(window.location.href, false);
  });
};

// ─── Layout Assembly ──────────────────────────────────────────────────────────

const assembleLayout = () => {
  let originalContent = document.getElementById('topic-content');
  if (!originalContent) {
    const existingMain = document.querySelector('main');
    if (existingMain) {
      existingMain.id = 'topic-content';
      originalContent = existingMain;
    }
  }
  if (!originalContent) return;

  const originalParent = originalContent.parentNode;
  const nextSibling = originalContent.nextSibling;
  const existingLayout = originalContent.closest('.topic-layout');

  const isChecklist = document.body.classList.contains('study-checklist-page');

  let breadcrumb, prevNext, footer, progressBar, tocBar, completeCard;
  if (!isChecklist) {
    breadcrumb = injectBreadcrumb();
    tocBar = buildTableOfContents();
    completeCard = injectCompletionCard();
    prevNext = injectPrevNext();
    footer = injectFooter();
    progressBar = injectProgressBar();
    injectReadingProgressBar();
    injectBackToTop();
  } else {
    completeCard = injectCompletionCard();
    progressBar = injectProgressBar();
    injectBackToTop();
  }

  const sidebar = injectSidebar();

  // Mobile drawer overlay attached directly to body
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Build grid wrapper (strictly 2 columns: sidebar and main)
  const wrapper = document.createElement('div');
  wrapper.className = 'topic-layout';
  wrapper.appendChild(sidebar);

  const main = document.createElement('div');
  main.className = 'topic-main';

  if (breadcrumb) main.appendChild(breadcrumb);
  if (tocBar) main.appendChild(tocBar);

  const article = document.createElement('article');
  article.className = 'topic-article';
  article.appendChild(originalContent);

  // Inject Quiz button if applicable
  if (currentId && hasQuizForTopic(currentId) && !isChecklist) {
    const quizBtn = document.createElement('button');
    quizBtn.className = 'btn-launch-quiz';
    quizBtn.innerHTML = '<span class="quiz-icon">📝</span> Test Your Knowledge';
    quizBtn.addEventListener('click', () => openQuiz(currentId));
    article.appendChild(quizBtn);
  }

  main.appendChild(article);
  if (completeCard) main.appendChild(completeCard);
  if (prevNext) main.appendChild(prevNext);

  wrapper.appendChild(main);

  if (existingLayout) {
    existingLayout.parentNode.replaceChild(wrapper, existingLayout);
  } else {
    originalParent.insertBefore(wrapper, nextSibling);
  }

  if (footer) document.body.appendChild(footer);
  if (progressBar) document.body.appendChild(progressBar);

  if (!isChecklist) {
    document.body.style.paddingBottom = '40px';
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── Init ─────────────────────────────────────────────────────────────────────

const init = () => {
  // Mark topic as visited FIRST so UI reflects it immediately
  if (currentId) markVisited(currentId);

  const theme = getSavedTheme();
  applyTheme(theme);

  if (!document.body.classList.contains('study-checklist-page')) {
    injectHeader();
  }
  assembleLayout();
  makeTablesResponsive(document);

  if (!document.querySelector('.topic-sticky-progress')) {
    const progressBar = injectProgressBar();
    if (progressBar) document.body.appendChild(progressBar);
  }

  // Set page title from topic
  if (currentTopic) {
    document.title = `${currentTopic.title} — Java Learn`;
  }

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  // Search toggle
  document.getElementById('header-search-btn')?.addEventListener('click', openCommandPalette);

  initSidebarToggle();
  initSidebarFilter();
  initSidebarScroll();
  initReadingScrollListeners();
  initKeyboardNavigation();
  initCodeCopyButtons();
  loadPrism();
  initCommandPalette();
  initSeamlessNavigation();
};

document.addEventListener('DOMContentLoaded', init);
