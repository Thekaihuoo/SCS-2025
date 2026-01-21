
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

  // Home Visit States
  const [isVisitOpen, setIsVisitOpen] = useState(false);
  const [visitNote, setVisitNote] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [scholarship, setScholarship] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  // Counseling States
  const [isCounselingOpen, setIsCounselingOpen] = useState(false);
  const [cRecord, setCRecord] = useState({ topic: '', detail: '', result: '' });

  useEffect(() => {
    const students = storage.getStudents();
    const found = students.find(s => s.id === id);
    if (found) {
      setStudent(found);
      if (found.homeVisit) {
        setVisitNote(found.homeVisit.condition);
        setMapLink(found.homeVisit.googleMapsLink);
        setScholarship(found.homeVisit.needsScholarship);
        setPhotos(found.homeVisit.photos || []);
      }
    }
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setPhotos(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSaveVisit = () => {
    if (!student) return;
    const updated: Student = {
      ...student,
      homeVisit: {
        date: new Date().toISOString(),
        condition: visitNote,
        googleMapsLink: mapLink,
        needsScholarship: scholarship,
        photos: photos
      }
    };
    storage.updateStudent(updated);
    setStudent(updated);
    setIsVisitOpen(false);
    Swal.fire('สำเร็จ', 'บันทึกข้อมูลการเยี่ยมบ้านเรียบร้อย', 'success');
  };

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
    Swal.fire('สำเร็จ', 'บันทึกการให้คำปรึกษาเรียบร้อย', 'success');
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/students')} className="p-4 bg-white shadow-xl rounded-3xl hover:scale-105 transition-all border border-gray-100 text-xl active:scale-95">
            ←
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">{student.name}</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">ชั้น {student.grade}/{student.room} • Student ID: {student.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/assessment/sdq/${student.id}`} className="px-6 py-3 bg-blue-500 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all">ประเมิน SDQ</Link>
          <Link to={`/assessment/risk/${student.id}`} className="px-6 py-3 bg-orange-500 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-orange-100 hover:-translate-y-1 transition-all">คัดกรองความเสี่ยง</Link>
          <Link to={`/assessment/eq/${student.id}`} className="px-6 py-3 bg-emerald-500 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-emerald-100 hover:-translate-y-1 transition-all">ประเมิน EQ</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10"></div>
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-black text-blue-500 mb-6 border-8 border-white shadow-2xl mx-auto transform hover:rotate-6 transition-all cursor-pointer">
              {student.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-1">{student.name}</h3>
            <p className="text-sm text-gray-400 font-bold mb-8">"{student.nickname || 'ไม่มีชื่อเล่น'}"</p>
            
            <div className="space-y-3 text-left">
              {[
                { label: 'SDQ', status: student.sdq?.status },
                { label: 'Risk Screening', status: student.risk?.status },
                { label: 'Emotional Quotient (EQ)', status: student.eq?.level }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tight ${
                    item.status === Status.NORMAL || item.status === EQLevel.NORMAL || item.status === EQLevel.HIGH ? 'bg-emerald-100 text-emerald-600' :
                    item.status === Status.RISK ? 'bg-amber-100 text-amber-600' :
                    item.status === Status.PROBLEM || item.status === EQLevel.NEEDS_IMPROVEMENT ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.status || 'รอดำเนินการ'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white bg-indigo-50/30">
             <h4 className="text-sm font-black text-indigo-600 mb-5 uppercase tracking-widest">การช่วยเหลือและการส่งต่อ</h4>
             <div className="space-y-3">
                <button onClick={() => setIsCounselingOpen(true)} className="w-full text-left p-4 rounded-2xl bg-white border border-indigo-100 text-sm font-bold text-gray-700 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-between group">
                  <span>📝 บันทึกการติดตามผล</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full text-left p-4 rounded-2xl bg-white border border-indigo-100 text-sm font-bold text-gray-700 hover:bg-indigo-50 transition-all flex items-center gap-3">
                  📄 รายงาน PDF สรุปเคส
                </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-800">📊 ผลการประเมิน SDQ</h3>
                <p className="text-sm text-gray-400 font-medium">Strength and Difficulties Questionnaire</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl text-center min-w-[140px] border border-gray-100">
                <div className={`text-4xl font-black ${student.sdq?.status === Status.PROBLEM ? 'text-rose-500' : student.sdq?.status === Status.RISK ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {student.sdq?.totalDifficulties ?? '0'}
                  <span className="text-sm text-gray-300 font-normal ml-1">/ 40</span>
                </div>
                <span className="text-[9px] text-gray-400 block font-black uppercase tracking-widest mt-1">คะแนนความยากลำบาก</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="h-[280px] w-full bg-gray-50/40 rounded-[2rem] p-4 flex items-center justify-center border border-dashed border-gray-100">
                {student.sdq ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
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
                  <div className="text-center">
                    <span className="text-4xl block mb-2 opacity-20">📈</span>
                    <p className="text-xs text-gray-300 font-bold uppercase">No SDQ Data Available</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {sdqDetails.map((d, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{d.icon} {d.label}</span>
                        <p className="text-[9px] text-gray-400 font-medium">{d.desc}</p>
                      </div>
                      <span className="text-xs font-black text-gray-800">{d.val ?? '0'} <span className="text-[10px] text-gray-300">/10</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${getSdqBarColor(d.val ?? 0, d.isProsocial)}`}
                        style={{ width: `${((d.val ?? 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white">
            <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              📋 ประวัติการติดตามผลและการให้คำแนะนำ
            </h3>
            
            <div className="space-y-6">
              {student.counseling && student.counseling.length > 0 ? (
                student.counseling.map((rec, i) => (
                  <div key={rec.id} className="relative pl-10 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-indigo-100 last:before:hidden pb-8">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow-md z-10"></div>
                    <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h4 className="font-black text-gray-800">{rec.topic}</h4>
                             <p className="text-[10px] text-indigo-500 font-black tracking-widest mt-1">
                               🗓️ {new Date(rec.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                             </p>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-emerald-100">
                            บันทึกเสร็จสมบูรณ์
                          </span>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed mb-4">{rec.detail}</p>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ผลลัพธ์การช่วยเหลือ</p>
                          <p className="text-sm font-bold text-gray-700 italic">"{rec.result}"</p>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                   <p className="text-gray-400 italic font-medium">ยังไม่มีประวัติการติดตามผล/การให้คำปรึกษา</p>
                   <button onClick={() => setIsCounselingOpen(true)} className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-600 hover:text-white transition-all">
                     + บันทึกครั้งแรก
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counseling Modal */}
      {isCounselingOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-scale-in">
            <h3 className="text-2xl font-black text-gray-800 mb-2">บันทึกการติดตามผล</h3>
            <p className="text-sm text-gray-400 font-medium mb-8 uppercase tracking-widest">Counseling & Follow-up Log</p>
            <form onSubmit={handleSaveCounseling} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">หัวข้อ/สาเหตุ</label>
                <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="เช่น ให้คำปรึกษาด้านการคบเพื่อน" value={cRecord.topic} onChange={e => setCRecord({...cRecord, topic: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">รายละเอียดการช่วยเหลือ</label>
                <textarea required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 h-28 font-medium" placeholder="ระบุสิ่งที่ครูได้ดำเนินการ..." value={cRecord.detail} onChange={e => setCRecord({...cRecord, detail: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ผลการดำเนินการ</label>
                <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-600" placeholder="เช่น นักเรียนมีความเข้าใจและปรับตัวได้ดีขึ้น" value={cRecord.result} onChange={e => setCRecord({...cRecord, result: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCounselingOpen(false)} className="flex-1 py-5 text-gray-500 font-black hover:bg-gray-100 rounded-[1.5rem] transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-indigo-200">บันทึกประวัติ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
