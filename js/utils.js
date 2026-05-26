/**
 * utils.js — Shared utility functions
 * Handles: filename parsing, localStorage, URL params, progress calculation
 */

import { TOPIC_ORDER, TOPIC_META } from './topics.config.js';

// ─── Filename Utilities ─────────────────────────────────────────────────────

/**
 * Convert a kebab-case id to a Title Case string
 * 'streams-api' → 'Streams API'
 * @param {string} id
 * @returns {string}
 */
export const fileToTitle = (id) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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
 * @returns {string}
 */
export const getCurrentTopicId = () => {
  const path = window.location.pathname;
  const match = path.match(/\/topics\/([^/]+?)(?:\.html)?$/);
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
    };
  });

/**
 * Get unique categories in the order they first appear in TOPIC_ORDER
 * @returns {string[]}
 */
export const getCategories = () => {
  const topics = getTopics();
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
};

/**
 * Get the set of visited topic IDs
 * @returns {Set<string>}
 */
export const getVisited = () => {
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
  try {
    localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify([...visited]));
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

// ─── Progress Calculation ────────────────────────────────────────────────────

/**
 * Calculate learning progress
 * @returns {{ visited: number, total: number, percent: number }}
 */
export const calcProgress = () => {
  const topics = getTopics();
  const visited = getVisited();
  const visitedCount = topics.filter((t) => visited.has(t.id)).length;
  return {
    visited: visitedCount,
    total: topics.length,
    percent: topics.length > 0 ? Math.round((visitedCount / topics.length) * 100) : 0,
  };
};
