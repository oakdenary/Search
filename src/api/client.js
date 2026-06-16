import axios from 'axios';

// Create the Axios client pointing to the backend API base url.
// During development, it can point to localhost or relative '/api' proxied by Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all requests
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- MOCK DATABASE FOR OFFLINE DEMO MODE ---
// This enables a junior developer or designer to fully test and use the application
// without having to configure and run the Python/OpenSearch backend locally.

const DEFAULT_USERS = [
  { id: '1', username: 'admin', fullName: 'Admin User', role: 'admin', passwordHash: 'admin123' },
  { id: '2', username: 'user', fullName: 'Jane Doe', role: 'user', passwordHash: 'user123' },
];

const DEFAULT_FOLDERS = [
  { id: 'marketing', name: 'Marketing', description: 'Public marketing files and social media assets.' },
  { id: 'finance', name: 'Finance', description: 'Financial statements, budgeting Excel sheets, and tax audits.' },
  { id: 'engineering', name: 'Engineering', description: 'Technical design documents, API specifications, and code guides.' },
  { id: 'hr', name: 'HR Policies', description: 'Employee onboarding docs, health insurance policies, and handbook.' },
];

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-test-1',
    title: 'test_marketing_campaign_q1.pdf',
    folder: 'marketing',
    similarityScore: 0.95,
    snippet: '...This is a test marketing strategy designed to analyze enterprise click-through rates. Make sure to log test results in the internal spreadsheet...',
  },
  {
    id: 'doc-test-2',
    title: 'test_engineering_api_specs.json',
    folder: 'engineering',
    similarityScore: 0.92,
    snippet: '...OpenSearch search indices test configuration guidelines. Defines the default mappings and properties for testing document queries...',
  },
  {
    id: 'doc-test-3',
    title: 'test_finance_balance_sheet.xlsx',
    folder: 'finance',
    similarityScore: 0.89,
    snippet: '...Testing budget constraints and simulated transactions. The financial data represents a mock test run for audit compatibility...',
  },
  {
    id: 'doc-test-4',
    title: 'test_hr_safety_guidelines.docx',
    folder: 'hr',
    similarityScore: 0.87,
    snippet: '...This is a draft version of the employee handbook. For internal testing and training purposes only...',
  },
  {
    id: 'doc-1',
    title: 'Q4_Marketing_Playbook.pdf',
    folder: 'marketing',
    similarityScore: 0.94,
    snippet: '...The primary objective is to scale user acquisition through automated newsletters and targeted blueish-gradient landing pages. We anticipate a 14% improvement in CTR...',
  },
  {
    id: 'doc-2',
    title: 'Vercel_Design_System_Inspired_Guide.docx',
    folder: 'marketing',
    similarityScore: 0.82,
    snippet: '...Ensure spacing is strictly aligned to a 4px/8px grid. Background colors should be slate-50/100, text should use Plus Jakarta Sans, and borders should be subtle (slate-200)...',
  },
  {
    id: 'doc-3',
    title: 'Annual_Budget_Allocation_2026.xlsx',
    folder: 'finance',
    similarityScore: 0.88,
    snippet: '...Allocating $240K for cloud infrastructure hosting fees (including OpenSearch cluster and Python server instances). Marketing tooling gets $45K. HR systems get $12K...',
  },
  {
    id: 'doc-4',
    title: 'OpenSearch_Index_Mapping_Specs.json',
    folder: 'engineering',
    similarityScore: 0.91,
    snippet: '...Document search requires standard text match analyzer with custom word delimiters. Similarity score calculations use BM25 algorithm with default parameters...',
  },
  {
    id: 'doc-5',
    title: 'Employee_Onboarding_Handbook_v3.pdf',
    folder: 'hr',
    similarityScore: 0.79,
    snippet: '...Deep Document Search is used by all employees to lookup policies. For folder access level requests, contact the system administrator through the profile portal...',
  },
  {
    id: 'doc-testa-1',
    title: 'testa_keyword_analysis_report.docx',
    folder: 'engineering',
    similarityScore: 0.96,
    snippet: '...The testa variable was referenced across multiple modules. Each testa instance maps to a unique identifier. Run testa validation before deployment...',
  },
];

