/**
 * app.js — Homepage logic
 * Renders: dashboard overview, category sidebar, topic cards, search, progress bar, theme toggle, pathways nav
 */

import {
  getTopics,
  getVisited,
  getSavedTheme,
  saveTheme,
  getSearchParam,
  setSearchParam,
  getActivePathway,
  setActivePathway,
  getTopicsByPathway,
  getCategoriesByPathway,
  getTopicsByCategoryAndPathway,
  calcProgress,
  getStreakHistory,
  calcStreakDays,
  getGlobalProgress,
  getRecommendation,
  getPlannerTasks,
  addPlannerTask,
  togglePlannerTask,
  deletePlannerTask,
  getConfidenceRatings,
  setInMemoryState,
  clearInMemoryState
} from './utils.js';
import { listenToAuthChanges, loginWithGoogle, logout, getUserData } from './firebase-service.js';
import { profileComponent } from './components/ProfileComponent.js';
import { PATHWAYS } from './topics.config.js';
import { initCommandPalette, openCommandPalette } from './command-palette.js';

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
    // Sync circular progress track colors on theme switch
    if (getActivePathway() === 'dashboard') {
      renderDashboard();
    }
  });
};

// ─── Pathways Navigation ──────────────────────────────────────────────────────

const initPathwayTabs = () => {
  const nav = document.getElementById('pathway-nav');
  if (!nav) return;

  // Restore pathway from URL first (for redirects from topic pages), then localStorage
  const urlPathway = getSearchParam('pathway');
  if (urlPathway && (PATHWAYS[urlPathway] || urlPathway === 'dashboard')) {
    setActivePathway(urlPathway);
    setSearchParam('pathway', ''); // Clean URL
  }

  const activePathway = getActivePathway();
  updatePathwayTabsUI(activePathway);
  updateHero(activePathway);

  nav.addEventListener('click', (e) => {
    const tab = e.target.closest('.pathway-tab');
    if (!tab) return;

    const pathwayId = tab.getAttribute('data-pathway');
    if (!pathwayId || (!PATHWAYS[pathwayId] && pathwayId !== 'dashboard')) return;

    setActivePathway(pathwayId);
    updatePathwayTabsUI(pathwayId);
    updateHero(pathwayId);
    renderSidebar();
    renderProgress();
    renderCards(getSearchParam('search'));
  });
};

