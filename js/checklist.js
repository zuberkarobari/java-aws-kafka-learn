/**
 * checklist.js — Javascript controller for interactive study checklists
 * Handles: sub-task checking, stopwatch timer, interview accordion reveal, self-assessment stars, state persistence
 */

import { 
  markVisited, 
  getConfidenceRatings, 
  saveConfidenceRating, 
  getCheckedItems, 
  saveCheckedItems,
  getSavedTheme,
  saveTheme
} from './utils.js';

// Initialize theme immediately to prevent Flash of Unstyled Content (FOUC)
const theme = getSavedTheme();
document.documentElement.setAttribute('data-theme', theme);

// Get current day ID from path (e.g. 'checklists/day1')
const getDayIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/\/topics\/(checklists\/day\d+)(?:\.html)?$/);
  return match ? match[1] : 'checklists/day1';
};

const dayId = getDayIdFromUrl();

// ─── Document Interactivity Setup ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initChecklist();
  initStopwatch();
  initSelfAssessment();
  initInterviewAccordions();
  initGlobalQuickActions();
  
  window.switchTab = (event, tabId) => {
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    document.querySelectorAll('.nb').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-topic-link').forEach(link => {
      link.classList.remove('sidebar-topic-active');
    });
    
    document.getElementById(tabId).style.display = 'block';
    
    if (event.currentTarget.classList.contains('nb')) {
      event.currentTarget.classList.add('active');
      if (tabId === 'tab-morning') document.querySelectorAll('.sidebar-topic-link')[0].classList.add('sidebar-topic-active');
      if (tabId === 'tab-topics') document.querySelectorAll('.sidebar-topic-link')[1].classList.add('sidebar-topic-active');
      if (tabId === 'tab-mock') document.querySelectorAll('.sidebar-topic-link')[2].classList.add('sidebar-topic-active');
    } else if (event.currentTarget.classList.contains('sidebar-topic-link')) {
      event.currentTarget.classList.add('sidebar-topic-active');
      if (tabId === 'tab-morning') document.querySelectorAll('.nb')[0].classList.add('active');
      if (tabId === 'tab-topics') document.querySelectorAll('.nb')[1].classList.add('active');
      if (tabId === 'tab-mock') document.querySelectorAll('.nb')[2].classList.add('active');
    }
    
    event.preventDefault();
  };

  window.toggleAccordion = (element) => {
    const container = element.parentElement;
    const qans = container.querySelector('.qans');
    if (container.classList.contains('open')) {
      container.classList.remove('open');
      if (qans) qans.style.display = 'none';
    } else {
      container.classList.add('open');
      if (qans) {
        qans.style.display = 'block';
        qans.style.animation = 'fadeIn 0.25s ease-out forwards';
      }
    }
  };
});

// ─── Theme Toggle Injection ────────────────────────────────────────────────

const initThemeToggle = () => {
  const pw = document.querySelector('.pw');
  if (!pw) return;

  const headerContainer = pw.parentElement;
  if (!headerContainer) return;

  // Create a wrapper for progress and theme toggle
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-left: auto;
  `;

  // Move pw inside wrapper
  headerContainer.insertBefore(wrapper, pw);
  wrapper.appendChild(pw);

  // Create theme toggle button
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.className = 'theme-toggle';
  btn.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--dur-fast) var(--ease-out);
    cursor: pointer;
    outline: none;
  `;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.innerHTML = `<span id="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>`;
  btn.setAttribute('aria-label', 'Toggle theme');

  wrapper.appendChild(btn);

  // Sync style hover actions
  btn.addEventListener('mouseenter', () => {
    btn.style.borderColor = 'var(--accent)';
    btn.style.background = 'var(--accent-dim)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.borderColor = 'var(--border)';
    btn.style.background = 'var(--bg-elevated)';
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    saveTheme(next);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  });
};

// ─── Checklist Mechanics ───────────────────────────────────────────────────

