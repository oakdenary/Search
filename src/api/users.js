import client, { executeRequest, mockDb } from './client';

/**
 * Get list of all users.
 * Backend endpoint: GET /api/users
 */
export const getUsers = async () => {
  return executeRequest(
    () => client.get('/users'),
    () => {
      // Return users without passwords for security
      const users = mockDb.getUsers();
      return users.map(({ passwordHash, ...rest }) => rest);
    }
  );
};

/**
 * Register a new user.
 * Backend endpoint: POST /api/users
 * Request: { username, fullName, password }
 */
export const registerUser = async (username, fullName, password) => {
  return executeRequest(
    () => client.post('/users', { username, fullName, password }),
    () => {
      const users = mockDb.getUsers();
      
      // Validation: username must be unique
      const exists = users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (exists) {
        throw new Error(`Username "${username}" is already taken.`);
      }

      // Password must be at least 8 characters
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      
      const newUserId = String(users.length + 1);
      const newUser = {
        id: newUserId,
        username: username.trim(),
        fullName: fullName.trim(),
        role: 'user', // newly registered users are 'user' by default
        passwordHash: password,
      };
      
      users.push(newUser);
      mockDb.setUsers(users);
      
      // Initialize folder permissions: default to empty array
      const perms = mockDb.getPermissions();
      perms[newUserId] = [];
      mockDb.setPermissions(perms);
      
      return {
        success: true,
        message: `User "${username}" registered successfully.`,
        user: { id: newUserId, username: newUser.username, fullName: newUser.fullName, role: newUser.role },
      };
    }
  );
};

/**
 * Get folder access list for a specific user ID.
 * Backend endpoint: GET /api/users/:id/access
 */
export const getUserAccess = async (userId) => {
  return executeRequest(
    () => client.get(`/users/${userId}/access`),
    () => {
      const perms = mockDb.getPermissions();
      return perms[userId] || [];
    }
  );
};

/**
 * Grant a user access to a folder.
 * Backend endpoint: POST /api/access/grant
 * Request: { userId, folderId }
 */
export const grantAccess = async (userId, folderId) => {
  return executeRequest(
    () => client.post('/access/grant', { userId, folderId }),
    () => {
      const perms = mockDb.getPermissions();
      if (!perms[userId]) {
        perms[userId] = [];
      }
      if (!perms[userId].includes(folderId)) {
        perms[userId].push(folderId);
        mockDb.setPermissions(perms);
      }
      return { success: true, message: 'Access granted successfully.' };
    }
  );
};

/**
 * Revoke a user's access to a folder.
 * Backend endpoint: POST /api/access/revoke
 * Request: { userId, folderId }
 */
export const revokeAccess = async (userId, folderId) => {
  return executeRequest(
    () => client.post('/access/revoke', { userId, folderId }),
    () => {
      const perms = mockDb.getPermissions();
      if (perms[userId]) {
        perms[userId] = perms[userId].filter((id) => id !== folderId);
        mockDb.setPermissions(perms);
      }
      return { success: true, message: 'Access revoked successfully.' };
    }
  );
};