// Map user ID to set of allowed folders (Default: admin has access to everything; Jane Doe has marketing and HR)
const DEFAULT_PERMISSIONS = {
  '1': ['marketing', 'finance', 'engineering', 'hr'], // admin
  '2': ['marketing', 'hr'], // user (Jane Doe)
};

// Initialize Mock DB in LocalStorage if not present
const initMockDB = () => {
  const isInitialized = localStorage.getItem('dd_db_initialized');
  const existingDocs = localStorage.getItem('dd_documents');
  
  // Force re-seed if the db is not initialized OR if the documents list is missing the new test documents
  const needsSeeding = !isInitialized || !existingDocs || !existingDocs.includes('test_') || !existingDocs.includes('doc-testa-1');

  if (needsSeeding) {
    localStorage.setItem('dd_users', JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('dd_folders', JSON.stringify(DEFAULT_FOLDERS));
    localStorage.setItem('dd_documents', JSON.stringify(DEFAULT_DOCUMENTS));
    localStorage.setItem('dd_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
    localStorage.setItem('dd_db_initialized', 'true');
  }
};

initMockDB();

// Helper functions to interact with Mock DB with automatic data validation and self-healing
export const mockDb = {
  getUsers: () => {
    try {
      const val = localStorage.getItem('dd_users');
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse dd_users, resetting.', e);
    }
    localStorage.setItem('dd_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  },
  setUsers: (users) => localStorage.setItem('dd_users', JSON.stringify(users)),
  
  getFolders: () => {
    try {
      const val = localStorage.getItem('dd_folders');
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse dd_folders, resetting.', e);
    }
    localStorage.setItem('dd_folders', JSON.stringify(DEFAULT_FOLDERS));
    return DEFAULT_FOLDERS;
  },
  setFolders: (folders) => localStorage.setItem('dd_folders', JSON.stringify(folders)),
  
  getDocuments: () => {
    try {
      const val = localStorage.getItem('dd_documents');
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse dd_documents, resetting.', e);
    }
    localStorage.setItem('dd_documents', JSON.stringify(DEFAULT_DOCUMENTS));
    return DEFAULT_DOCUMENTS;
  },
  setDocuments: (docs) => localStorage.setItem('dd_documents', JSON.stringify(docs)),
  
  getPermissions: () => {
    try {
      const val = localStorage.getItem('dd_permissions');
      if (val) {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse dd_permissions, resetting.', e);
    }
    localStorage.setItem('dd_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
    return DEFAULT_PERMISSIONS;
  },
  setPermissions: (perms) => localStorage.setItem('dd_permissions', JSON.stringify(perms)),
  
  // Get active session user
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    if (!token) return null;
    
    const users = mockDb.getUsers();
    return users.find(u => u.username === username) || { username, role, fullName: username === 'admin' ? 'Admin User' : 'Jane Doe' };
  }
};

/**
 * Executes a network API request. If it fails (e.g. backend server not running),
 * it runs the local mock fallback function after a brief delay to simulate latency.
 * This guarantees the application is functional offline and online.
 */
export const executeRequest = async (apiCall, mockFallback) => {
  // Let developers enable/disable mock fallback explicitly
  const forceMock = import.meta.env.VITE_FORCE_MOCK === 'true';
  
  if (forceMock) {
    console.log('[Demo Mode] Forcing local mock fallback.');
    await new Promise(resolve => setTimeout(resolve, 400)); // natural loading feel
    return mockFallback();
  }

  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    // Determine if we should fall back to demo mode:
    // 1. Network error (no response)
    // 2. HTTP 404 (backend route doesn't exist / proxy fallback)
    // 3. HTTP 5xx (server or proxy gateway errors)
    const shouldFallback = !error.response || 
                           error.code === 'ERR_NETWORK' || 
                           error.response.status === 404 || 
                           error.response.status >= 500;

    if (shouldFallback) {
      console.warn(`[Demo Mode] Request failed (Status: ${error.response?.status || 'Network Error'}). Falling back to local storage database.`);
      window.isDemoMode = true;
      await new Promise(resolve => setTimeout(resolve, 400)); // natural loading feel
      return mockFallback();
    }
    
    // If backend did respond with business logic error (like 401 or 403), propagate it
    throw error;
  }
};

export default client;
