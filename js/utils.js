/**
 * utils.js — Shared utility functions
 * Handles: filename parsing, localStorage, URL params, progress calculation
 */

import { TOPIC_ORDER, TOPIC_META, PATHWAYS } from './topics.config.js';

// ─── Firebase In-Memory State & Sync ─────────────────────────────────────────

export let inMemoryState = {
  visited: null,
  streakDates: null,
  plannerTasks: null,
  checklistConfidence: null,
  checklistItems: null,
  timers: null,
  notes: null
};

export const setInMemoryState = (data) => {
  inMemoryState = { ...inMemoryState, ...data };
};

export const clearInMemoryState = () => {
  inMemoryState = {
    visited: null,
    streakDates: null,
    plannerTasks: null,
    checklistConfidence: null,
    checklistItems: null,
    timers: null,
    notes: null
  };
};

// triggerSync is a no-op — Firebase removed, localStorage only
export const triggerSync = () => {};

export const clearAllLearningData = () => {
  if (!confirm("Are you sure you want to clear all your learning progress? This action cannot be undone.")) {
    return;
  }
  
  clearInMemoryState();
  
  const keysToRemove = [
    'java-learn-visited',
    'java-learn-streak-dates',
    'java-learn-planner-tasks',
    'java-learn-checklist-confidence',
    'java-learn-checklist-items'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('java-learn-timer-elapsed-') || 
        key.startsWith('java-learn-timer-running-') || 
        key.startsWith('java-learn-notes-')) {
      localStorage.removeItem(key);
    }
  });

  triggerSync();
  window.location.reload();
};

// ─── Path & Navigation Prefixes ──────────────────────────────────────────────

/**
 * Calculate dynamic relative prefix based on depth of the current page
 * E.g., on `/topics/collections.html` -> returns `../`
 * On `/topics/aws/aws_day1_full_session.html` -> returns `../../`
 * On homepage `/index.html` -> returns ``
 * @returns {string}
 */
export const getPathPrefix = () => {
  const path = window.location.pathname;
  const topicsIndex = path.indexOf('/topics/');
  if (topicsIndex === -1) return '';
  const subPath = path.substring(topicsIndex + 8); // e.g., 'aws/aws_day1.html' or 'collections.html'
  const slashCount = (subPath.match(/\//g) || []).length;
  return '../'.repeat(slashCount + 1);
};

// ─── Filename Utilities ─────────────────────────────────────────────────────

/**
 * Convert a kebab-case id to a Title Case string
 * 'streams-api' → 'Streams API'
 * @param {string} id
 * @returns {string}
 */
export const fileToTitle = (id) => {
  const baseId = id.replace(/^.*\//, ''); // Strip folders if nested
  return baseId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Strip .html extension and directory prefix from a path
 * 'streams-api.html' → 'streams-api'
 * @param {string} filename
 * @returns {string}
 */
export const fileToId = (filename) =>
  filename.replace(/\.html$/, '').replace(/^.*\//, '');

/**
 * Get the current topic id from the URL pathname
 * Works dynamically even for deep subdirectories
 * @returns {string}
 */
export const getCurrentTopicId = () => {
  const path = window.location.pathname;
  const match = path.match(/\/topics\/(.+?)(?:\.html)?$/);
  return match ? match[1] : '';
};

// ─── Topic Resolution ────────────────────────────────────────────────────────

/**
 * Merge TOPIC_ORDER + TOPIC_META into full topic objects.
 * Auto-derives id, title, file from the id string.
 * TOPIC_META provides optional overrides.
 * @returns {Array<{id, title, file, category, icon, description}>}
 */
export const getTopics = () =>
  TOPIC_ORDER.map((id) => {
    const meta = TOPIC_META[id] || {};
    return {
      id,
      title: meta.title || fileToTitle(id),
      file: `${id}.html`,
      category: meta.category || 'Fundamentals',
      icon: meta.icon || '📄',
      description: meta.description || '',
      ...meta
    };
  });

/**
 * Get all topics filtered by a specific learning pathway
 * @param {string} pathwayId 
 * @returns {Array}
 */
export const getTopicsByPathway = (pathwayId) => {
  const topics = getTopics();
  const pathway = PATHWAYS[pathwayId];
  if (!pathway) return topics;
  return topics.filter(t => pathway.categories.includes(t.category));
};

/**
 * Get unique categories in the order they first appear in TOPIC_ORDER
 * @returns {string[]}
 */
export const getCategories = () => {
  const topics = getTopics();
  return [...new Set(topics.map((t) => t.category))];
};

/**
 * Get categories filtered by active pathway
 * @param {string} pathwayId 
 * @returns {string[]}
 */
export const getCategoriesByPathway = (pathwayId) => {
  const topics = getTopicsByPathway(pathwayId);
  return [...new Set(topics.map((t) => t.category))];
};

/**
 * Get topics grouped by category
 * @returns {Object.<string, Array>}
 */
export const getTopicsByCategory = () => {
  const topics = getTopics();
  return topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {});
};

/**
 * Get topics in active pathway grouped by category
 * @param {string} pathwayId 
 * @returns {Object.<string, Array>}
 */
export const getTopicsByCategoryAndPathway = (pathwayId) => {
  const topics = getTopicsByPathway(pathwayId);
  return topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {});
};

// ─── URL Parameter Utilities ─────────────────────────────────────────────────

/**
 * Get a URL search parameter value
 * @param {string} key
 * @returns {string}
 */
export const getSearchParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || '';
};

/**
 * Set a URL search parameter without page reload
 * @param {string} key
 * @param {string} value
 */
export const setSearchParam = (key, value) => {
  const params = new URLSearchParams(window.location.search);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
};

// ─── LocalStorage Helpers ────────────────────────────────────────────────────

const STORAGE_KEYS = {
  VISITED: 'java-learn-visited',
  THEME: 'java-learn-theme',
  ACTIVE_PATHWAY: 'java-learn-active-pathway',
};

/**
 * Get the set of visited topic IDs
 * @returns {Set<string>}
 */
export const getVisited = () => {
  if (inMemoryState.visited) return new Set(inMemoryState.visited);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITED);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

/**
 * Mark a topic ID as visited
 * @param {string} id
 */
export const markVisited = (id) => {
  const visited = getVisited();
  visited.add(id);
  const arr = [...visited];
  inMemoryState.visited = arr;
  triggerSync();
  try {
    localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify(arr));
    addStreakDate(); // Automatically log study day!
  } catch {
    // storage unavailable — silently fail
  }
};

/**
 * Get saved theme preference
 * @returns {'dark'|'light'}
 */
export const getSavedTheme = () =>
  localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';

/**
 * Persist theme preference
 * @param {'dark'|'light'} theme
 */
export const saveTheme = (theme) =>
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

/**
 * Get saved active learning pathway
 * Defaults to 'dashboard'
 * @returns {string}
 */
export const getActivePathway = () =>
  localStorage.getItem(STORAGE_KEYS.ACTIVE_PATHWAY) || 'dashboard';

/**
 * Save active learning pathway
 * @param {string} pathwayId 
 */
export const setActivePathway = (pathwayId) =>
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PATHWAY, pathwayId);

