
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'admin';

  const menuItems = [
    { path: '/', label: 'แดชบอร์ด', icon: '📊' },
    { path: '/students', label: 'จัดการรายชื่อนักเรียน', icon: '👥' },
    { path: '/reports', label: 'ดาวน์โหลดเอกสาร', icon: '📁' },
  ];

  if (isAdmin) {
    menuItems.push({ path: '/teachers', label: 'จัดการคุณครู/ผู้ใช้งาน', icon: '👤' });
  } else {
    menuItems.push({ path: '/profile-edit', label: 'แก้ไขข้อมูลส่วนตัว', icon: '👤' });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`fixed left-0 top-0 h-full w-72 flex flex-col z-50 transition-all duration-300 shadow-2xl ${isAdmin ? 'sidebar-admin' : 'sidebar-teacher'}`}>
      {/* Header Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">ระบบจัดเก็บข้อมูล</h1>
            <p className="text-xs text-white/70">{isAdmin ? 'Admin Panel' : 'Teacher Panel'}</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white/10 rounded-2xl p-4 flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/20 flex items-center justify-center text-xl">
             {isAdmin ? '👤' : '👩‍🏫'}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white truncate">{user.username}</h2>
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{isAdmin ? 'ผู้ดูแลระบบ' : 'คุณครู'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 p-4 rounded-2xl transition-all group ${
                isActive(item.path)
                  ? 'active-menu-item text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto p-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl shadow-xl transition-all transform active:scale-95 font-bold"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
