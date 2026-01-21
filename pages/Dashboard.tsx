
import React, { useMemo } from 'react';
import { storage } from '../services/storage';
import { Status } from '../types';

const Dashboard: React.FC = () => {
  const students = storage.getStudents();
  const today = new Date().toLocaleDateString('th-TH', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const stats = useMemo(() => {
    const total = students.length;
    const sdqNormal = students.filter(s => s.sdq?.status === Status.NORMAL).length;
    const sdqRisk = students.filter(s => s.sdq?.status === Status.RISK).length;
    const sdqProblem = students.filter(s => s.sdq?.status === Status.PROBLEM).length;
    const homeVisits = students.filter(s => s.homeVisit).length;

    const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

    return {
      total,
      sdqNormal: { count: sdqNormal, percent: getPercent(sdqNormal) },
      sdqRisk: { count: sdqRisk, percent: getPercent(sdqRisk) },
      sdqProblem: { count: sdqProblem, percent: getPercent(sdqProblem) },
      homeVisits: { count: homeVisits, percent: getPercent(homeVisits) }
    };
  }, [students]);

  const cards = [
    { label: 'นักเรียนกลุ่มปกติ', count: stats.sdqNormal.count, percent: stats.sdqNormal.percent, color: 'bg-[#4db6ac]', icon: '📁' },
    { label: 'นักเรียนกลุ่มเสี่ยง', count: stats.sdqRisk.count, percent: stats.sdqRisk.percent, color: 'bg-[#81c784]', icon: '📁' },
    { label: 'นักเรียนกลุ่มมีปัญหา', count: stats.sdqProblem.count, percent: stats.sdqProblem.percent, color: 'bg-[#ffb74d]', icon: '📁' },
    { label: 'เยี่ยมบ้านแล้ว', count: stats.homeVisits.count, percent: stats.homeVisits.percent, color: 'bg-[#e57373]', icon: '📁' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">แดชบอร์ด</h1>
        </div>
        <div className="text-sm text-gray-500 font-medium">{today}</div>
      </header>

      {/* Main Large Card (Purple one from image 2) */}
      <div className="bg-[#6b21a8] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex justify-between items-center border-b-8 border-purple-900/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-lg">จำนวนนักเรียนทั้งหมด</span>
          </div>
          <h2 className="text-7xl font-black mb-2">{stats.total}</h2>
          <p className="text-purple-200 font-medium">นักเรียนในระบบดูแลช่วยเหลือ</p>
        </div>
        <div className="text-9xl opacity-20 transform -rotate-12 translate-x-4">📋</div>
      </div>

      {/* Metric Cards Grid (Same style as folders in images) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} rounded-[2rem] p-8 text-white shadow-xl relative transition-transform hover:-translate-y-2 border-b-8 border-black/10`}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-4xl">{card.icon}</span>
              <span className="text-xl font-bold opacity-70">{card.percent}%</span>
            </div>
            
            <h3 className="text-lg font-bold mb-1 opacity-90">{card.label}</h3>
            <p className="text-4xl font-black mb-6">{card.count} <span className="text-sm font-normal opacity-70">คน</span></p>
            
            {/* Progress Bar inside card */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
               <div className="bg-white h-full rounded-full shadow-sm" style={{ width: `${card.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section (Optional additional details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
         <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">📢 สถานะการคัดกรองล่าสุด</h3>
            <div className="space-y-4">
               {students.slice(0, 5).map((s, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                       <div>
                          <p className="font-bold text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-500">ชั้น {s.grade}/{s.room}</p>
                       </div>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-xs font-bold ${s.sdq?.status === Status.NORMAL ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {s.sdq?.status || 'ยังไม่ประเมิน'}
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="glass-card rounded-[2.5rem] p-8 bg-blue-50/50">
            <h3 className="text-xl font-bold text-blue-800 mb-4">💡 แนะนำด่วน</h3>
            <p className="text-sm text-blue-600 leading-relaxed mb-6">
               มีนักเรียน <b>{stats.sdqProblem.count}</b> คนที่อยู่ในกลุ่มมีปัญหา ควรดำเนินการเยี่ยมบ้านและให้คำปรึกษาเบื้องต้นโดยเร็วที่สุด
            </p>
            <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
               ดูรายชื่อทั้งหมด
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
