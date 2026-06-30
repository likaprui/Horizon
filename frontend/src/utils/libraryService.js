/**
 * HORIZON TRADING LIBRARY - Service Layer
 * localStorage ONLY - No server needed
 */

// ============================================
// LOCAL STORAGE SERVICE
// ============================================

export const LibraryStorage = {
  /**
   * Save all annotations for a book
   */
  saveAll: (bookId, { highlights, notes, bookmarks, readingProgress }) => {
    try {
      const state = {
        bookId,
        highlights,
        notes,
        bookmarks,
        readingProgress,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(`library_${bookId}`, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('[LibraryStorage] Save failed:', e);
      return false;
    }
  },

  /**
   * Load all annotations for a book
   */
  loadAll: (bookId) => {
    try {
      const data = localStorage.getItem(`library_${bookId}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('[LibraryStorage] Load failed:', e);
      return null;
    }
  },

  /**
   * Clear all annotations for a book
   */
  clear: (bookId) => {
    try {
      localStorage.removeItem(`library_${bookId}`);
      return true;
    } catch (e) {
      console.error('[LibraryStorage] Clear failed:', e);
      return false;
    }
  },

  /**
   * Export annotations for a book (JSON download)
   */
  export: (bookId) => {
    const data = LibraryStorage.loadAll(bookId);
    if (!data) return null;
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import annotations for a book
   */
  import: (bookId, jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem(`library_${bookId}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[LibraryStorage] Import failed:', e);
      return false;
    }
  }
};

// ============================================
// SYNC MANAGER - Simple debounce (localStorage only)
// ============================================

export const SyncManager = {
  syncTimer: null,
  SYNC_DELAY: 1000, // 1 second debounce

  /**
   * Queue an annotation change - saves to localStorage only
   */
  queueSync: (userId, bookId, annotations) => {
    return new Promise((resolve) => {
      // Clear previous timer
      if (SyncManager.syncTimer) {
        clearTimeout(SyncManager.syncTimer);
      }

      // Schedule localStorage save
      SyncManager.syncTimer = setTimeout(() => {
        LibraryStorage.saveAll(bookId, annotations);
        console.log('[SyncManager] Saved to localStorage');
        resolve({ synced: true, local: true });
      }, SyncManager.SYNC_DELAY);
    });
  },

  /**
   * Force immediate save to localStorage
   */
  syncNow: async (userId, bookId, annotations) => {
    LibraryStorage.saveAll(bookId, annotations);
    console.log('[SyncManager] Saved to localStorage');
    return { synced: true, local: true };
  }
};

// ============================================
// API SERVICE (Stub for future backend)
// ============================================

export const LibraryAPI = {
  // Placeholder for future backend integration
  // When you add server later, implement these:
  // - syncAnnotations()
  // - fetchBooks()
  // - updateProgress()
  enabled: false
};