const initChecklist = () => {
  const listItems = document.querySelectorAll('ul.study-checklist li');
  if (listItems.length === 0) return;

  const checkedSet = getCheckedItems();
  
  // Initialize state from LocalStorage
  listItems.forEach((li, idx) => {
    const itemId = `${dayId}-item-${idx}`;
    li.setAttribute('data-item-id', itemId);
    
    // Create custom checkbox UI element inside li if it doesn't exist
    if (!li.querySelector('.checklist-icon-checkbox')) {
      const checkbox = document.createElement('div');
      checkbox.className = 'checklist-icon-checkbox';
      li.insertBefore(checkbox, li.firstChild);
    }

    const isChecked = checkedSet.has(itemId);
    if (isChecked) {
      li.classList.add('item-checked');
      const input = li.querySelector('input[type="checkbox"]');
      if (input) input.checked = true;
    }

    // Bind click listener on li for tactile checking experience
    li.addEventListener('click', (e) => {
      // Toggle
      const currentlyChecked = checkedSet.has(itemId);
      if (currentlyChecked) {
        checkedSet.delete(itemId);
        li.classList.remove('item-checked');
        const input = li.querySelector('input[type="checkbox"]');
        if (input) input.checked = false;
      } else {
        checkedSet.add(itemId);
        li.classList.add('item-checked');
        const input = li.querySelector('input[type="checkbox"]');
        if (input) input.checked = true;
      }
      
      saveCheckedItems(checkedSet);
      updateChecklistProgress();
    });
  });

  updateChecklistProgress();
};

const updateChecklistProgress = () => {
  const listItems = document.querySelectorAll('ul.study-checklist li');
  if (listItems.length === 0) return;

  const checkedSet = getCheckedItems();
  const dayItems = Array.from(listItems).map(li => li.getAttribute('data-item-id'));
  const checkedDayItems = dayItems.filter(itemId => checkedSet.has(itemId)).length;
  
  const percent = Math.round((checkedDayItems / dayItems.length) * 100);

  // Update dynamic topic page progress indicator if there is one
  const ptBar = document.querySelector('.pt-fill') || document.querySelector('.pf');
  const ptLabel = document.querySelector('.pt-label') || document.querySelector('.pl');
  
  if (ptBar) ptBar.style.width = `${percent}%`;
  if (ptLabel) ptLabel.textContent = `${percent}% Completed`;

  // Autolog visited when day is 100% complete
  if (percent === 100) {
    markVisited(dayId);
    showCompletionToast();
  }
};