const updatePathwayTabsUI = (activePathway) => {
  document.querySelectorAll('.pathway-tab').forEach((tab) => {
    const isSelected = tab.getAttribute('data-pathway') === activePathway;
    tab.classList.toggle('active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
  });
};

const updateHero = (activePathway) => {
  const title = document.querySelector('.hero-title');
  const subtitle = document.querySelector('.hero-subtitle');
  const eyebrow = document.querySelector('.hero-eyebrow');
  
  if (activePathway === 'dashboard') {
    if (eyebrow) eyebrow.innerHTML = `📊 Overall Learning Dashboard`;
    if (title) title.innerHTML = `Welcome to Your,<br><span class="accent-text">Personalized Learning Dashboard</span>`;
    if (subtitle) subtitle.textContent = `Launch custom pathways, log daily study streaks, calendar active learning days, and prioritize tasks.`;
    return;
  }
  
  const pathway = PATHWAYS[activePathway];
  if (!pathway) return;

  if (eyebrow) eyebrow.innerHTML = `${pathway.icon} ${pathway.title} Learning Platform`;
  if (title) title.innerHTML = `Master ${pathway.title},<br><span class="accent-text">One Topic at a Time</span>`;
  if (subtitle) subtitle.textContent = pathway.description;
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const renderProgress = () => {
  const activePathway = getActivePathway();
  const container = document.getElementById('progress-container');
  if (!container) return;

  if (activePathway === 'dashboard') {
    container.style.display = 'none';
    return;
  } else {
    container.style.display = 'flex';
  }

  const { visited, total, percent } = calcProgress();
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

  const activePathway = getActivePathway();
  
  if (activePathway === 'dashboard') {
    const html = `
      <div class="sidebar-header">
        <span class="sidebar-logo">📊</span>
        <span class="sidebar-title">Dashboard</span>
      </div>
      <nav class="sidebar-nav" aria-label="Dashboard navigation">
        <ul class="sidebar-category-list">
          <li>
            <button class="sidebar-category-link active" onclick="document.getElementById('tab-dashboard').click()" style="width: 100%; border: none; text-align: left; background: none; font-weight: inherit; color: inherit; display: flex; align-items: center; gap: var(--space-3); cursor: pointer;">
              <span class="sidebar-dot"></span>Overview Dashboard
            </button>
          </li>
          ${Object.entries(PATHWAYS).map(([id, pw]) => `
            <li>
              <button class="sidebar-category-link" onclick="document.getElementById('tab-${id}').click()" style="width: 100%; border: none; text-align: left; background: none; font-weight: inherit; color: inherit; display: flex; align-items: center; gap: var(--space-3); cursor: pointer;">
                <span class="sidebar-dot" style="background: var(--accent);"></span>${pw.title} Pathway
              </button>
            </li>
          `).join('')}
        </ul>
      </nav>
    `;
    sidebar.innerHTML = html;
    return;
  }

  const categories = getCategoriesByPathway(activePathway);
  const pathwayInfo = PATHWAYS[activePathway] || { icon: '☕', title: activePathway };
  const html = `
    <div class="sidebar-header">
      <span class="sidebar-logo">${pathwayInfo.icon || '☕'}</span>
      <span class="sidebar-title">${pathwayInfo.title || 'Java'} Pathway</span>
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

// ─── Master Study Dashboard Overview ──────────────────────────────────────────

const renderDashboard = () => {
  const container = document.getElementById('topics-grid');
  if (!container) return;

  const { visited, total, percent } = calcProgress('dashboard');
  const streak = calcStreakDays();
  const recommended = getRecommendation();
  const plannerTasks = getPlannerTasks();

  // Streak Encouragement Message
  let streakMsg = "Start learning to build a streak!";
  if (streak > 0) {
    if (streak < 3) streakMsg = "Great start! Keep study habits active.";
    else if (streak < 7) streakMsg = "Awesome streak! You are building solid momentum.";
    else streakMsg = "Unstoppable! Staff engineer dedication.";
  }

  // Recommended next topic card
  let recommendedHtml = "";
  if (recommended) {
    recommendedHtml = `
      <div class="dashboard-recommendation-card">
        <div class="rec-icon-box">${recommended.icon}</div>
        <div class="rec-info-box">
          <div class="rec-tag">${recommended.category}</div>
          <h4 class="rec-title">${recommended.title}</h4>
          <p class="rec-desc">${recommended.description || 'Dive into this session next.'}</p>
        </div>
        <a href="topics/${recommended.file}" class="rec-launch-btn">Resume Study →</a>
      </div>
    `;
  } else {
    recommendedHtml = `
      <div class="dashboard-recommendation-card completed">
        <div class="rec-icon-box">🏆</div>
        <div class="rec-info-box">
          <div class="rec-tag">All Complete</div>
          <h4 class="rec-title">Mastery Level Achieved!</h4>
          <p class="rec-desc">You've successfully completed all active pathway sessions.</p>
        </div>
      </div>
    `;
  }

  // Pathways Selection grid launcher
  const pathwayLaunchersHtml = Object.entries(PATHWAYS).map(([id, pw]) => {
    const topics = getTopics().filter(t => pw.categories.includes(t.category));
    const visitedSet = getVisited();
    const completed = topics.filter(t => visitedSet.has(t.id)).length;
    const pathPercent = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;

    return `
      <div class="pathway-launcher-card" data-pathway="${id}" onclick="document.getElementById('tab-${id}').click()">
        <div class="launcher-top">
          <span class="launcher-icon-circle">${pw.icon}</span>
          <h4 class="launcher-title">${pw.title}</h4>
        </div>
        <p class="launcher-desc">${pw.description}</p>
        <div class="launcher-footer">
          <div class="launcher-progress-info">
            <span>${pathPercent}% Complete</span>
            <span>${completed}/${topics.length} Sessions</span>
          </div>
          <div class="launcher-progress-bar-track">
            <div class="launcher-progress-bar-fill" style="width: ${pathPercent}%"></div>
          </div>
          <span class="launcher-action-btn">Launch Path →</span>
        </div>
      </div>
    `;
  }).join('');

  // Interactive Monthly Activity Calendar
  const calendarHtml = generateCalendarMarkup();

  // Study Planner Todo list items
  const todoItemsHtml = plannerTasks.map(task => `
    <li class="planner-todo-item ${task.done ? 'done' : ''}">
      <label class="todo-checkbox-container">
        <input type="checkbox" ${task.done ? 'checked' : ''} onclick="window.toggleTodo(${task.id}); event.stopPropagation();">
        <span class="todo-custom-checkbox"></span>
      </label>
      <span class="todo-text">${task.text}</span>
      <button class="todo-delete-btn" onclick="window.deleteTodo(${task.id}); event.stopPropagation();" aria-label="Delete task">✕</button>
    </li>
  `).join('');

  const todoListHtml = plannerTasks.length > 0 
    ? `<ul class="planner-todo-list">${todoItemsHtml}</ul>`
    : `
      <div class="planner-todo-empty">
        <span class="todo-empty-icon">📝</span>
        <p>Your Study Planner is empty. Add a task above!</p>
      </div>
    `;

  container.innerHTML = `
    <div class="dashboard-container">
      <!-- Section 1: Dashboard Stats Grid -->
      <div class="dashboard-stats-grid">
        <!-- Radial overall progress -->
        <div class="dashboard-stat-card radial-progress-card">
          <h4 class="stat-card-title">Overall Progress</h4>
          <div class="radial-progress-inner">
            <svg class="radial-svg" viewBox="0 0 100 100">
              <circle class="radial-track" cx="50" cy="50" r="40"></circle>
              <circle class="radial-fill" cx="50" cy="50" r="40" style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (251.2 * percent) / 100}"></circle>
            </svg>
            <div class="radial-percentage">${percent}%</div>
          </div>
          <div class="radial-meta">${visited} of ${total} sessions completed</div>
        </div>

        <!-- Daily streak status -->
        <div class="dashboard-stat-card streak-card">
          <h4 class="stat-card-title">Study Streak</h4>
          <div class="streak-days-wrap">
            <span class="streak-number">${streak}</span>
            <span class="streak-days-label">Days</span>
          </div>
          <p class="streak-encourage">${streakMsg}</p>
        </div>

        <!-- Smart next study recommend -->
        <div class="dashboard-stat-card recommendation-card">
          <h4 class="stat-card-title">Recommended Next Step</h4>
          ${recommendedHtml}
        </div>
      </div>

      <!-- Section 2: Pathway Quick Launchers -->
      <h3 class="dashboard-section-title">Select a Pathway to Launch</h3>
      <div class="pathways-launcher-grid">
        ${pathwayLaunchersHtml}
      </div>

      <!-- Section 3: Interactive Learning Tools (Calendar & TODO Planner) -->
      <div class="dashboard-tools-layout">
        <!-- activity calendar -->
        <div class="dashboard-tool-card calendar-card">
          <h3 class="tool-card-title">📅 Study Activity Calendar</h3>
          <div class="monthly-calendar-wrap">
            ${calendarHtml}
          </div>
          <div class="calendar-legend">
            <span class="legend-indicator studied"></span> Studied
            <span class="legend-indicator today"></span> Today
          </div>
        </div>

        <!-- planner todo -->
        <div class="dashboard-tool-card planner-card">
          <h3 class="tool-card-title">📋 Interactive Study Planner</h3>
          <div class="planner-todo-input-group">
            <input type="text" id="todo-input" placeholder="Plan a custom task (e.g. Master AWS IAM Policies)..." autocomplete="off">
            <button id="todo-add-btn">Add Task</button>
          </div>
          <div class="planner-todo-list-wrap">
            ${todoListHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up the add task input triggers
  setupTodoInputListeners();
};

const generateCalendarMarkup = () => {
  const studyDates = getStreakHistory();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalMonthDays = new Date(year, month + 1, 0).getDate();
  
  const local = new Date();
  const offset = local.getTimezoneOffset();
  const localDate = new Date(local.getTime() - offset * 60 * 1000);
  const todayStr = localDate.toISOString().split('T')[0];
  
  const cells = [];
  
  // padding empty boxes
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push('<div class="calendar-cell empty"></div>');
  }
  
  // actual days
  for (let day = 1; day <= totalMonthDays; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const hasStudied = studyDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    
    let cellClass = 'calendar-cell day-cell';
    if (hasStudied) cellClass += ' studied';
    if (isToday) cellClass += ' today';
    
    cells.push(`
      <div class="${cellClass}" title="${dateStr}">
        <span class="cell-day-num">${day}</span>
      </div>
    `);
  }
  
  return `
    <div class="calendar-header-title">${monthNames[month]} ${year}</div>
    <div class="calendar-grid">
      ${dayNames.map(d => `<div class="calendar-day-label">${d}</div>`).join('')}
      ${cells.join('')}
    </div>
  `;
};

const setupTodoInputListeners = () => {
  const input = document.getElementById('todo-input');
  const btn = document.getElementById('todo-add-btn');
  if (!input || !btn) return;

  const handleAdd = () => {
    const text = input.value.trim();
    if (text) {
      addPlannerTask(text);
      renderDashboard();
    }
  };

  btn.addEventListener('click', handleAdd);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });
};

