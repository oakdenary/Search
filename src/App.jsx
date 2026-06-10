import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Import Pages
import Login from './pages/Login';
import Search from './pages/Search';
import Upload from './pages/Upload';
import FolderAccess from './pages/FolderAccess';
import FolderManagement from './pages/FolderManagement';
import RegisterUser from './pages/RegisterUser';
import Profile from './pages/Profile';

function App() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if client has fallen back to offline demo mode
    const checkDemoMode = () => {
      if (window.isDemoMode) {
        setIsDemoMode(true);
      }
    };
    
    // Check immediately and then poll periodically
    checkDemoMode();
    const interval = setInterval(checkDemoMode, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans relative overflow-hidden">
        {/* Fading grid overlay on top half of all pages */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-0 light-grid-bg" />

        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative z-10">
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin-only Routes */}
            <Route
              path="/folder-access"
              element={
                <AdminRoute>
                  <FolderAccess />
                </AdminRoute>
              }
            />
            
            <Route
              path="/folders"
              element={
                <AdminRoute>
                  <FolderManagement />
                </AdminRoute>
              }
            />
            
            <Route
              path="/register-user"
              element={
                <AdminRoute>
                  <RegisterUser />
                </AdminRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </main>

        {/* Demo Mode Status Indicator (Floating badge in bottom-right corner) */}
        {isDemoMode && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-600/95 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/20 backdrop-blur-sm select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-100"></span>
            </span>
            <span>Demo Mode (Mock Database)</span>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
