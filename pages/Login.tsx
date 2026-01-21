
import React, { useState } from 'react';
import { User } from '../types';
import Swal from 'sweetalert2';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '0000') {
      onLogin({ username: 'Administrator', role: 'admin' });
      Swal.fire({ title: 'สำเร็จ!', text: 'ยินดีต้อนรับ Admin', icon: 'success', confirmButtonColor: '#6b21a8' });
    } else if (username.startsWith('T') && password) {
      onLogin({ username: `Teacher ${username}`, role: 'teacher', teacherId: username });
      Swal.fire({ title: 'สำเร็จ!', text: 'เข้าสู่ระบบคุณครู', icon: 'success', confirmButtonColor: '#3b82f6' });
    } else {
      Swal.fire({ title: 'ผิดพลาด!', text: 'Username หรือ Password ไม่ถูกต้อง', icon: 'error' });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10">
      <div className="max-w-md w-full glass-card p-10 md:p-14 rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] space-y-10 animate-fade-in border border-white/40">
        <div className="text-center">
          <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden mx-auto mb-8 p-3 ring-8 ring-white/30 transform hover:scale-110 transition-transform duration-500">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
              alt="System Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-2 tracking-tight">SCS 2025</h2>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Student Care System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Username / รหัสครู</label>
              <input
                type="text"
                required
                className="w-full px-8 py-5 rounded-3xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-8 focus:ring-blue-100 shadow-inner"
                placeholder="ระบุชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Password</label>
              <input
                type="password"
                required
                className="w-full px-8 py-5 rounded-3xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-8 focus:ring-blue-100 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(79,70,229,0.5)] hover:-translate-y-1 transform active:scale-95 transition-all text-xl tracking-tight"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="pt-4 text-center">
           <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em]">
             ระบบดูแลช่วยเหลือนักเรียน เวอร์ชั่น 2025
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