// Expose Todo actions globally on window object for dynamic string inline events
window.toggleTodo = (taskId) => {
  togglePlannerTask(taskId);
  renderDashboard();
};

window.deleteTodo = (taskId) => {
  deletePlannerTask(taskId);
  renderDashboard();
};

// ─── Study Plan Roadmap Grid ──────────────────────────────────────────────────

const renderStudyPlanRoadmap = () => {
  const visited = getVisited();
  const topics = getTopics().filter(t => t.category.includes('Weeks'));
  
  const totalDays = 60;
  const dots = [];
  const confidenceRatings = getConfidenceRatings();

  for (let d = 1; d <= totalDays; d++) {
    const dayId = `checklists/day${d}`;
    const topic = topics.find(t => t.id === dayId);
    
    let dotClass = 'roadmap-dot';
    let title = `Day ${d}: Unlocked soon`;
    let ratingStars = '';
    
    if (topic) {
      const isDone = visited.has(dayId);
      dotClass += isDone ? ' done' : ' active';
      title = `Day ${d}: ${topic.title}`;
      
      const rating = confidenceRatings[dayId];
      if (rating) {
        ratingStars = ` (${'★'.repeat(rating)}${'☆'.repeat(5 - rating)})`;
      }
    } else {
      dotClass += ' locked';
    }
    
    const onClickAttr = topic ? `onclick="window.location.href='topics/${topic.file}'"` : '';
    
    dots.push(`
      <div class="${dotClass}" title="${title}${ratingStars}" ${onClickAttr} role="button" aria-label="${title}${ratingStars}">
        <span class="dot-num">${d}</span>
      </div>
    `);
  }
  
  const completedCount = topics.filter(t => visited.has(t.id)).length;
  const totalRegistered = topics.length;
  const completionPercent = totalRegistered > 0 ? Math.round((completedCount / totalRegistered) * 100) : 0;

  return `
    <div class="studyplan-roadmap-container">
      <div class="roadmap-header">
        <div class="roadmap-title-wrap">
          <span class="roadmap-icon">📅</span>
          <div>
            <h3 class="roadmap-main-title">60-Day Study Plan Roadmap</h3>
            <p class="roadmap-subtitle">Track your senior developer journey day-by-day. Active and completed days are highlighted.</p>
          </div>
        </div>
        <div class="roadmap-stats">
          <div class="roadmap-stat-item">
            <span class="roadmap-stat-val">${completedCount} / 60</span>
            <span class="roadmap-stat-label">Days Complete</span>
          </div>
          <div class="roadmap-stat-item">
            <span class="roadmap-stat-val">${completionPercent}%</span>
            <span class="roadmap-stat-label">Progress</span>
          </div>
        </div>
      </div>
      <div class="roadmap-grid-wrapper">
        <div class="roadmap-grid">
          ${dots.join('')}
        </div>
      </div>
    </div>
  `;
};

