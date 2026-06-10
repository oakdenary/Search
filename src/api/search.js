import client, { executeRequest, mockDb } from './client';

/**
 * Search documents matching query and folder constraints.
 * Backend endpoint: POST /api/search
 * Request: { query: string, folder: string }
 */
export const searchDocuments = async (query = '', folder = '') => {
  return executeRequest(
    () => client.post('/search', { query, folder }),
    () => {
      const allDocs = mockDb.getDocuments();
      const allFolders = mockDb.getFolders();
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');
      
      let allowedFolderIds = [];
      
      if (role === 'admin') {
        // Admins can search all folders
        allowedFolderIds = allFolders.map((f) => f.id);
      } else {
        // Fetch user permissions
        const users = mockDb.getUsers();
        const user = users.find((u) => u.username === username);
        if (user) {
          const perms = mockDb.getPermissions();
          allowedFolderIds = perms[user.id] || [];
        }
      }
      
      // 1. Filter by allowed folders (role-based security)
      let results = allDocs.filter((doc) => allowedFolderIds.includes(doc.folder));
      
      // 2. Filter by specific folder dropdown selection
      if (folder && folder !== '') {
        results = results.filter((doc) => doc.folder === folder);
      }
      
      // 3. Filter by search query text
      if (query && query.trim() !== '') {
        const queryLower = query.toLowerCase().trim();
        results = results.filter(
          (doc) =>
            doc.title.toLowerCase().includes(queryLower) ||
            doc.snippet.toLowerCase().includes(queryLower)
        );
      }
      
      // Map folder ID to folder name for result display
      return results.map((doc) => {
        const folderObj = allFolders.find((f) => f.id === doc.folder);
        return {
          ...doc,
          folderName: folderObj ? folderObj.name : doc.folder,
          // Add slightly randomized similarity score if matching text query, to look authentic
          similarityScore: query && query.trim() !== ''
            ? Math.min(0.99, Math.max(0.65, doc.similarityScore + (Math.random() - 0.5) * 0.08))
            : doc.similarityScore
        };
      });
    }
  );
};
