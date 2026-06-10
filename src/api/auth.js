import client, { executeRequest, mockDb } from './client';

/**
 * Sign in a user with username and password.
 * Backend endpoint: POST /api/login
 */
export const login = async (username, password) => {
  return executeRequest(
    () => client.post('/login', { username, password }),
    () => {
      const users = mockDb.getUsers();
      const user = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      
      if (!user || user.passwordHash !== password) {
        throw new Error('Invalid username or password. (Hint: use admin/admin123 or user/user123)');
      }
      
      // Store token, role, and username in localStorage
      const mockToken = `mock-jwt-token-for-${user.username}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', user.username);
      localStorage.setItem('fullName', user.fullName);
      
      return {
        token: mockToken,
        role: user.role,
        username: user.username,
        fullName: user.fullName
      };
    }
  );
};

/**
 * Change the logged-in user's password.
 * Backend endpoint: POST /api/change-password
 */
export const changePassword = async (currentPassword, newPassword) => {
  return executeRequest(
    () => client.post('/change-password', { currentPassword, newPassword }),
    () => {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('No user is currently logged in.');
      
      const users = mockDb.getUsers();
      const userIdx = users.findIndex((u) => u.username === username);
      
      if (userIdx === -1) throw new Error('User not found.');
      if (users[userIdx].passwordHash !== currentPassword) {
        throw new Error('Incorrect current password.');
      }
      
      users[userIdx].passwordHash = newPassword;
      mockDb.setUsers(users);
      return { success: true, message: 'Password changed successfully.' };
    }
  );
};