// ─── Notes Dashboard View ─────────────────────────────────────────────────────

const renderNotesView = (container) => {
  let html = `<div class="notes-dashboard-container" style="padding-top: var(--space-4);">`;
  html += `<div class="cards-grid notes-grid">`;

  let hasNotes = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('java-learn-notes-')) {
      const text = localStorage.getItem(key);
      if (text && text.trim()) {
        hasNotes = true;
        const dayId = key.replace('java-learn-notes-', '');
        const topic = getTopics().find(t => t.id === dayId);
        const title = topic ? topic.title : dayId;
        const file = topic ? topic.file : dayId + '.html';

        const escapedText = text.replace(/[&<>'"]/g, tag => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));

        html += `
          <div class="topic-card" onclick="window.location.href='topics/${file}'" style="cursor: pointer;">
            <div class="card-icon" aria-hidden="true">📝</div>
            <div class="card-body">
              <h3 class="card-title">${title}</h3>
              <p class="card-desc" style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 0.85rem; margin-top: var(--space-2); opacity: 0.9; max-height: 150px; overflow: hidden; text-overflow: ellipsis;">${escapedText}</p>
            </div>
            <div class="card-footer">
              <span class="card-arrow">Go to Notes →</span>
            </div>
          </div>
        `;
      }
    }
  }

  if (!hasNotes) {
    html += `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-icon">📝</span>
        <p>You haven't written any notes yet.</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Open any topic and click the Notes button in the bottom left to start jotting things down.</p>
      </div>
    `;
  }

  html += `</div></div>`;
  container.innerHTML = html;

  // Animate cards in
  requestAnimationFrame(() => {
    container.querySelectorAll('.topic-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 30}ms`;
      card.classList.add('card-animate-in');
    });
  });
};

