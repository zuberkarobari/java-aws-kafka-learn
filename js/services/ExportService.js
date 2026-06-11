import { inMemoryState } from '../utils.js';
import { getCurrentUser } from '../firebase-service.js';

class ExportService {
  /**
   * Generates a sanitized JSON payload of user-owned data and triggers a browser download.
   */
  exportUserData() {
    const user = getCurrentUser();
    if (!user) {
      console.warn('User not logged in, exporting local state only.');
    }

    // Deep clone the inMemoryState to avoid modifying the active app state
    const exportData = JSON.parse(JSON.stringify(inMemoryState));

    // Optional: Strip out internal or sensitive metadata if any existed
    // delete exportData.internalTokens;

    // Build the payload envelope
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        userId: user ? user.uid : 'anonymous',
        source: 'Java Learn App'
      },
      data: exportData
    };

    // Serialize
    const jsonString = JSON.stringify(payload, null, 2);
    
    // Create Blob and trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `java-learn-profile-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

export const exportService = new ExportService();
