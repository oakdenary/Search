import client, { executeRequest, mockDb } from './client';

/**
 * Get all available folders.
 * Backend endpoint: GET /api/folders
 */
export const getFolders = async () => {
  return executeRequest(
    () => client.get('/folders'),
    () => {
      return mockDb.getFolders();
    }
  );
};

/**
 * Create a new folder.
 * Backend endpoint: POST /api/folders
 * Request: { name: string, description: string }
 */
export const createFolder = async (name, description) => {
  return executeRequest(
    () => client.post('/folders', { name, description }),
    () => {
      const folders = mockDb.getFolders();
      
      // Validation: folder name must be unique
      const exists = folders.some((f) => f.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) {
        throw new Error(`A folder named "${name}" already exists.`);
      }
      
      const folderId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const newFolder = {
        id: folderId,
        name: name.trim(),
        description: description.trim(),
      };
      
      folders.push(newFolder);
      mockDb.setFolders(folders);
      
      // Auto-grant access to admin user for convenience in mock mode
      const perms = mockDb.getPermissions();
      if (perms['1'] && !perms['1'].includes(folderId)) {
        perms['1'].push(folderId);
        mockDb.setPermissions(perms);
      }
      
      return {
        success: true,
        message: `Folder "${name}" created successfully.`,
        folder: newFolder,
      };
    }
  );
};
