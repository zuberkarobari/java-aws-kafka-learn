import { profileService } from '../services/ProfileService.js';
import { exportService } from '../services/ExportService.js';
import { clearAllLearningData } from '../utils.js';

class ProfileComponent {
  render(container) {
    // Show loading state initially
    container.innerHTML = `
      <div class="dashboard-container" style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
        <div class="spinner" style="font-size: 2rem; animation: spin 1s linear infinite;">⏳</div>
      </div>
    `;

    // Fetch data
    const data = profileService.getProfileData();

    if (!data.user) {
      this.renderEmptyState(container);
      return;
    }

    this.renderDashboard(container, data);
  }

  renderEmptyState(container) {
    container.innerHTML = `
      <div class="dashboard-container" style="text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
        <h2 style="margin-bottom: 1rem;">Login to Sync Your Profile</h2>
        <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 2rem;">
          Sign in with Google to securely save your notes, timers, and progress across all your devices.
        </p>
        <button id="profile-login-btn" class="gqa-btn" style="padding: 0.75rem 2rem; border-radius: var(--radius-md); background: var(--accent); color: white; cursor: pointer; border: none; font-size: 1rem; font-weight: bold;">
          Sign In Now
        </button>
      </div>
    `;

    document.getElementById('profile-login-btn')?.addEventListener('click', () => {
      document.getElementById('auth-btn')?.click();
    });
  }

  renderDashboard(container, data) {
    const { user, analytics } = data;

    const escapeHTML = (str) => String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));

    const html = `
      <div class="dashboard-container profile-container" style="max-width: 900px; margin: 0 auto;">
        
        <!-- Account Header -->
        <div class="dashboard-stat-card profile-header-card" style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding: 2rem;">
          <div class="profile-avatar" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--surface-dim); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
            ${user.photoURL ? `<img src="${escapeHTML(user.photoURL)}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"> <span style="display: none;">👤</span>` : '👤'}
          </div>
          <div class="profile-user-info">
            <h2 style="margin: 0 0 0.25rem 0; font-size: 1.5rem;">${escapeHTML(user.displayName)}</h2>
            <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem;">${escapeHTML(user.email)}</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
              <span>📅 Joined: ${new Date(user.creationTime).toLocaleDateString()}</span>
              <span>🟢 Last Login: ${new Date(user.lastSignInTime).toLocaleDateString()}</span>
            </div>
          </div>
          <div style="margin-left: auto; display: flex; gap: 0.5rem;">
            <button id="profile-clear-btn" class="gqa-btn" style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #ef4444; cursor: pointer; color: white;">
              🗑️ Reset Progress
            </button>
            <button id="profile-export-btn" class="gqa-btn" style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: transparent; cursor: pointer; color: var(--text-primary);">
              💾 Export JSON
            </button>
          </div>
        </div>

        <!-- Global Progress Stats -->
        <h3 class="dashboard-section-title">Global Analytics</h3>
        <div class="dashboard-stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 2rem;">
          
          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">Completion</h4>
            <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: var(--accent);">${analytics.topicsCompletionPercent}%</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${analytics.topicsCompleted} of ${analytics.topicsCompleted + analytics.topicsRemaining} Topics</div>
          </div>

          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">Streaks</h4>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: #f59e0b;">${analytics.currentStreak} 🔥</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Current Streak</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0;">${analytics.longestStreak} 🏆</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Longest</div>
              </div>
            </div>
          </div>

          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">Total Study Time</h4>
            <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: #3b82f6;">${analytics.totalStudyHours}h ⏱️</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Tracked via daily timers</div>
          </div>

        </div>

        <!-- Engagement & Activity -->
        <h3 class="dashboard-section-title">Engagement & Activity</h3>
        <div class="dashboard-stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          
          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">My Notes</h4>
            <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: #10b981;">${analytics.notesCount} 📝</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Saved snippets & summaries</div>
          </div>

          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">Planner Tasks</h4>
            <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: #8b5cf6;">${analytics.taskCompletionRate}%</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${analytics.completedTasks} of ${analytics.totalTasks} Tasks Done</div>
          </div>

          <div class="dashboard-stat-card">
            <h4 class="stat-card-title">Most Active Category</h4>
            <div style="font-size: 1.2rem; font-weight: bold; margin: 0.7rem 0 0.3rem 0; line-height: 1.2; word-break: break-word;">${escapeHTML(analytics.mostActiveCategory)}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Your favorite subject</div>
          </div>

        </div>
        
      </div>
    `;

    container.innerHTML = html;

    // Bind Export action
    document.getElementById('profile-export-btn')?.addEventListener('click', () => {
      exportService.exportUserData();
    });

    // Bind Clear Data action
    document.getElementById('profile-clear-btn')?.addEventListener('click', () => {
      clearAllLearningData();
    });
  }
}

export const profileComponent = new ProfileComponent();
