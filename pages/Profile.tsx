
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { storage } from '../services/storage';
import { Student, Status, EQLevel, CounselingRecord } from '../types';
import Swal from 'sweetalert2';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);

  // Counseling States
  const [isCounselingOpen, setIsCounselingOpen] = useState(false);
  const [cRecord, setCRecord] = useState({ topic: '', detail: '', result: '' });

  useEffect(() => {
    const students = storage.getStudents();
    const found = students.find(s => s.id === id);
    if (found) setStudent(found);
  }, [id]);

  const radarData = useMemo(() => {
    if (!student?.sdq) return [];
    return [
      { subject: 'อารมณ์', value: student.sdq.emotional, fullMark: 10 },
      { subject: 'ประพฤติ', value: student.sdq.conduct, fullMark: 10 },
      { subject: 'สมาธิ', value: student.sdq.hyperactivity, fullMark: 10 },
      { subject: 'เพื่อน', value: student.sdq.peer, fullMark: 10 },
      { subject: 'สังคม', value: student.sdq.prosocial, fullMark: 10 },
    ];
  }, [student]);

  const handleSaveCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const newRecord: CounselingRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...cRecord
    };
    const updated: Student = {
      ...student,
      counseling: [newRecord, ...(student.counseling || [])]
    };
    storage.updateStudent(updated);
    setStudent(updated);
    setIsCounselingOpen(false);
    setCRecord({ topic: '', detail: '', result: '' });
    Swal.fire('สำเร็จ', 'บันทึกการติดตามผลเรียบร้อย', 'success');
  };

  if (!student) return null;

  const getSdqBarColor = (val: number, isProsocial: boolean = false) => {
    if (isProsocial) {
      if (val >= 6) return 'bg-emerald-500';
      if (val >= 4) return 'bg-amber-400';
      return 'bg-rose-500';
    }
    if (val <= 3) return 'bg-emerald-500';
    if (val <= 5) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const sdqDetails = [
    { label: 'ด้านอารมณ์', val: student.sdq?.emotional, icon: '🧠', desc: 'ความกังวล, ความเศร้า' },
    { label: 'ด้านความประพฤติ', val: student.sdq?.conduct, icon: '🛡️', desc: 'การทำตามกฎระเบียบ' },
    { label: 'ด้านสมาธิ/ไม่นิ่ง', val: student.sdq?.hyperactivity, icon: '⚡', desc: 'ความจดจ่อและการควบคุมตนเอง' },
    { label: 'สัมพันธภาพกับเพื่อน', val: student.sdq?.peer, icon: '🤝', desc: 'การเข้าสังคมกับเพื่อน' },
    { label: 'สัมพันธภาพทางสังคม', val: student.sdq?.prosocial, icon: '🌟', desc: 'ความเอื้อเฟื้อเผื่อแผ่', isProsocial: true }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4 max-w-7xl mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/students')} 
            className="w-14 h-14 bg-white shadow-xl rounded-[1.2rem] flex items-center justify-center hover:scale-105 transition-all border border-gray-100 text-xl active:scale-95"
          >
            ⬅️
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter">{student.name}</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                 ID: {student.id}
               </span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 ชั้น {student.grade}/{student.room}
               </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/assessment/sdq/${student.id}`} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">ประเมิน SDQ</Link>
          <Link to={`/assessment/risk/${student.id}`} className="px-5 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">คัดกรองเสี่ยง</Link>
          <Link to={`/assessment/eq/${student.id}`} className="px-5 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">ประเมิน EQ</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="w-36 h-36 bg-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-indigo-500 mb-6 border-8 border-white shadow-2xl mx-auto transform group-hover:rotate-6 transition-all duration-500 cursor-pointer overflow-hidden">
               {student.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-1">{student.name}</h3>
            <p className="text-sm text-gray-400 font-black mb-8 italic uppercase tracking-widest">"{student.nickname || 'Student Profile'}"</p>
            
            <div className="space-y-2">
              {[
                { label: 'SDQ Behavior', status: student.sdq?.status, val: student.sdq?.totalDifficulties },
                { label: 'Risk Screening', status: student.risk?.status },
                { label: 'Emotional EQ', status: student.eq?.level }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100 flex flex-col items-center gap-2 hover:bg-white hover:shadow-lg transition-all">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.label}</span>
                  <span className={`px-5 py-1.5 rounded-full text-[10px] font-black tracking-tight shadow-sm ${
                    item.status === Status.NORMAL || item.status === EQLevel.NORMAL || item.status === EQLevel.HIGH ? 'bg-emerald-500 text-white' :
                    item.status === Status.RISK ? 'bg-orange-400 text-white' :
                    item.status === Status.PROBLEM || item.status === EQLevel.NEEDS_IMPROVEMENT ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.status ? (item.status === Status.NORMAL ? '✅ ปกติ' : item.status === Status.RISK ? '⚠️ กลุ่มเสี่ยง' : item.status === Status.PROBLEM ? '🚨 มีปัญหา' : item.status) : '⏳ รอดำเนินการ'}
                  </span>
                  {item.val !== undefined && (
                    <span className="text-[10px] font-bold text-gray-400">คะแนน: {item.val}/40</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white bg-indigo-50/50">
             <h4 className="text-[10px] font-black text-indigo-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               Quick Actions
             </h4>
             <div className="space-y-3">
                <button onClick={() => setIsCounselingOpen(true)} className="w-full text-left p-5 rounded-3xl bg-white border border-indigo-100 text-sm font-black text-gray-700 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-between group shadow-sm">
                  <span>📝 ติดตามผลการดูแล</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full text-left p-5 rounded-3xl bg-white border border-indigo-100 text-sm font-black text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-4 shadow-sm"
                >
                  📄 พิมพ์สรุปผลหน้าเดียว
                </button>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SDQ Chart Section */}
          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">กราฟวิเคราะห์พฤติกรรม (SDQ)</h3>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Strength and Difficulties Analysis</p>
              </div>
              {student.sdq && (
                <div className="px-6 py-3 bg-blue-600 text-white rounded-3xl text-center shadow-xl shadow-blue-100">
                  <span className="text-3xl font-black">{student.sdq.totalDifficulties}</span>
                  <span className="text-[10px] font-bold opacity-60 ml-1">/ 40</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="h-[320px] bg-gray-50/50 rounded-[2.5rem] p-6 border border-dashed border-gray-200 flex items-center justify-center">
                {student.sdq ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center space-y-3">
                    <span className="text-6xl block opacity-20">📊</span>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No SDQ Data Found</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {sdqDetails.map((d, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-[11px] font-black text-gray-700 uppercase">{d.icon} {d.label}</span>
                        <p className="text-[9px] text-gray-400 font-bold">{d.desc}</p>
                      </div>
                      <span className="text-[11px] font-black text-gray-800">{d.val ?? 0}/10</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out shadow-sm ${getSdqBarColor(d.val ?? 0, d.isProsocial)}`}
                        style={{ width: `${((d.val ?? 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Counseling History Section */}
          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white">
            <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 tracking-tight">
              📅 บันทึกการติดตามผลและการเยี่ยมบ้าน
            </h3>
            
            <div className="space-y-6">
              {student.counseling && student.counseling.length > 0 ? (
                student.counseling.map((rec, i) => (
                  <div key={rec.id} className="relative pl-12 before:absolute before:left-4 before:top-2 before:bottom-0 before:w-1 before:bg-blue-100 last:before:hidden pb-10">
                    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-2xl bg-blue-600 border-4 border-white shadow-lg z-10 flex items-center justify-center text-white text-xs font-black">
                      {student.counseling!.length - i}
                    </div>
                    <div className="bg-white border border-blue-50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                          <div>
                             <h4 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">{rec.topic}</h4>
                             <p className="text-[10px] text-blue-500 font-black tracking-widest mt-1 uppercase">
                               🗓️ {new Date(rec.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                             </p>
                          </div>
                          <span className="text-[9px] bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md">
                            Follow-up Result
                          </span>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium bg-gray-50/50 p-5 rounded-2xl border border-gray-100 italic">"{rec.detail}"</p>
                       <div className="bg-indigo-600 p-5 rounded-2xl shadow-xl shadow-indigo-100">
                          <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest mb-1">ผลสรุปการช่วยเหลือ:</p>
                          <p className="text-white font-black">{rec.result}</p>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                   <div className="text-5xl mb-4 opacity-10">📝</div>
                   <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No Counseling Records Found</p>
                   <button 
                     onClick={() => setIsCounselingOpen(true)} 
                     className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                   >
                     + เพิ่มบันทึกครั้งแรก
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counseling Modal */}
      {isCounselingOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-12 animate-scale-in border border-white">
            <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter">บันทึกการดูแล</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-10">SCS Counseling Log</p>
            <form onSubmit={handleSaveCounseling} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">หัวข้อการปรึกษา</label>
                <input required className="w-full px-8 py-5 rounded-3xl bg-gray-50 border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-black text-gray-700" placeholder="เช่น ให้คำปรึกษาด้านการคบเพื่อน" value={cRecord.topic} onChange={e => setCRecord({...cRecord, topic: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">รายละเอียดการช่วยเหลือ</label>
                <textarea required className="w-full px-8 py-5 rounded-3xl bg-gray-50 border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 h-32 font-bold text-gray-600 leading-relaxed" placeholder="ระบุการช่วยเหลือที่ครูได้ดำเนินการ..." value={cRecord.detail} onChange={e => setCRecord({...cRecord, detail: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">สรุปผลลัพธ์</label>
                <input required className="w-full px-8 py-5 rounded-3xl bg-indigo-600 text-white border-none outline-none focus:ring-4 focus:ring-indigo-200 font-black placeholder:text-indigo-300 shadow-xl" placeholder="เช่น นักเรียนมีพฤติกรรมดีขึ้น" value={cRecord.result} onChange={e => setCRecord({...cRecord, result: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsCounselingOpen(false)} className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest hover:bg-gray-100 rounded-3xl transition-all text-[10px]">ยกเลิก</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-[10px]">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