// ─── Topic Cards ──────────────────────────────────────────────────────────────

const renderCards = (filterText = '') => {
  const container = document.getElementById('topics-grid');
  if (!container) return;

  const activePathway = getActivePathway();
  
  if (activePathway === 'dashboard') {
    renderDashboard();
    return;
  }

  if (activePathway === 'notes') {
    renderNotesView(container);
    return;
  }

  if (activePathway === 'profile') {
    profileComponent.render(container);
    return;
  }

  const visited = getVisited();
  const byCategory = getTopicsByCategoryAndPathway(activePathway);
  const query = filterText.toLowerCase().trim();

  let html = '';
  
  if (activePathway === 'studyplan') {
    html += renderStudyPlanRoadmap();
  }
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

const renderCard = (topic, isVisited, index) => {
  if (topic.isLocked) {
    return `
      <div class="topic-card card-locked" id="card-${topic.id}">
        <div class="card-icon" aria-hidden="true">${topic.icon}</div>
        <div class="card-body">
          <h3 class="card-title">${topic.title}</h3>
          <p class="card-desc">${topic.description}</p>
        </div>
        <span class="card-badge-locked">Roadmap</span>
      </div>
    `;
  }
  return `
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
};

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

// ─── Authentication ─────────────────────────────────────────────────────────────

const initAuthUI = () => {
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      const authText = document.getElementById('auth-text');
      if (authText.textContent === 'Login') {
        authText.textContent = '...';
        try {
          await loginWithGoogle();
        } catch (e) {
          authText.textContent = 'Login';
        }
      } else {
        authText.textContent = '...';
        try {
          await logout();
        } catch (e) {
          authText.textContent = 'Logout';
        }
      }
    });
  }
};

const updateAuthUI = (user) => {
  const authText = document.getElementById('auth-text');
  if (authText) {
    authText.textContent = user ? 'Logout' : 'Login';
  }
};

// ─── Init ─────────────────────────────────────────────────────────────────────

let appInitialized = false;

const init = () => {
  initTheme();
  initAuthUI();

  listenToAuthChanges(async (user) => {
    if (user) {
      const data = await getUserData();
      setInMemoryState(data);
      updateAuthUI(user);
    } else {
      clearInMemoryState();
      updateAuthUI(null);
    }
    
    // Only init DOM listeners once
    if (!appInitialized) {
      appInitialized = true;
      initPathwayTabs();
      initSearch();
      initCommandPalette();
      document.getElementById('header-search-btn')?.addEventListener('click', openCommandPalette);
      
      window.addEventListener('storage', () => {
        renderProgress();
        renderCards(getSearchParam('search'));
      });
    }

    // Always re-render on auth change
    renderSidebar();
    renderProgress();
    renderCards(getSearchParam('search'));
  });
};

document.addEventListener('DOMContentLoaded', init);