// ─── Progress Calculation ────────────────────────────────────────────────────

/**
 * Calculate learning progress filtered by the active pathway
 * @param {string} [pathwayId]
 * @returns {{ visited: number, total: number, percent: number }}
 */
export const calcProgress = (pathwayId) => {
  const activePathway = pathwayId || getActivePathway();
  if (activePathway === 'dashboard') {
    return getGlobalProgress();
  }
  const pathwayTopics = getTopicsByPathway(activePathway);
  const visited = getVisited();
  const visitedCount = pathwayTopics.filter((t) => visited.has(t.id)).length;
  return {
    visited: visitedCount,
    total: pathwayTopics.length,
    percent: pathwayTopics.length > 0 ? Math.round((visitedCount / pathwayTopics.length) * 100) : 0,
  };
};

/**
 * Calculate overall learning progress across all pathways combined
 * @returns {{ visited: number, total: number, percent: number }}
 */
export const getGlobalProgress = () => {
  const topics = getTopics().filter(t => !t.isLocked);
  const visited = getVisited();
  const visitedCount = topics.filter(t => visited.has(t.id)).length;
  return {
    visited: visitedCount,
    total: topics.length,
    percent: topics.length > 0 ? Math.round((visitedCount / topics.length) * 100) : 0,
  };
};

// ─── Study Streak Tracker ────────────────────────────────────────────────────

