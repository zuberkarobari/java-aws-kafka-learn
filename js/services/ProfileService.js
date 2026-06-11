import { 
  getGlobalProgress, 
  getStreakHistory, 
  calcStreakDays, 
  getPlannerTasks, 
  getAllTimers, 
  getAllNotes,
  getTopics,
  getVisited
} from '../utils.js';
import { getCurrentUser } from '../firebase-service.js';

class ProfileService {
  constructor() {
    this.cachedData = null;
    this.lastComputed = 0;
  }

  getProfileData(forceRefresh = false) {
    if (this.cachedData && !forceRefresh && (Date.now() - this.lastComputed < 5000)) {
      return Object.freeze({ ...this.cachedData });
    }

    const user = getCurrentUser();
    
    // Topics
    const globalProgress = getGlobalProgress();
    
    // Streak
    const currentStreak = calcStreakDays();
    const streakHistory = getStreakHistory();
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (streakHistory.length > 0) {
      const sorted = [...new Set(streakHistory)].sort();
      tempStreak = 1;
      longestStreak = 1;
      
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diffDays = Math.round(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    // Timers
    const allTimers = getAllTimers();
    let totalSeconds = 0;
    for (const day in allTimers) {
      totalSeconds += allTimers[day].elapsed || 0;
    }
    const totalStudyHours = (totalSeconds / 3600).toFixed(1);

    // Notes
    const allNotes = getAllNotes();
    const notesCount = Object.keys(allNotes).length;

    // Planner Tasks
    const plannerTasks = getPlannerTasks();
    const totalTasks = plannerTasks.length;
    const completedTasks = plannerTasks.filter(t => t.done).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Most Active Category
    const visited = getVisited();
    const topics = getTopics();
    const categoryCounts = {};
    
    topics.forEach(t => {
      if (visited.has(t.id)) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      }
    });

    let mostActiveCategory = 'N/A';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveCategory = cat;
      }
    }

    this.cachedData = {
      user: user ? {
        displayName: user.displayName || 'Anonymous Scholar',
        email: user.email || 'No email provided',
        photoURL: user.photoURL || '',
        creationTime: user.metadata?.creationTime || 'N/A',
        lastSignInTime: user.metadata?.lastSignInTime || 'N/A'
      } : null,
      analytics: {
        topicsCompleted: globalProgress.visited,
        topicsRemaining: globalProgress.total - globalProgress.visited,
        topicsCompletionPercent: globalProgress.percent,
        currentStreak,
        longestStreak,
        totalStudyHours,
        notesCount,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        mostActiveCategory
      }
    };
    
    this.lastComputed = Date.now();
    return Object.freeze({ ...this.cachedData });
  }

  clearCache() {
    this.cachedData = null;
  }
}

export const profileService = new ProfileService();