const showCompletionToast = () => {
  // Check if toast already exists
  if (document.getElementById('completion-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'completion-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #15803d;
    color: white;
    padding: var(--space-4) var(--space-5);
    border-radius: var(--radius-md);
    box-shadow: 0 10px 25px rgba(22, 163, 74, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;
  
  toast.innerHTML = `
    <span style="font-size: 1.25rem;">🏆</span>
    <div>
      <h5 style="margin: 0; font-weight: 700; font-size: 0.9rem;">Day Completed!</h5>
      <p style="margin: 2px 0 0; font-size: 0.75rem; opacity: 0.9;">Great job! Day progress synced to dashboard.</p>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// ─── Stopwatch Timer Mechanics ─────────────────────────────────────────────

let timerInterval = null;
let elapsedSeconds = 0;
let isTimerRunning = false;

const initStopwatch = () => {
  // Inject timer widget UI if not hardcoded
  if (!document.querySelector('.timer-widget')) {
    const header = document.querySelector('.breadcrumb-nav') || document.querySelector('h1');
    if (!header) return;

    const timer = document.createElement('div');
    timer.className = 'timer-widget';
    timer.innerHTML = `
      <span class="timer-icon">⏱️</span>
      <div class="timer-display-wrap">
        <span class="timer-time" id="stopwatch-display">00:00:00</span>
        <span class="timer-label">Study Time</span>
      </div>
      <button class="timer-btn" id="stopwatch-toggle" title="Start/Pause">▶</button>
      <button class="timer-btn" id="stopwatch-reset" title="Reset">⟲</button>
    `;
    document.body.appendChild(timer);
  }

  const toggleBtn = document.getElementById('stopwatch-toggle');
  const resetBtn = document.getElementById('stopwatch-reset');
  if (!toggleBtn || !resetBtn) return;

  // Restore state
  elapsedSeconds = parseInt(localStorage.getItem(`java-learn-timer-elapsed-${dayId}`)) || 0;
  isTimerRunning = localStorage.getItem(`java-learn-timer-running-${dayId}`) === 'true';

  updateStopwatchDisplay();

  if (isTimerRunning) {
    startTimer();
    toggleBtn.textContent = '⏸';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isTimerRunning) {
      pauseTimer();
      toggleBtn.textContent = '▶';
    } else {
      startTimer();
      toggleBtn.textContent = '⏸';
    }
  });

  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetTimer();
    toggleBtn.textContent = '▶';
  });
};

const startTimer = () => {
  isTimerRunning = true;
  localStorage.setItem(`java-learn-timer-running-${dayId}`, 'true');
  
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    localStorage.setItem(`java-learn-timer-elapsed-${dayId}`, elapsedSeconds);
    updateStopwatchDisplay();
  }, 1000);
};

const pauseTimer = () => {
  isTimerRunning = false;
  localStorage.setItem(`java-learn-timer-running-${dayId}`, 'false');
  clearInterval(timerInterval);
};

const resetTimer = () => {
  pauseTimer();
  elapsedSeconds = 0;
  localStorage.setItem(`java-learn-timer-elapsed-${dayId}`, '0');
  updateStopwatchDisplay();
};

const updateStopwatchDisplay = () => {
  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');
  const formatted = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  
  const display = document.getElementById('stopwatch-display');
  if (display) display.textContent = formatted;
};

// ─── Self-Assessment Matrix (Stars) ──────────────────────────────────────────

const initSelfAssessment = () => {
  const starsContainer = document.querySelector('.star-rating-widget');
  if (!starsContainer) return;

  // If stars are not loaded yet, inject 5 stars
  if (starsContainer.children.length === 0) {
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.setAttribute('data-star-val', i);
      star.innerHTML = '★';
      starsContainer.appendChild(star);
    }
  }

  const stars = starsContainer.querySelectorAll('.star');
  const ratings = getConfidenceRatings();
  const currentRating = ratings[dayId] || 0;

  const highlightStars = (rating) => {
    stars.forEach(star => {
      const val = parseInt(star.getAttribute('data-star-val'));
      star.classList.toggle('active', val <= rating);
    });
  };

  highlightStars(currentRating);

  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      const val = parseInt(star.getAttribute('data-star-val'));
      saveConfidenceRating(dayId, val);
      highlightStars(val);
      
      // Flash indicator
      starsContainer.style.transform = 'scale(1.05)';
      setTimeout(() => starsContainer.style.transform = 'scale(1)', 150);
    });

    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.getAttribute('data-star-val'));
      highlightStars(val);
    });
  });

  starsContainer.addEventListener('mouseleave', () => {
    const freshRatings = getConfidenceRatings();
    highlightStars(freshRatings[dayId] || 0);
  });
};

// ─── Interview Reveal Accordions ───────────────────────────────────────────

const initInterviewAccordions = () => {
  const cards = document.querySelectorAll('.interview-card');
  
  cards.forEach(card => {
    const header = card.querySelector('.interview-question-header');
    const panel = card.querySelector('.interview-answer-panel');
    if (!header || !panel) return;

    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      
      if (isOpen) {
        card.classList.remove('open');
        panel.style.display = 'none';
      } else {
        card.classList.add('open');
        panel.style.display = 'block';
        
        // Add subtle focus animation
        panel.style.animation = 'fadeIn 0.25s ease-out forwards';
      }
    });
  });
};

// ─── Global Quick Actions (Search & Dashboard) ───────────────────────────

const initGlobalQuickActions = () => {
  const fab = document.createElement('div');
  fab.className = 'global-quick-actions';
  fab.innerHTML = `
    <button class="gqa-btn" id="gqa-search" title="Search Topics" aria-label="Search">
      <span class="gqa-icon">🔍</span>
    </button>
    <button class="gqa-btn" id="gqa-dashboard" title="Go to Dashboard" aria-label="Dashboard">
      <span class="gqa-icon">📊</span>
    </button>
  `;
  document.body.appendChild(fab);

  // Mobile sidebar toggle
  const sidebarToggle = document.createElement('button');
  sidebarToggle.className = 'mobile-sidebar-toggle';
  sidebarToggle.innerHTML = '☰';
  sidebarToggle.setAttribute('aria-label', 'Toggle Menu');
  document.body.appendChild(sidebarToggle);

  sidebarToggle.addEventListener('click', () => {
    const sidebar = document.querySelector('.topic-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      sidebarToggle.innerHTML = sidebar.classList.contains('open') ? '✕' : '☰';
    }
  });

  const dashBtn = document.getElementById('gqa-dashboard');
  if (dashBtn) {
    dashBtn.addEventListener('click', () => {
      window.location.href = '../../index.html?pathway=dashboard';
    });
  }

  const searchBtn = document.getElementById('gqa-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = prompt("Search for a Java/Spring topic:");
      if (query && query.trim()) {
        window.location.href = '../../index.html?search=' + encodeURIComponent(query.trim());
      }
    });
  }
};