export const getStreakHistory = () => {
  if (inMemoryState.streakDates) return [...inMemoryState.streakDates];
  try {
    const raw = localStorage.getItem('java-learn-streak-dates');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addStreakDate = () => {
  const dates = getStreakHistory();
  const local = new Date();
  const offset = local.getTimezoneOffset();
  const localDate = new Date(local.getTime() - offset * 60 * 1000);
  const today = localDate.toISOString().split('T')[0];

  if (!dates.includes(today)) {
    dates.push(today);
    inMemoryState.streakDates = dates;
    triggerSync();
    try {
      localStorage.setItem('java-learn-streak-dates', JSON.stringify(dates));
    } catch {}
  }
};

export const calcStreakDays = () => {
  const dates = getStreakHistory();
  if (dates.length === 0) return 0;
  
  // Sort ascending
  const sorted = [...new Set(dates)].sort();
  
  const local = new Date();
  const offset = local.getTimezoneOffset();
  const localDate = new Date(local.getTime() - offset * 60 * 1000);
  const todayStr = localDate.toISOString().split('T')[0];
  
  const yesterday = new Date(local.getTime() - offset * 60 * 1000 - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // If last studied date isn't today or yesterday, streak is reset to 0
  const lastStudy = sorted[sorted.length - 1];
  if (lastStudy !== todayStr && lastStudy !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  let currentRef = new Date(lastStudy);
  
  for (let i = sorted.length - 2; i >= 0; i--) {
    const prevDate = new Date(sorted[i]);
    const diffTime = Math.abs(currentRef - prevDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentRef = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
};

// ─── Study Recommendation Engine ──────────────────────────────────────────────

export const getRecommendation = () => {
  const topics = getTopics().filter(t => !t.isLocked);
  const visited = getVisited();
  // Find first unvisited topic
  const recommended = topics.find(t => !visited.has(t.id));
  return recommended || null;
};

// ─── Study Planner (TODO Tasks) API ───────────────────────────────────────────

export const getPlannerTasks = () => {
  if (inMemoryState.plannerTasks) return JSON.parse(JSON.stringify(inMemoryState.plannerTasks));
  try {
    const raw = localStorage.getItem('java-learn-planner-tasks');
    if (!raw) {
      // Setup some premium initial setup tasks!
      const initial = [
        { id: 1, text: '👋 Welcome! Complete Java basics first.', done: false },
        { id: 2, text: '☁️ Review AWS Day 2 userdata mechanics.', done: false },
        { id: 3, text: '🐿️ Check Spring Kafka producer patterns.', done: false }
      ];
      localStorage.setItem('java-learn-planner-tasks', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const savePlannerTasks = (tasks) => {
  inMemoryState.plannerTasks = tasks;
  triggerSync();
  try {
    localStorage.setItem('java-learn-planner-tasks', JSON.stringify(tasks));
  } catch {}
};

export const addPlannerTask = (text) => {
  const tasks = getPlannerTasks();
  const newTask = {
    id: Date.now(),
    text: text.trim(),
    done: false
  };
  tasks.push(newTask);
  savePlannerTasks(tasks);
  return newTask;
};

export const togglePlannerTask = (taskId) => {
  const tasks = getPlannerTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    savePlannerTasks(tasks);
  }
};

export const deletePlannerTask = (taskId) => {
  const tasks = getPlannerTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  savePlannerTasks(filtered);
};

// ─── Study Plan Checklist State API ──────────────────────────────────────────

export const getConfidenceRatings = () => {
  if (inMemoryState.checklistConfidence) return { ...inMemoryState.checklistConfidence };
  try {
    const raw = localStorage.getItem('java-learn-checklist-confidence');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveConfidenceRating = (dayId, rating) => {
  const ratings = getConfidenceRatings();
  ratings[dayId] = rating;
  inMemoryState.checklistConfidence = ratings;
  triggerSync();
  try {
    localStorage.setItem('java-learn-checklist-confidence', JSON.stringify(ratings));
  } catch {}
};

export const getCheckedItems = () => {
  if (inMemoryState.checklistItems) return new Set(inMemoryState.checklistItems);
  try {
    const raw = localStorage.getItem('java-learn-checklist-items');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const saveCheckedItems = (checkedSet) => {
  const arr = [...checkedSet];
  inMemoryState.checklistItems = arr;
  triggerSync();
  try {
    localStorage.setItem('java-learn-checklist-items', JSON.stringify(arr));
  } catch {}
};

// ─── Timers and Notes State API ──────────────────────────────────────────────

export const getTimerState = (dayId) => {
  if (inMemoryState.timers && inMemoryState.timers[dayId]) {
    return { ...inMemoryState.timers[dayId] };
  }
  return {
    elapsed: parseInt(localStorage.getItem(`java-learn-timer-elapsed-${dayId}`)) || 0,
    running: localStorage.getItem(`java-learn-timer-running-${dayId}`) === 'true'
  };
};

export const saveTimerState = (dayId, elapsed, running) => {
  if (!inMemoryState.timers) inMemoryState.timers = {};
  inMemoryState.timers[dayId] = { elapsed, running };
  triggerSync();
  try {
    localStorage.setItem(`java-learn-timer-elapsed-${dayId}`, elapsed);
    localStorage.setItem(`java-learn-timer-running-${dayId}`, running ? 'true' : 'false');
  } catch {}
};

export const getNote = (dayId) => {
  if (inMemoryState.notes && inMemoryState.notes[dayId] !== undefined) {
    return inMemoryState.notes[dayId];
  }
  return localStorage.getItem(`java-learn-notes-${dayId}`) || '';
};

export const saveNote = (dayId, content) => {
  if (!inMemoryState.notes) inMemoryState.notes = {};
  inMemoryState.notes[dayId] = content;
  triggerSync();
  try {
    localStorage.setItem(`java-learn-notes-${dayId}`, content);
  } catch {}
};
export const getAllTimers = () => {
  if (inMemoryState.timers) return JSON.parse(JSON.stringify(inMemoryState.timers));
  const timers = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('java-learn-timer-elapsed-')) {
      const dayId = key.replace('java-learn-timer-elapsed-', '');
      timers[dayId] = {
        elapsed: parseInt(localStorage.getItem(key)) || 0,
        running: false
      };
    }
  }
  return timers;
};

export const getAllNotes = () => {
  if (inMemoryState.notes) return { ...inMemoryState.notes };
  const notes = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('java-learn-notes-')) {
      const dayId = key.replace('java-learn-notes-', '');
      notes[dayId] = localStorage.getItem(key) || '';
    }
  }
  return notes;
};
