
import React, { useMemo } from 'react';
import { storage } from '../services/storage';
import { Status } from '../types';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const students = storage.getStudents();
  const navigate = useNavigate();
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

  const urgentCases = useMemo(() => {
    return students.filter(s => s.sdq?.status === Status.PROBLEM || s.risk?.status === Status.PROBLEM).slice(0, 3);
  }, [students]);

  const cards = [
    { label: 'กลุ่มปกติ', count: stats.sdqNormal.count, percent: stats.sdqNormal.percent, color: 'from-emerald-400 to-teal-500', icon: '✅' },
    { label: 'กลุ่มเสี่ยง', count: stats.sdqRisk.count, percent: stats.sdqRisk.percent, color: 'from-amber-400 to-orange-500', icon: '⚠️' },
    { label: 'กลุ่มมีปัญหา', count: stats.sdqProblem.count, percent: stats.sdqProblem.percent, color: 'from-rose-400 to-red-600', icon: '🚨' },
    { label: 'เยี่ยมบ้านแล้ว', count: stats.homeVisits.count, percent: stats.homeVisits.percent, color: 'from-blue-400 to-indigo-600', icon: '🏠' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <span className="bg-blue-600 text-white p-2 rounded-2xl shadow-lg shadow-blue-200">📊</span>
            ภาพรวมระบบดูแลช่วยเหลือนักเรียน
          </h1>
          <p className="text-gray-500 font-medium mt-1">ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลปีการศึกษา 2025</p>
        </div>
        <div className="px-5 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm text-blue-600 font-bold">
          📅 {today}
        </div>
      </header>

      {/* Hero Stats */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center border-b-[12px] border-black/10">
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">Total Enrollment</span>
          <h2 className="text-8xl font-black tracking-tighter">{stats.total}</h2>
          <p className="text-indigo-100 font-medium text-lg">นักเรียนทั้งหมดที่อยู่ในการดูแล</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8 md:mt-0 relative z-10 w-full md:w-auto">
           <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center">
              <p className="text-3xl font-black">{(stats.sdqProblem.count / (stats.total || 1) * 100).toFixed(1)}%</p>
              <p className="text-[10px] font-bold uppercase opacity-70">Case Problem Rate</p>
           </div>
           <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center">
              <p className="text-3xl font-black">{stats.homeVisits.count}</p>
              <p className="text-[10px] font-bold uppercase opacity-70">Visits Completed</p>
           </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-[15rem] opacity-5 pointer-events-none">🎓</div>
      </div>

      {/* Sub Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} rounded-[2.5rem] p-8 text-white shadow-xl relative transition-all hover:-translate-y-2 hover:shadow-2xl group cursor-default`}>
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <span className="text-xs font-black bg-black/10 px-3 py-1 rounded-full">{card.percent}%</span>
            </div>
            <h3 className="text-sm font-black opacity-80 uppercase tracking-widest mb-1">{card.label}</h3>
            <p className="text-4xl font-black">{card.count} <span className="text-xs font-medium opacity-60 italic">คน</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Urgent Attention List */}
         <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 shadow-xl border border-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-rose-500 rounded-full"></span>
                นักเรียนที่ต้องดูแลเร่งด่วน
              </h3>
              <button onClick={() => navigate('/students')} className="text-sm font-black text-blue-600 hover:underline">ดูทั้งหมด →</button>
            </div>
            
            <div className="space-y-4">
               {urgentCases.length > 0 ? urgentCases.map((s, idx) => (
                 <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center font-black text-xl text-rose-500 border border-rose-50">
                          {s.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{s.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold text-gray-400 uppercase">ชั้น {s.grade}/{s.room}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="text-[10px] font-bold text-rose-500 uppercase">พบปัญหาด้าน {s.sdq?.status === Status.PROBLEM ? 'พฤติกรรม (SDQ)' : 'ความเสี่ยง (Risk)'}</span>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/student/${s.id}`)}
                      className="p-4 bg-white text-gray-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                      👁️
                    </button>
                 </div>
               )) : (
                 <div className="text-center py-20 bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium italic">ยังไม่พบนักเรียนในกลุ่มที่ต้องดูแลเร่งด่วน ยอดเยี่ยมมาก!</p>
                 </div>
               )}
            </div>
         </div>

         {/* Recommendation Engine */}
         <div className="glass-card rounded-[3rem] p-10 bg-gradient-to-b from-blue-50 to-indigo-50 border border-white shadow-xl flex flex-col">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-blue-200">
               💡
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-4">ข้อแนะนำประจำวัน</h3>
            <div className="space-y-4 flex-1">
               <div className="bg-white/60 p-5 rounded-2xl border border-white text-sm text-blue-800 leading-relaxed shadow-sm">
                 <p className="font-bold mb-2">📌 ติดตามผล SDQ</p>
                 มีนักเรียน <b>{stats.sdqProblem.count}</b> คนที่ผลประเมินอยู่ในเกณฑ์ "มีปัญหา" ครูควรเริ่มนัดหมายเพื่อพูดคุยรายบุคคล
               </div>
               <div className="bg-white/60 p-5 rounded-2xl border border-white text-sm text-blue-800 leading-relaxed shadow-sm">
                 <p className="font-bold mb-2">🏠 แผนการเยี่ยมบ้าน</p>
                 ดำเนินการไปแล้ว <b>{stats.homeVisits.count}</b> ราย จากทั้งหมด <b>{stats.total}</b> ราย คิดเป็น <b>{stats.homeVisits.percent}%</b> ของเป้าหมาย
               </div>
            </div>
            <button 
              onClick={() => navigate('/students')}
              className="w-full mt-8 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              จัดการรายชื่อนักเรียน
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
