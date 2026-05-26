/**
 * app.js — Homepage logic
 * Renders: category sidebar, topic cards, search, progress bar, theme toggle
 */

import {
  getTopics,
  getCategories,
  getTopicsByCategory,
  getSearchParam,
  setSearchParam,
  getVisited,
  getSavedTheme,
  saveTheme,
  calcProgress,
} from './utils.js';

// ─── Theme ───────────────────────────────────────────────────────────────────

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
};

const initTheme = () => {
  const theme = getSavedTheme();
  applyTheme(theme);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const renderProgress = () => {
  const { visited, total, percent } = calcProgress();
  const container = document.getElementById('progress-container');
  if (!container) return;

  container.innerHTML = `
    <div class="progress-header">
      <span class="progress-label">Learning Progress</span>
      <span class="progress-count">${visited} / ${total} Topics Completed</span>
    </div>
    <div class="progress-bar-track" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar-fill" style="width: ${percent}%"></div>
    </div>
    <span class="progress-percent">${percent}%</span>
  `;
};

// ─── Category Sidebar ─────────────────────────────────────────────────────────

const renderSidebar = () => {
  const sidebar = document.getElementById('home-sidebar');
  if (!sidebar) return;

  const categories = getCategories();
  const html = `
    <div class="sidebar-header">
      <span class="sidebar-logo">☕</span>
      <span class="sidebar-title">Java Learn</span>
    </div>
    <nav class="sidebar-nav" aria-label="Category navigation">
      <ul class="sidebar-category-list">
        ${categories.map((cat) => `
          <li>
            <a href="#cat-${slugify(cat)}" class="sidebar-category-link">
              <span class="sidebar-dot"></span>${cat}
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
  sidebar.innerHTML = html;
};

// ─── Topic Cards ──────────────────────────────────────────────────────────────

const renderCards = (filterText = '') => {
  const container = document.getElementById('topics-grid');
  if (!container) return;

  const visited = getVisited();
  const byCategory = getTopicsByCategory();
  const query = filterText.toLowerCase().trim();

  let html = '';
  let totalVisible = 0;

  for (const [category, topics] of Object.entries(byCategory)) {
    const filtered = query
      ? topics.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query)
        )
      : topics;

    if (filtered.length === 0) continue;
    totalVisible += filtered.length;

    html += `
      <section class="category-section" id="cat-${slugify(category)}">
        <h2 class="category-title">${category}</h2>
        <div class="cards-grid">
          ${filtered.map((t, i) => renderCard(t, visited.has(t.id), i)).join('')}
        </div>
      </section>
    `;
  }

  if (totalVisible === 0) {
    html = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>No topics found for "<strong>${filterText}</strong>"</p>
        <button class="btn-clear-search" onclick="clearSearch()">Clear search</button>
      </div>
    `;
  }

  container.innerHTML = html;

  // Animate cards in
  requestAnimationFrame(() => {
    container.querySelectorAll('.topic-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 30}ms`;
      card.classList.add('card-animate-in');
    });
  });
};

const renderCard = (topic, isVisited, index) => `
  <a href="topics/${topic.file}" class="topic-card ${isVisited ? 'card-visited' : ''}" id="card-${topic.id}" aria-label="${topic.title}">
    <div class="card-icon" aria-hidden="true">${topic.icon}</div>
    <div class="card-body">
      <h3 class="card-title">${topic.title}</h3>
      <p class="card-desc">${topic.description}</p>
    </div>
    ${isVisited ? '<span class="card-badge card-badge-done" aria-label="Completed">✓</span>' : ''}
    <span class="card-arrow" aria-hidden="true">→</span>
  </a>
`;

// ─── Search ───────────────────────────────────────────────────────────────────

const initSearch = () => {
  const input = document.getElementById('search-input');
  if (!input) return;

  // Restore from URL
  const initial = getSearchParam('search');
  if (initial) {
    input.value = initial;
    renderCards(initial);
  } else {
    renderCards();
  }

  input.addEventListener('input', () => {
    const query = input.value;
    setSearchParam('search', query);
    renderCards(query);
  });

  // Keyboard shortcut: / to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });
};

// Exposed globally for the "Clear search" button in empty state
window.clearSearch = () => {
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  setSearchParam('search', '');
  renderCards();
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── Init ─────────────────────────────────────────────────────────────────────

const init = () => {
  initTheme();
  renderSidebar();
  renderProgress();
  initSearch();

  // Re-render on storage changes (e.g., visiting a topic in another tab)
  window.addEventListener('storage', () => {
    renderProgress();
    renderCards(getSearchParam('search'));
  });
};

document.addEventListener('DOMContentLoaded', init);
