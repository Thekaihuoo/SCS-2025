
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full glass-card p-12 rounded-[3rem] shadow-2xl space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden mx-auto mb-6 p-2">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
              alt="System Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">SCS 2025</h2>
          <p className="text-gray-400 font-medium">Student Care System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
              placeholder="Username / รหัสครู"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transform active:scale-95 transition-all text-lg"
          >
            ลงชื่อเข้าใช้งาน
          </button>
        </form>

        <div className="pt-6 text-center text-xs font-bold text-gray-300 uppercase tracking-widest border-t border-gray-100">
           Admin: admin / 0000
        </div>
      </div>
    </div>
  );
};

export default Login;
