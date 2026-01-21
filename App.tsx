
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import TeacherManagement from './pages/TeacherManagement';
import Assessment from './pages/Assessment';
import Profile from './pages/Profile';
import ReportDownload from './pages/ReportDownload';
import Sidebar from './components/Sidebar';
import { User } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getAuth();
    if (savedUser) setUser(savedUser);
    setIsLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    storage.setAuth(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    storage.setAuth(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F3F6F9]">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
           <p className="text-blue-500 font-bold animate-pulse">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`flex min-h-screen ${!user ? 'login-vibrant-bg' : 'bg-[#F3F6F9]'}`}>
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${user ? 'md:ml-72' : ''}`}>
          <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route 
                  path="/login" 
                  element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/" 
                  element={user ? <Dashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/students" 
                  element={user ? <StudentList /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/teachers" 
                  element={user?.role === 'admin' ? <TeacherManagement /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/student/:id" 
                  element={user ? <Profile /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/assessment/:type/:studentId" 
                  element={user ? <Assessment /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/reports" 
                  element={user ? <ReportDownload /> : <Navigate to="/login" />} 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            
            {/* Global Footer - Visible on all pages including Login */}
            <footer className={`mt-12 pt-8 pb-8 text-center ${!user ? '' : 'border-t border-gray-200'}`}>
              <div className={`${!user ? 'bg-white/20 backdrop-blur-md' : 'bg-white/60'} inline-block px-8 py-3 rounded-2xl shadow-lg border border-white/20`}>
                <p className={`text-[16px] font-black tracking-tight ${!user ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
                  Freeman @ Cpoy Right Krukai ฝากแชร์ ฝากติดตามด้วยนะครับ
                </p>
              </div>
              <div className={`mt-3 text-[10px] font-bold uppercase tracking-[0.2em] ${!user ? 'text-white/80 drop-shadow-sm' : 'text-gray-400'}`}>
                © 2025 Student Care System • Built with Excellence
              </div>
            </footer>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
