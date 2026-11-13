/**
 * app.js — Homepage logic
 * Renders: dashboard overview, category sidebar, topic cards, search, progress bar, theme toggle, pathways nav
 * localStorage only — no Firebase dependency
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
  getCategoriesByPathway,
  getTopicsByCategoryAndPathway,
  calcProgress,
  getStreakHistory,
  calcStreakDays,
  getGlobalProgress,
  getRecommendation,
  getLastStudiedTopic,
  getPlannerTasks,
  addPlannerTask,
  togglePlannerTask,
  deletePlannerTask,
  editPlannerTask,
  getTaskCategoryInfo,
  getConfidenceRatings,
  getTotalStudyTimeStr,
  getInterviewReadiness,
  getSkillProgress,
  getWeeklyStats,
  getUserXP,
  getPathwayTargetUrl,
  escapeHtml
} from './utils.js';
import { PATHWAYS } from './topics.config.js';
import { initCommandPalette, openCommandPalette } from './command-palette.js';

// ─── Theme ───────────────────────────────────────────────────────────────────

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon') || document.getElementById('top-theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  const mobileIcon = document.getElementById('mobile-theme-icon');
  if (mobileIcon) mobileIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  const checkbox = document.getElementById('theme-toggle-checkbox');
  if (checkbox) checkbox.checked = theme === 'dark';
  const mobileCheckbox = document.getElementById('mobile-theme-toggle-checkbox');
  if (mobileCheckbox) mobileCheckbox.checked = theme === 'dark';
};

const initTheme = () => {
  const theme = getSavedTheme();
  applyTheme(theme);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
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

const DAILY_QUESTIONS = [
  {
    topic: 'Core Java Concurrency',
    question: 'Why does ConcurrentHashMap prohibit null keys and values, whereas standard HashMap permits them?',
    answer: 'In concurrent multithreaded maps, map.get(k) returning null creates an unresolvable ambiguity: did the key map to null, or is the key absent? In single-threaded HashMap, containsKey(k) resolves this. In ConcurrentHashMap, another thread could mutate the map between containsKey() and get(), making race conditions inevitable. Doug Lea specifically designed it so null checks throw NullPointerException immediately.',
    code: '// Race condition prevented by design in ConcurrentHashMap:\nif (map.containsKey(k)) {\n  // In a concurrent map, key could be deleted here by Thread B!\n  return map.get(k);\n}',
    tag: 'FAANG Favorite',
    file: 'java/multithreading.html'
  },
  {
    topic: 'JVM Internals',
    question: 'What is the purpose of Escape Analysis in the JIT compiler, and how does it enable Stack Allocation?',
    answer: 'Escape Analysis determines if an object allocated inside a method escapes outside its call scope (e.g. returned, stored in a field, or passed to another thread). If the JIT proves an object does NOT escape, it can eliminate heap allocation entirely and allocate the object on the CPU stack or replace it with scalar primitive values in CPU registers (Scalar Replacement), completely bypassing Garbage Collection.',
    code: '// Non-escaping object eligible for scalar replacement:\npublic int compute() {\n  Point p = new Point(10, 20); // Never escapes compute()\n  return p.x + p.y;            // Decomposed into primitive registers!\n}',
    tag: 'High Performance',
    file: 'key-topics/jvm_architecture_deep_dive.html'
  },
  {
    topic: 'Distributed Systems & Microservices',
    question: 'How do you guarantee Idempotency for financial or payment REST API endpoints?',
    answer: 'Use an Idempotency-Key HTTP header generated by the client (UUID). The API Gateway or service checks a distributed store (e.g. Redis) with a conditional set (SETNX) before processing. If the key exists with status "COMPLETED", return the cached response. If "IN_PROGRESS", reject duplicate concurrent requests (HTTP 409 Conflict). If absent, acquire the lock, process transaction, and save response.',
    code: 'POST /v1/payments/charge\nIdempotency-Key: 7b91d24a-5f89-4b68-b7a4-0c2ef9762198\n\n// Backend logic:\nboolean acquired = redis.setIfAbsent(key, "PROCESSING", 120, TimeUnit.SECONDS);\nif (!acquired) return cachedOrConflict();',
    tag: 'System Design',
    file: 'spring-boot/microservices_fundamentals.html'
  },
  {
    topic: 'Spring Boot Architecture',
    question: 'What is the difference between @Autowired field injection and constructor injection, and why does Spring recommend constructor injection?',
    answer: 'Field injection relies on reflection to mutate private fields, hides class dependencies, prevents creating immutable (final) fields, and makes unit testing difficult without Mockito reflection. Constructor injection enforces dependency completeness at initialization, allows fields to be final, prevents circular dependencies at startup, and enables pure POJO unit testing without a Spring context.',
    code: '@Service\npublic class PaymentService {\n  private final PaymentGateway gateway; // Final & immutable!\n\n  public PaymentService(PaymentGateway gateway) {\n    this.gateway = Objects.requireNonNull(gateway);\n  }\n}',
    tag: 'Spring Core',
    file: 'spring-boot/springboot.html'
  },
  {
    topic: 'Kafka Event Streaming',
    question: 'What causes Consumer Group Rebalancing in Kafka, and how does Static Group Membership mitigate rebalance storms?',
    answer: 'Rebalances occur when a consumer joins, leaves, or fails to send heartbeats (max.poll.interval.ms exceeded), or when partitions are added. During an eager rebalance, all consumers stop processing (Stop-The-World). Static Group Membership (group.instance.id) assigns a fixed identity to consumer instances so rolling restarts or transient network blips within session.timeout.ms do NOT trigger expensive rebalance storms.',
    code: '// Consumer config for zero-downtime rolling restart:\nprops.put(ConsumerConfig.GROUP_INSTANCE_ID_CONFIG, "order-service-" + podId);\nprops.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "45000");',
    tag: 'Kafka Production',
    file: 'kafka/what_is_consumer_group.html'
  }
];

window.toggleDailyAnswer = () => {
  const panel = document.getElementById('daily-answer-panel');
  const btn = document.getElementById('btn-toggle-daily');
  if (!panel || !btn) return;
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'block' : 'none';
  btn.innerHTML = isHidden ? '🙈 Hide Senior Answer' : '💡 View Senior Answer & Code Snippet';
};

const getRankTitle = (level) => {
  if (level >= 6) return 'Staff Engineer';
  if (level >= 5) return 'Architecture Master';
  if (level >= 4) return 'Spring Specialist';
  if (level >= 3) return 'Concurrency Adept';
  if (level >= 2) return 'Backend Apprentice';
  return 'Core Explorer';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning, <span class="hero-highlight">Engineer</span> ☕';
  if (hour < 18) return 'Good Afternoon, <span class="hero-highlight">Engineer</span> 🚀';
  return 'Good Evening, <span class="hero-highlight">Engineer</span> 🌙';
};

const renderHeroHtml = (streak, rankTitle, greeting, continueTopic) => {
  const targetUrl = continueTopic ? `topics/${continueTopic.file}` : 'topics/java/java-basics.html';
  const topicTitle = continueTopic ? continueTopic.title : 'Java Basics';
  return `
    <div class="dashboard-hero">
      <div class="hero-content">
        <div class="hero-status-pill">
          <span>🔥 ${streak} Day Streak</span>
          <span class="hero-sep">·</span>
          <span class="hero-rank-badge">${rankTitle}</span>
        </div>
        <h2 class="hero-title">${greeting}</h2>
        <div class="hero-actions">
          <button class="btn-hero-primary" onclick="window.location.href='${targetUrl}'">
            <span class="btn-play-icon">▶</span>
            <span>Resume: <strong>${topicTitle}</strong></span>
          </button>
          <button class="btn-hero-secondary" onclick="document.getElementById('daily-interview-card')?.scrollIntoView({ behavior: 'smooth' })">
            <span>⚡ Daily Warmup</span>
          </button>
        </div>
      </div>
    </div>
  `;
};

const renderStatBoxHtml = (icon, iconClass, val, label, microText, barPct = null, isGreen = false) => `
  <div class="stat-box">
    <div class="stat-icon-wrap ${iconClass}">${icon}</div>
    <div class="stat-content">
      <div class="stat-val">${val}</div>
      <div class="stat-label">${label}</div>
      ${barPct !== null ? `
        <div class="stat-progress-bar" title="${barPct}%">
          <div class="stat-progress-fill ${isGreen ? 'fill-green' : ''}" style="width: ${barPct}%;"></div>
        </div>
      ` : ''}
      <div class="stat-micro-text" ${isGreen ? 'style="color: var(--success); font-weight: 600;"' : ''}>${microText}</div>
    </div>
  </div>
`;

const renderStatsRowHtml = (streak, xpData, rankTitle, globalProgress, stats) => {
  const xpPct = Math.min(100, Math.round((xpData.progressXP / xpData.nextLevelXP) * 100));
  return `
    <div class="dashboard-section-wrap">
      <h3 class="section-title">Performance & Vital Metrics</h3>
      <p class="section-subtitle">Real-time learning velocity, mastery tier, and XP progression.</p>
      <div class="dashboard-stats-row">
        ${renderStatBoxHtml('🔥', 'icon-streak', `${streak} Days`, 'Active Streak', streak > 0 ? 'Consistent learner' : 'Study today to start')}
        ${renderStatBoxHtml('🛡️', 'icon-xp', `Level ${xpData.level}`, rankTitle, `${xpData.progressXP} / ${xpData.nextLevelXP} XP to Lvl ${xpData.level + 1}`, xpPct)}
        ${renderStatBoxHtml('📚', 'icon-curriculum', `${globalProgress.visited} / ${globalProgress.total}`, 'Curriculum Mastered', `${globalProgress.percent}% Completed`, globalProgress.percent, true)}
        ${renderStatBoxHtml('⚡', 'icon-velocity', `${stats.topicsCompleted} Topics`, 'Sessions Completed', `▲ ${stats.velocity}% Learning Velocity`, null, true)}
      </div>
    </div>
  `;
};

const renderFeaturedPillsHtml = () => `
  <div class="featured-subtopics-row">
    <span class="subtopic-pill">OOP Internals</span>
    <span class="subtopic-pill">Concurrency & Locks</span>
    <span class="subtopic-pill">Java 21+ Virtual Threads</span>
    <span class="subtopic-pill">Memory Model</span>
  </div>
`;

const renderTrackCardHtml = (track) => {
  const progress = calcProgress(track.id);
  const targetUrl = getPathwayTargetUrl(track.id);
  const isFeatured = track.id === 'java';
  const btnLabel = progress.percent === 100 ? 'Review Track →' : progress.percent > 0 ? 'Resume Track →' : 'Start Track →';
  return `
    <div class="track-card track-card-${track.id} ${isFeatured ? 'track-card-featured' : ''}" onclick="window.location.href='${targetUrl}'">
      <div class="track-card-top">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="track-icon-badge">${track.icon}</div>
          <span class="track-tag">${track.tag}</span>
          ${isFeatured ? '<span class="featured-track-badge">⭐ Flagship</span>' : ''}
        </div>
        <span class="track-percent-pill">${progress.percent}%</span>
      </div>
      <h4 class="track-title">${track.title}</h4>
      <p class="track-desc">${track.desc}</p>
      ${isFeatured ? renderFeaturedPillsHtml() : ''}
      <div class="track-progress-wrap">
        <div class="track-progress-bar">
          <div class="track-progress-fill" style="width: ${progress.percent}%;"></div>
        </div>
        <div class="track-progress-meta">
          <span>${progress.visited} of ${progress.total} topics</span>
          <span class="track-action-label">${btnLabel}</span>
        </div>
      </div>
    </div>
  `;
};

const renderTracksHtml = (coreTracks) => `
  <div class="dashboard-section-wrap">
    <div class="section-header-flex">
      <div>
        <h3 class="section-title">Active Learning Tracks</h3>
        <p class="section-subtitle">Jump straight into your active chapters or review completed modules.</p>
      </div>
    </div>
    <div class="learning-tracks-grid">
      ${coreTracks.map(renderTrackCardHtml).join('')}
    </div>
  </div>
`;

const renderDailyWarmupHtml = (dailyQ) => `
  <div class="daily-interview-card" id="daily-interview-card">
    <div class="daily-card-header">
      <div class="daily-tag-row">
        <span class="daily-main-badge">⚡ Question of the Day</span>
        <span class="daily-topic-badge">${dailyQ.topic}</span>
        <span class="daily-fav-badge">${dailyQ.tag}</span>
      </div>
      <h3 class="daily-question-text">${dailyQ.question}</h3>
    </div>

    <div class="daily-card-body">
      <button id="btn-toggle-daily" class="btn-toggle-daily" onclick="toggleDailyAnswer()">
        💡 View Senior Answer & Code Snippet
      </button>

      <div id="daily-answer-panel" class="daily-answer-panel" style="display: none;">
        <div class="daily-answer-inner">
          <h5 class="answer-heading">Senior Developer Explanation:</h5>
          <p class="answer-text">${dailyQ.answer}</p>
          <pre class="daily-code-block"><code>${dailyQ.code}</code></pre>
          <div class="daily-card-footer">
            <a href="topics/${dailyQ.file}" class="btn-deep-dive">Open Related Deep Dive Chapter →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const renderToolkitHtml = () => `
  <div class="dashboard-section-wrap">
    <h3 class="section-title">Quick Launch Toolkit</h3>
    <p class="section-subtitle">Direct shortcuts to checklists, architecture explainers, and study tools.</p>
    <div class="toolkit-grid">
      <a href="topics/checklists/day1.html" class="toolkit-card">
        <span class="toolkit-icon">📅</span>
        <div>
          <div class="toolkit-name">45-Day Study Checklist</div>
          <div class="toolkit-sub">Day-by-day structured curriculum</div>
        </div>
      </a>
      <a href="topics/flow-explainer/01_browser.html" class="toolkit-card">
        <span class="toolkit-icon">⚡</span>
        <div>
          <div class="toolkit-name">Architecture Flow Explainer</div>
          <div class="toolkit-sub">Visual end-to-end request lifecycle</div>
        </div>
      </a>
      <a href="topics/key-topics/acid_properties_masterclass.html" class="toolkit-card">
        <span class="toolkit-icon">🎯</span>
        <div>
          <div class="toolkit-name">System Design Masterclasses</div>
          <div class="toolkit-sub">ACID, Gateway, Rate Limiting & Sagas</div>
        </div>
      </a>
      <a href="index.html?pathway=notes" class="toolkit-card">
        <span class="toolkit-icon">📓</span>
        <div>
          <div class="toolkit-name">My Notes & Scratchpad</div>
          <div class="toolkit-sub">Personal notes and code snippets</div>
        </div>
      </a>
    </div>
  </div>
`;

const renderDashboard = () => {
  const container = document.getElementById('topics-grid');
  if (!container) return;

  try {
    const xpData = getUserXP();
    const streak = calcStreakDays();
    const stats = getWeeklyStats();
    const globalProgress = getGlobalProgress();
    const recommended = getRecommendation();
    const continueTopic = getLastStudiedTopic() || recommended;
    const skillProgress = getSkillProgress();
    const interviewReadiness = getInterviewReadiness();
    const rankTitle = getRankTitle(xpData.level);
    const greeting = getGreeting();

    const coreTracks = [
      { id: 'java', title: 'Core Java & Concurrency', icon: '☕', desc: 'OOP, Memory Model, Collections, Streams & Java 21+ Virtual Threads', tag: 'Core Foundation' },
      { id: 'springboot', title: 'Spring Boot 3 & Microservices', icon: '🌱', desc: 'IoC Container, JPA Architecture, Caching, Actuator & Resilience4j', tag: 'Framework & API' },
      { id: 'aws', title: 'AWS Cloud Architecture', icon: '☁️', desc: 'VPC, EC2, S3, IAM, ALB, CloudWatch, DynamoDB, ECS & CI/CD', tag: 'Production Cloud' },
      { id: 'kafka', title: 'Kafka Event Streaming', icon: '🐿️', desc: 'Partitions, Consumer Groups, Offsets, Exactly-Once Semantics & DLT', tag: 'Distributed EDA' },
      { id: 'interview', title: 'FAANG Interview Prep & Top 50 DSA', icon: '💼', desc: 'High-frequency interview questions, concurrency traps & live patterns', tag: 'Interview Ready' }
    ];

    const todayIndex = new Date().getDate() % DAILY_QUESTIONS.length;
    const dailyQ = DAILY_QUESTIONS[todayIndex];

    const heroHtml = renderHeroHtml(streak, rankTitle, greeting, continueTopic);
    const statsHtml = renderStatsRowHtml(streak, xpData, rankTitle, globalProgress, stats);
    const tracksHtml = renderTracksHtml(coreTracks);
    const dailyHtml = renderDailyWarmupHtml(dailyQ);
    const toolkitHtml = renderToolkitHtml();

    const barsHtml = coreTracks.map(p => {
      const pPercent = skillProgress[p.id] || 0;
      return `
        <div class="progress-bar-row">
          <span class="bar-label">${p.title}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pPercent}%; background:var(--accent);"></div></div>
          <span class="bar-percent">${pPercent}%</span>
        </div>
      `;
    }).join('');

    const studyTime = getTotalStudyTimeStr();
    const bottomRowHtml = `
      <div class="dashboard-bottom-grid">
        <div class="progress-overview-card">
          <h3>Your Progress Overview</h3>
          <div class="overview-split">
            <div class="overview-bars">${barsHtml}</div>
            <div class="overview-stats">
              <div class="overview-stat-row"><span>Study Time</span><strong>${studyTime}</strong></div>
              <div class="overview-stat-row"><span>Topics Completed</span><strong>${stats.topicsCompleted}</strong></div>
              <div class="overview-stat-row"><span>Sessions</span><strong>${stats.sessions}</strong></div>
              <div class="overview-stat-row"><span>Most Active Day</span><strong>${stats.mostActiveDay}</strong></div>
              <div class="overview-stat-row"><span>Learning Velocity</span><strong style="color:var(--success);">▲ ${stats.velocity}%</strong></div>
            </div>
          </div>
        </div>
        <div class="interview-readiness-card">
          <h3>Interview Readiness</h3>
          <div class="circular-chart-container">
             <svg viewBox="0 0 36 36" class="circular-chart orange">
              <path class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                stroke-dasharray="${interviewReadiness}, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="17" class="percentage">${interviewReadiness}%</text>
            </svg>
            <div class="chart-label">Overall</div>
          </div>
          <p>Keep going! You're on the right track.</p>
          <button class="btn-outline" onclick="window.location.href='${getPathwayTargetUrl('interview')}'">Practice Interview Questions →</button>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="dashboard-main-wrapper">
        ${heroHtml}
        ${tracksHtml}
        ${dailyHtml}
        ${toolkitHtml}
        ${statsHtml}
        ${bottomRowHtml}
      </div>
    `;

    const headerLevel = document.getElementById('header-user-level');
    const headerStreak = document.getElementById('header-streak-count');
    if (headerLevel) headerLevel.textContent = `Level ${xpData.level}`;
    if (headerStreak) headerStreak.textContent = streak;

  } catch (err) {
    console.error('[renderDashboard] CRASH:', err);
    container.innerHTML = `<div style="color:red;padding:2rem;"><b>Dashboard Error:</b><br>${err.message}</div>`;
  }
};

export const renderRightSidebar = () => {
  const sidebar = document.getElementById('right-sidebar');
  if (!sidebar) return;

  const plannerTasks = getPlannerTasks();
  const skillProgress = getSkillProgress();
  const { visited, total, percent } = calcProgress('java'); // Assuming milestone is Java Core
  
  const tasksHtml = plannerTasks.map((t, idx) => {
    const cat = getTaskCategoryInfo(t);
    return `
      <div class="timeline-item ${t.done ? 'done' : ''}">
        <div class="timeline-dot" onclick="window.toggleTodo(${t.id})"></div>
        <div class="timeline-content">
          <div class="timeline-time" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span>Task ${idx+1}</span>
              <span class="task-category-pill task-cat-${cat.key}">${cat.icon} ${cat.name}</span>
            </div>
            <div class="timeline-actions">
              <button onclick="window.editTodo(${t.id})" style="background:none;border:none;cursor:pointer;font-size:0.8rem;padding:0;margin-right:6px;" title="Edit Task">✏️</button>
              <button onclick="window.deleteTodo(${t.id})" style="background:none;border:none;cursor:pointer;font-size:0.8rem;padding:0;color:#ef4444;" title="Delete Task">🗑️</button>
            </div>
          </div>
          <div class="timeline-text" id="task-text-${t.id}">${escapeHtml(t.text)}</div>
          <div class="timeline-status">${t.done ? 'Completed' : 'Upcoming'}</div>
        </div>
      </div>
    `;
  }).join('');

  const heatmapHtml = ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'AWS'].map(title => {
    const id = title.toLowerCase().replace(' ', '');
    const p = skillProgress[id] || 0;
    // render 10 little blocks based on p (each block 10%)
    let blocks = '';
    for(let i=0; i<10; i++) {
      blocks += `<div class="heatmap-block ${i*10 < p ? 'filled' : ''}"></div>`;
    }
    return `
      <div class="heatmap-row">
        <span class="heatmap-label">${title}</span>
        <div class="heatmap-blocks">${blocks}</div>
        <span class="heatmap-percent">${p}%</span>
      </div>
    `;
  }).join('');

  sidebar.innerHTML = `
    <!-- Today's Plan -->
    <div class="right-widget">
      <h3 class="widget-title">Today's Plan <span class="widget-link" onclick="document.getElementById('tab-studyplan').click()">View Calendar</span></h3>
      <div class="todays-plan-timeline">
        ${tasksHtml || '<p style="color:var(--text-muted);font-size:0.8rem;">No tasks planned.</p>'}
      </div>
      <div style="margin-top: 10px;">
        <input type="text" id="rs-todo-input" placeholder="+ Add Task" style="width:100%; padding:8px; border:none; border-bottom:1px solid var(--border); background:transparent; outline:none; font-size:0.85rem; color:var(--text-primary);">
      </div>
    </div>

    <!-- Upcoming Milestone -->
    <div class="right-widget">
      <h3 class="widget-title">Upcoming Milestone</h3>
      <div class="milestone-card">
        <div class="milestone-text">Complete Java Core</div>
        <div class="milestone-track"><div class="milestone-fill" style="width:${percent}%"></div></div>
        <div class="milestone-meta">
          <span>${total - visited} Sessions Remaining</span>
          <span>${percent}%</span>
        </div>
      </div>
    </div>

    <!-- Skill Heatmap -->
    <div class="right-widget">
      <h3 class="widget-title">Skill Heatmap <span class="widget-link" onclick="document.getElementById('tab-profile').click()">View All</span></h3>
      <div class="skill-heatmap">
        ${heatmapHtml}
      </div>
    </div>
  `;

  const input = document.getElementById('rs-todo-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        addPlannerTask(input.value.trim());
        if(window.showToast) window.showToast('Task added successfully', 'success');
        renderRightSidebar();
      }
    });
  }
};

// ─── Toast System ─────────────────────────────────────────────────────────────
window.showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Expose Todo actions globally on window object for dynamic string inline events
window.toggleTodo = (taskId) => {
  togglePlannerTask(taskId);
  renderRightSidebar();
};

window.deleteTodo = (taskId) => {
  deletePlannerTask(taskId);
  if(window.showToast) window.showToast('Task deleted', 'success');
  renderRightSidebar();
};

window.editTodo = (taskId) => {
  const textElement = document.getElementById(`task-text-${taskId}`);
  if (!textElement) return;
  
  const currentText = textElement.innerText;
  textElement.innerHTML = `<input type="text" id="edit-input-${taskId}" value="${escapeHtml(currentText)}" style="width:100%; border:1px solid var(--accent); background:var(--bg-elevated); color:var(--text-primary); padding:4px; border-radius:4px; outline:none; font-size:0.9rem;" />`;
  
  const input = document.getElementById(`edit-input-${taskId}`);
  input.focus();
  
  const saveChange = () => {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      editPlannerTask(taskId, newText);
      if(window.showToast) window.showToast('Task updated', 'success');
    } else if (!newText) {
      // Revert if empty
      textElement.innerText = currentText;
      return;
    }
    renderRightSidebar();
  };
  
  input.addEventListener('blur', saveChange);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveChange();
    if (e.key === 'Escape') {
      textElement.innerText = currentText;
    }
  });
};

// ─── Study Plan Roadmap Grid ──────────────────────────────────────────────────────

const renderStudyPlanRoadmap = () => {
  const visited = getVisited();
  const confidenceRatings = getConfidenceRatings();

  // Only include days that have actual content, sorted by day number, renumbered 1…43
  const dayTopics = getTopics()
    .filter(t => t.category.includes('Weeks'))
    .map(t => {
      const match = t.id.match(/checklists\/day(\d+)$/);
      return match ? { ...t, dayNum: parseInt(match[1], 10) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.dayNum - b.dayNum);

  const totalAvailable = dayTopics.length;
  const completedCount = dayTopics.filter(t => visited.has(t.id)).length;
  const completionPercent = totalAvailable > 0
    ? Math.round((completedCount / totalAvailable) * 100)
    : 0;

  // Sequential index shown on the dot face; original day title shown in tooltip
  const dots = dayTopics.map((topic, idx) => {
    const sessionNum = idx + 1;
    const isDone = visited.has(topic.id);
    const dotClass = `roadmap-dot${isDone ? ' done' : ' active'}`;
    const rating = confidenceRatings[topic.id];
    const stars = rating ? ` (${'\u2605'.repeat(rating)}${'\u2606'.repeat(5 - rating)})` : '';
    const label = `Session ${sessionNum}: ${topic.title}${stars}`;
    return `
      <div class="${dotClass}" title="${label}"
           onclick="window.location.href='topics/${topic.file}'"
           role="button" aria-label="${label}">
        <span class="dot-num">${sessionNum}</span>
      </div>`;
  });

  return `
    <div class="studyplan-roadmap-container">
      <div class="roadmap-header">
        <div class="roadmap-title-wrap">
          <span class="roadmap-icon">📅</span>
          <div>
            <h3 class="roadmap-main-title">45-Day Study Plan Roadmap</h3>
            <p class="roadmap-subtitle">${totalAvailable} sessions · hover a dot to see the topic · green = completed.</p>
          </div>
        </div>
        <div class="roadmap-stats">
          <div class="roadmap-stat-item">
            <span class="roadmap-stat-val">${completedCount} / ${totalAvailable}</span>
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
  const query = filterText.toLowerCase().trim();
  const visited = getVisited();
  
  if (activePathway === 'dashboard') {
    if (!query) {
      renderDashboard();
      return;
    }

    // Global search across all platform topics
    const allTopics = getTopics().filter(t => !t.isLocked);
    const matched = allTopics.filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query))
    );

    if (matched.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>No topics found for "<strong>${escapeHtml(filterText)}</strong>"</p>
          <button class="btn-clear-search" onclick="clearSearch()">Clear search</button>
        </div>
      `;
      return;
    }

    // Group matching topics by category
    const grouped = {};
    matched.forEach(t => {
      const cat = t.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });

    let searchHtml = `
      <div class="search-results-header" style="margin-bottom: var(--space-6); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-primary);">Search Results for "<span style="color: var(--accent);">${filterText}</span>"</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: var(--space-1) 0 0 0;">Found ${matched.length} matching topic${matched.length === 1 ? '' : 's'}</p>
        </div>
        <button class="btn-clear-search" onclick="clearSearch()" style="padding: 6px 14px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-primary); cursor: pointer; font-size: 0.82rem; font-weight: 600;">✕ Clear Search</button>
      </div>
    `;

    for (const [category, topics] of Object.entries(grouped)) {
      searchHtml += `
        <section class="category-section" id="cat-${slugify(category)}">
          <h2 class="category-title">${category}</h2>
          <div class="cards-grid">
            ${topics.map((t, i) => renderCard(t, visited.has(t.id), i)).join('')}
          </div>
        </section>
      `;
    }

    container.innerHTML = searchHtml;

    requestAnimationFrame(() => {
      container.querySelectorAll('.topic-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 30}ms`;
        card.classList.add('card-animate-in');
      });
    });
    return;
  }

  if (activePathway === 'notes') {
    renderNotesView(container);
    return;
  }

  if (activePathway === 'profile') {
    renderLocalProfile(container);
    return;
  }

  const byCategory = getTopicsByCategoryAndPathway(activePathway);

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
        <p>No topics found for "<strong>${escapeHtml(filterText)}</strong>"</p>
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

  // Global hotkey '/' to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
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

// ─── Local Profile View (localStorage only) ──────────────────────────────────

const renderLocalProfile = (container) => {
  const { visited, total, percent } = getGlobalProgress();
  const streak = calcStreakDays();
  const tasks = getPlannerTasks();
  const completedTasks = tasks.filter(t => t.done).length;

  // Count notes
  let notesCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('java-learn-notes-') && localStorage.getItem(key)?.trim()) notesCount++;
  }

  container.innerHTML = `
    <div class="dashboard-container" style="max-width: 800px;">
      <div class="dashboard-stat-card" style="text-align:center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <h2 style="margin: 0 0 0.5rem;">Your Local Progress</h2>
        <p style="color: var(--text-muted); margin: 0 0 2rem;">All data stored locally in your browser.</p>
      </div>
      <div class="dashboard-stats-grid">
        <div class="dashboard-stat-card">
          <h4 class="stat-card-title">Overall Completion</h4>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--accent); margin: 0.5rem 0;">${percent}%</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${visited} of ${total} topics done</div>
        </div>
        <div class="dashboard-stat-card">
          <h4 class="stat-card-title">Study Streak</h4>
          <div style="font-size: 2.5rem; font-weight: 800; color: #f59e0b; margin: 0.5rem 0;">${streak} 🔥</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">consecutive days</div>
        </div>
        <div class="dashboard-stat-card">
          <h4 class="stat-card-title">Notes Written</h4>
          <div style="font-size: 2.5rem; font-weight: 800; color: #10b981; margin: 0.5rem 0;">${notesCount} 📝</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">saved across topics</div>
        </div>
        <div class="dashboard-stat-card">
          <h4 class="stat-card-title">Planner Tasks</h4>
          <div style="font-size: 2.5rem; font-weight: 800; color: #8b5cf6; margin: 0.5rem 0;">${completedTasks}/${tasks.length}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">tasks completed</div>
        </div>
      </div>
      <div class="dashboard-stat-card" style="text-align:center;">
        <h4 class="stat-card-title" style="margin-bottom:1rem;">Reset Progress</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">This will clear all visited topics, notes, and planner tasks from your browser.</p>
        <button onclick="if(confirm('Clear ALL local data?')){localStorage.clear();window.location.reload();}" style="padding: 0.6rem 1.5rem; border-radius: var(--radius-md); background: #ef4444; color: white; border: none; cursor: pointer; font-weight: 600;">🗑️ Clear All Data</button>
      </div>
    </div>
  `;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── Init ─────────────────────────────────────────────────────────────────────

const init = () => {
  const theme = getSavedTheme();
  applyTheme(theme);

  const themeToggle = document.getElementById('theme-toggle-checkbox');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle-checkbox');
  
  const handleThemeChange = (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    applyTheme(newTheme);
    saveTheme(newTheme);
  };

  if (themeToggle) {
    themeToggle.addEventListener('change', handleThemeChange);
  }
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('change', handleThemeChange);
  }

  // Mobile navigation
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const leftSidebar = document.getElementById('left-sidebar');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  const closeMobileNav = () => {
    if (leftSidebar?.classList.contains('open')) {
      leftSidebar.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  const openMobileNav = () => {
    leftSidebar?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const toggleMobileNav = () => {
    const willOpen = !leftSidebar?.classList.contains('open');
    if (willOpen) openMobileNav();
    else closeMobileNav();
  };
  
  if (hamburgerBtn && leftSidebar && mobileOverlay) {
    hamburgerBtn.addEventListener('click', toggleMobileNav);
    mobileOverlay.addEventListener('click', closeMobileNav);
  }

  const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
  if (mobileSidebarClose) {
    mobileSidebarClose.addEventListener('click', closeMobileNav);
  }

  // Auto-close mobile drawer when tapping links inside it
  leftSidebar?.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (target && !target.classList.contains('mobile-sidebar-close-btn') && !target.closest('.theme-toggle-container')) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // Desktop navigation toggles
  const desktopLeftToggle = document.getElementById('desktop-left-toggle');
  const desktopRightToggle = document.getElementById('desktop-right-toggle');
  const dashboardWrapper = document.querySelector('.dashboard-wrapper');

  if (desktopLeftToggle && dashboardWrapper) {
    // Restore state from localStorage if available
    const leftCollapsed = localStorage.getItem('java-learn-left-collapsed') === 'true';
    if (leftCollapsed) dashboardWrapper.classList.add('left-collapsed');

    desktopLeftToggle.addEventListener('click', () => {
      const isCollapsed = dashboardWrapper.classList.toggle('left-collapsed');
      localStorage.setItem('java-learn-left-collapsed', isCollapsed);
    });
  }

  if (desktopRightToggle && dashboardWrapper) {
    // Restore state from localStorage if available
    const rightCollapsed = localStorage.getItem('java-learn-right-collapsed') === 'true';
    if (rightCollapsed) dashboardWrapper.classList.add('right-collapsed');

    desktopRightToggle.addEventListener('click', () => {
      const isCollapsed = dashboardWrapper.classList.toggle('right-collapsed');
      localStorage.setItem('java-learn-right-collapsed', isCollapsed);
    });
  }

  initPathwayTabs();
  initSearch();
  initCommandPalette();
  
  // Paths accordion toggle
  const accordionToggle = document.getElementById('nav-paths-toggle');
  if (accordionToggle) {
    // Check initial state from localStorage
    const isCollapsed = localStorage.getItem('java-learn-paths-collapsed') === 'true';
    const content = document.getElementById('nav-paths-content');
    const icon = document.getElementById('nav-paths-icon');
    
    if (isCollapsed && content && icon) {
      content.style.display = 'none';
      icon.style.transform = 'rotate(-90deg)';
    }

    accordionToggle.addEventListener('click', () => {
      if (content && icon) {
        const willCollapse = content.style.display !== 'none';
        content.style.display = willCollapse ? 'none' : 'block';
        icon.style.transform = willCollapse ? 'rotate(-90deg)' : 'rotate(0deg)';
        localStorage.setItem('java-learn-paths-collapsed', willCollapse);
      }
    });
  }

  document.getElementById('header-search-btn')?.addEventListener('click', openCommandPalette);

  renderSidebar(); // Note: sidebar might be different in new layout but kept for compat
  renderRightSidebar();
  renderProgress();
  renderCards(getSearchParam('search'));

  window.addEventListener('storage', () => {
    renderProgress();
    renderRightSidebar();
    renderCards(getSearchParam('search'));
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      renderProgress();
      renderRightSidebar();
      renderCards(getSearchParam('search'));
    }
  });
};

document.addEventListener('DOMContentLoaded', init);
