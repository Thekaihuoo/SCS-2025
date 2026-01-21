
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Status, EQLevel, Student } from '../types';
import { SDQ_QUESTIONS } from '../constants';
import Swal from 'sweetalert2';

const Assessment: React.FC = () => {
  const { type, studentId } = useParams<{ type: string, studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);

  // Form states
  const [sdqAnswers, setSdqAnswers] = useState<Record<number, number>>({});
  const [eqScores, setEqScores] = useState<number[]>(new Array(3).fill(2)); // Default to 'Normal'
  const [riskChecklist, setRiskChecklist] = useState({
    academic: false, health: false, behavior: false, economy: false, protection: false, other: false
  });

  useEffect(() => {
    const students = storage.getStudents();
    const found = students.find(s => s.id === studentId);
    if (found) {
      setStudent(found);
      // Pre-fill if exists
      if (type === 'sdq' && found.sdq) {
        // Re-calculate or use stored - normally we start fresh for new assessment
      }
    }
  }, [studentId, type]);

  const handleSdqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (Object.keys(sdqAnswers).length < 25) {
      Swal.fire({
        title: 'ตอบไม่ครบ!',
        text: `กรุณาตอบคำถามให้ครบ 25 ข้อ (ตอบแล้ว ${Object.keys(sdqAnswers).length} ข้อ)`,
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const scores = { emotional: 0, conduct: 0, hyperactivity: 0, peer: 0, prosocial: 0 };
    
    SDQ_QUESTIONS.forEach(q => {
      let val = sdqAnswers[q.id];
      if (q.reverse) {
        val = val === 0 ? 2 : val === 2 ? 0 : 1;
      }
      scores[q.type as keyof typeof scores] += val;
    });

    const totalDifficulties = scores.emotional + scores.conduct + scores.hyperactivity + scores.peer;
    let status = Status.NORMAL;
    if (totalDifficulties >= 20) status = Status.PROBLEM;
    else if (totalDifficulties >= 16) status = Status.RISK;

    const updated = {
      ...student,
      sdq: { ...scores, totalDifficulties, status, updatedAt: new Date().toISOString() }
    };

    storage.updateStudent(updated);
    Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: `คะแนนความยากลำบากรวม: ${totalDifficulties} (${status === Status.NORMAL ? 'ปกติ' : status === Status.RISK ? 'กลุ่มเสี่ยง' : 'กลุ่มมีปัญหา'})`,
      icon: 'success',
      confirmButtonColor: '#3b82f6'
    });
    navigate(`/student/${student.id}`);
  };

  const handleEqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const total = eqScores.reduce((a, b) => a + b, 0);
    let level = EQLevel.NORMAL;
    if (total >= 10) level = EQLevel.HIGH;
    else if (total <= 5) level = EQLevel.NEEDS_IMPROVEMENT;

    const updated = {
      ...student,
      eq: { good: eqScores[0], smart: eqScores[1], happy: eqScores[2], total, level, updatedAt: new Date().toISOString() }
    };
    storage.updateStudent(updated);
    Swal.fire('สำเร็จ', 'บันทึกข้อมูล EQ เรียบร้อย', 'success');
    navigate(`/student/${student.id}`);
  };

  const handleRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const count = Object.values(riskChecklist).filter(v => v).length;
    let status = Status.NORMAL;
    if (count >= 3) status = Status.PROBLEM;
    else if (count >= 1) status = Status.RISK;

    const updated = {
      ...student,
      risk: { ...riskChecklist, family: riskChecklist.protection, status, updatedAt: new Date().toISOString() }
    };
    storage.updateStudent(updated);
    Swal.fire('สำเร็จ', 'บันทึกการคัดกรองความเสี่ยงเรียบร้อย', 'success');
    navigate(`/student/${student.id}`);
  };

  if (!student) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
        >
          ⬅️
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-800">
            {type === 'sdq' ? 'ประเมินพฤติกรรม (SDQ)' : type === 'eq' ? 'ประเมินความฉลาดทางอารมณ์' : 'คัดกรองความเสี่ยง 7 ด้าน'}
          </h1>
          <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">นักเรียน: {student.name} ({student.id})</p>
        </div>
      </header>

      <div className="glass-card rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white">
        {type === 'sdq' && (
          <form onSubmit={handleSdqSubmit} className="space-y-10">
            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-xl font-black mb-1">📋 แบบประเมิน SDQ</h4>
                <p className="text-blue-100 text-sm opacity-80 font-medium italic">สำหรับประเมินพฤติกรรมในช่วง 6 เดือนที่ผ่านมา</p>
              </div>
              <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md text-sm font-black border border-white/20">
                ตอบแล้ว {Object.keys(sdqAnswers).length} / 25 ข้อ
              </div>
            </div>
            
            <div className="space-y-2">
              {SDQ_QUESTIONS.map((q, idx) => (
                <div key={q.id} className={`p-6 rounded-3xl transition-all border ${sdqAnswers[q.id] !== undefined ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-80'}`}>
                  <p className="font-bold text-gray-800 mb-6 flex items-start gap-4">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">{q.id}</span>
                    <span className="mt-1.5">{q.text}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 0, label: 'ไม่จริง' },
                      { val: 1, label: 'ค่อนข้างจริง' },
                      { val: 2, label: 'จริงแน่นอน' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSdqAnswers({ ...sdqAnswers, [q.id]: opt.val })}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          sdqAnswers[q.id] === opt.val 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                            : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 text-lg">
              ส่งแบบประเมินและประมวลผล
            </button>
          </form>
        )}

        {type === 'risk' && (
          <form onSubmit={handleRiskSubmit} className="space-y-10">
            <div className="bg-orange-500 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-100">
               <h4 className="text-xl font-black mb-1">🚨 แบบคัดกรองความเสี่ยง</h4>
               <p className="text-orange-100 text-sm font-medium">ทำเครื่องหมายหน้าหัวข้อที่นักเรียน "มี" พฤติกรรมหรือสภาวะตามที่ระบุ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'academic', title: 'การเรียน', icon: '📚', desc: 'GPA ต่ำ, ขาดเรียนบ่อย' },
                { key: 'health', title: 'สุขภาพ', icon: '🏥', desc: 'ป่วยเรื้อรัง, บกพร่องร่างกาย' },
                { key: 'behavior', title: 'พฤติกรรม', icon: '🎭', desc: 'ก้าวร้าว, ซึมเศร้า, สมาธิสั้น' },
                { key: 'economy', title: 'เศรษฐกิจ', icon: '💰', desc: 'ฐานะยากจนมาก' },
                { key: 'protection', title: 'การคุ้มครอง', icon: '🛡️', desc: 'ครอบครัวแตกแยก, มีความเสี่ยงทางบ้าน' },
                { key: 'other', title: 'อื่นๆ', icon: '⚠️', desc: 'ยาเสพติด, ชู้สาว, ติดเกม' }
              ].map((section) => (
                <label key={section.key} className={`flex items-start gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all ${riskChecklist[section.key as keyof typeof riskChecklist] ? 'bg-orange-50 border-orange-500 shadow-lg' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                  <input
                    type="checkbox"
                    className="mt-1 w-6 h-6 rounded-lg text-orange-500"
                    checked={riskChecklist[section.key as keyof typeof riskChecklist]}
                    onChange={(e) => setRiskChecklist({ ...riskChecklist, [section.key]: e.target.checked })}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{section.icon}</span>
                      <p className="font-black text-gray-800">ด้าน{section.title}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{section.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="w-full py-6 bg-orange-600 text-white font-black rounded-[2rem] shadow-2xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all active:scale-95 text-lg">
              บันทึกผลการคัดกรอง
            </button>
          </form>
        )}

        {type === 'eq' && (
          <form onSubmit={handleEqSubmit} className="space-y-10">
            <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-100">
               <h4 className="text-xl font-black mb-1">✨ แบบประเมิน EQ</h4>
               <p className="text-emerald-100 text-sm font-medium">ความฉลาดทางอารมณ์: เก่ง ดี มีสุข</p>
            </div>

            <div className="space-y-12 py-6">
              {[
                { label: 'ด้านความเก่ง (Smart)', icon: '🧠', color: 'text-blue-500' },
                { label: 'ด้านความดี (Good)', icon: '🤝', color: 'text-emerald-500' },
                { label: 'ด้านความสุข (Happy)', icon: '😊', color: 'text-pink-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="font-black text-gray-700 uppercase tracking-tight">{item.label}</p>
                    </div>
                    <div className={`px-5 py-2 rounded-2xl bg-gray-100 font-black text-xl ${item.color}`}>
                      {eqScores[idx]}
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <input 
                      type="range" min="1" max="4" step="1" 
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500 shadow-inner"
                      value={eqScores[idx]}
                      onChange={(e) => {
                        const newScores = [...eqScores];
                        newScores[idx] = parseInt(e.target.value);
                        setEqScores(newScores);
                      }}
                    />
                    <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">
                      <span>ต้องปรับปรุง</span>
                      <span>ปกติ</span>
                      <span>ดี</span>
                      <span>สูงกว่าปกติ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full py-6 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 text-lg">
              บันทึกผลการประเมิน EQ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Assessment;
