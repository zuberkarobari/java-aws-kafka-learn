/**
 * command-palette.js — Global Search Auto-complete
 */
import { getTopics, getPathPrefix } from './utils.js';

let isPaletteOpen = false;
let allTopics = [];
let filteredTopics = [];
let selectedIndex = 0;
let prefix = '';

const createPaletteHTML = () => {
  const overlay = document.createElement('div');
  overlay.id = 'cmd-palette-overlay';
  overlay.className = 'cmd-palette-overlay';

  const modal = document.createElement('div');
  modal.className = 'cmd-palette-modal';
  
  modal.innerHTML = `
    <div class="cmd-palette-header">
      <span class="cmd-palette-icon">🔍</span>
      <input type="text" id="cmd-palette-input" class="cmd-palette-input" placeholder="Search for any topic..." autocomplete="off" spellcheck="false" />
      <span class="cmd-palette-esc">ESC</span>
    </div>
    <div class="cmd-palette-results" id="cmd-palette-results"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return { overlay, modal, input: modal.querySelector('#cmd-palette-input'), results: modal.querySelector('#cmd-palette-results') };
};

export const openCommandPalette = () => {
  if (isPaletteOpen) return;
  isPaletteOpen = true;
  const overlay = document.getElementById('cmd-palette-overlay');
  const input = document.getElementById('cmd-palette-input');
  if (overlay && input) {
    overlay.classList.add('active');
    input.value = '';
    
    // Simulate empty filter
    const event = new Event('input');
    input.dispatchEvent(event);
    
    setTimeout(() => input.focus(), 50);
    document.body.style.overflow = 'hidden';
  }
};

export const initCommandPalette = () => {
  const { overlay, modal, input, results } = createPaletteHTML();
  allTopics = getTopics();
  prefix = getPathPrefix();

  const openPalette = () => openCommandPalette();

  const closePalette = () => {
    isPaletteOpen = false;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  const renderResults = () => {
    if (filteredTopics.length === 0) {
      results.innerHTML = `<div class="cmd-palette-empty">No results found</div>`;
      return;
    }

    results.innerHTML = filteredTopics.map((t, i) => `
      <div class="cmd-palette-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
        <div class="cmd-item-icon">${t.icon}</div>
        <div class="cmd-item-content">
          <div class="cmd-item-title">${t.title}</div>
          <div class="cmd-item-cat">${t.category}</div>
        </div>
        <div class="cmd-item-arrow">→</div>
      </div>
    `).join('');

    // Ensure selected item is scrolled into view
    const selectedEl = results.querySelector('.cmd-palette-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  };

  const filterResults = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      // Show first 10 topics by default, or maybe just recent ones. We'll show first 8.
      filteredTopics = allTopics.slice(0, 8);
    } else {
      filteredTopics = allTopics.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) || 
        t.category.toLowerCase().includes(lowerQuery) || 
        (t.description && t.description.toLowerCase().includes(lowerQuery))
      ).slice(0, 8); // Limit to 8 results for clean UI
    }
    selectedIndex = 0;
    renderResults();
  };

  const navigateToSelected = () => {
    if (filteredTopics.length > 0 && selectedIndex >= 0 && selectedIndex < filteredTopics.length) {
      const topic = filteredTopics[selectedIndex];
      window.location.href = `${prefix}topics/${topic.file}`;
    }
  };

  // ─── Event Listeners ───

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd+K (Mac) or Ctrl+K (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isPaletteOpen ? closePalette() : openPalette();
    }
    // / to focus search (only if not typing in another input)
    if (e.key === '/' && !isPaletteOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openPalette();
    }
  });

  // Modal Keyboard Navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIndex < filteredTopics.length - 1) {
        selectedIndex++;
        renderResults();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
        renderResults();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      navigateToSelected();
    }
  });

  input.addEventListener('input', (e) => {
    filterResults(e.target.value);
  });

  // Mouse selection
  results.addEventListener('click', (e) => {
    const item = e.target.closest('.cmd-palette-item');
    if (item) {
      selectedIndex = parseInt(item.getAttribute('data-index'));
      navigateToSelected();
    }
  });

  results.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.cmd-palette-item');
    if (item) {
      const newIndex = parseInt(item.getAttribute('data-index'));
      if (newIndex !== selectedIndex) {
        selectedIndex = newIndex;
        renderResults();
      }
    }
  });

  // Click outside to close
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) {
      closePalette();
    }
  });
};
