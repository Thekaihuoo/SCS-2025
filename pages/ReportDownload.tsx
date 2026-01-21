
import React, { useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { GRADES, ROOMS } from '../constants';
import { Status, Student } from '../types';
import Swal from 'sweetalert2';

const ReportDownload: React.FC = () => {
  const students = storage.getStudents();
  
  // States for filtering
  const [gradeFilter, setGradeFilter] = useState(GRADES[0]);
  const [roomFilter, setRoomFilter] = useState(ROOMS[0]);
  const [studentSearch, setStudentSearch] = useState('');

  // Individual Report Search
  const searchedStudents = useMemo(() => {
    if (!studentSearch) return [];
    return students.filter(s => 
      s.name.includes(studentSearch) || s.id.includes(studentSearch)
    ).slice(0, 5);
  }, [students, studentSearch]);

  // Class Report Stats
  const classStats = useMemo(() => {
    const classStudents = students.filter(s => s.grade === gradeFilter && s.room === roomFilter);
    const total = classStudents.length;
    const sdqProblem = classStudents.filter(s => s.sdq?.status === Status.PROBLEM).length;
    const riskCount = classStudents.filter(s => s.risk?.status === Status.RISK || s.risk?.status === Status.PROBLEM).length;
    return { total, sdqProblem, riskCount, data: classStudents };
  }, [students, gradeFilter, roomFilter]);

  const exportCSV = (data: Student[], filename: string) => {
    if (data.length === 0) {
      Swal.fire('ไม่พบข้อมูล', 'ไม่มีรายชื่อนักเรียนในกลุ่มที่เลือก', 'info');
      return;
    }
    const headers = ["รหัส", "ชื่อ-นามสกุล", "ชั้น", "ห้อง", "SDQ Status", "Risk Status", "EQ Level"];
    const rows = data.map(s => [
      s.id, s.name, s.grade, s.room, 
      s.sdq?.status || 'N/A', 
      s.risk?.status || 'N/A', 
      s.eq?.level || 'N/A'
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Swal.fire('สำเร็จ', `ดาวน์โหลดเอกสาร ${filename} เรียบร้อย`, 'success');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <header>
        <h1 className="text-3xl font-black text-gray-800 mb-2">📁 ศูนย์รวมเอกสารสรุปผล</h1>
        <p className="text-gray-500 font-medium">เลือกดาวน์โหลดรายงานการประเมินในระดับต่างๆ</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: School Wide Report */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">🏫 รายงานสรุปภาพรวมโรงเรียน</h3>
              <p className="text-purple-100 text-sm mb-8 opacity-80 font-medium">รวมสถิตินักเรียนทุกคนในระบบดูแลช่วยเหลือ</p>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                 <div className="bg-white/10 p-4 rounded-3xl text-center">
                    <p className="text-2xl font-black">{students.length}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">ทั้งหมด</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-3xl text-center">
                    <p className="text-2xl font-black text-emerald-300">
                      {students.filter(s => s.sdq?.status === Status.NORMAL).length}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-60">ปกติ</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-3xl text-center">
                    <p className="text-2xl font-black text-rose-300">
                      {students.filter(s => s.sdq?.status === Status.PROBLEM).length}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-60">มีปัญหา</p>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => exportCSV(students, 'รายงานสรุปภาพรวมโรงเรียน')}
             className="w-full py-5 bg-white text-indigo-700 font-black rounded-2xl shadow-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
             <span>📊 ดาวน์โหลดข้อมูลภาพรวม (Excel/CSV)</span>
           </button>
           <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-10">📋</div>
        </div>

        {/* Section 2: Class Level Report */}
        <div className="glass-card rounded-[3rem] p-10 shadow-xl border border-white flex flex-col">
           <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-blue-500">🏢</span> รายงานรายชั้นเรียน
           </h3>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">ระดับชั้น</label>
                 <select 
                   className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                   value={gradeFilter}
                   onChange={e => setGradeFilter(e.target.value)}
                 >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">ห้องเรียน</label>
                 <select 
                   className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                   value={roomFilter}
                   onChange={e => setRoomFilter(e.target.value)}
                 >
                    {ROOMS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                 </select>
              </div>
           </div>

           <div className="flex-1 bg-blue-50/50 rounded-3xl p-6 mb-8 border border-dashed border-blue-200">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-sm font-bold text-blue-800">สรุปห้อง {gradeFilter}/{roomFilter}</p>
                 <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black">{classStats.total} คน</span>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>กลุ่มเสี่ยง/มีปัญหา</span>
                    <span className="font-bold text-rose-500">{classStats.sdqProblem + classStats.riskCount} คน</span>
                 </div>
                 <div className="w-full bg-gray-200 h-1.5 rounded-full">
                    <div 
                      className="bg-rose-500 h-full rounded-full" 
                      style={{ width: `${(classStats.total > 0 ? ((classStats.sdqProblem + classStats.riskCount) / classStats.total) * 100 : 0)}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => exportCSV(classStats.data, `รายงานชั้น_${gradeFilter}_${roomFilter}`)}
             className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95"
           >
             💾 ดาวน์โหลดไฟล์สรุปประจำห้อง
           </button>
        </div>

        {/* Section 3: Individual Report */}
        <div className="glass-card rounded-[3rem] p-10 shadow-xl border border-white lg:col-span-2">
           <h3 className="text-2xl font-black text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-emerald-500">👤</span> สรุปผลรายบุคคล (Individual Report)
           </h3>
           <p className="text-gray-400 font-medium mb-8 text-sm">ค้นหารายชื่อนักเรียนเพื่อพิมพ์ใบสรุปผลการประเมินรายบุคคล</p>

           <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อนักเรียน หรือ รหัสประจำตัว..."
                className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
              <span className="absolute left-6 top-5 text-2xl opacity-30">🔍</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchedStudents.map(student => (
                <div key={student.id} className="p-6 bg-white border border-gray-100 rounded-3xl flex items-center justify-between hover:shadow-lg transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                         {student.name.charAt(0)}
                      </div>
                      <div>
                         <p className="font-black text-gray-800">{student.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ชั้น {student.grade}/{student.room} • {student.id}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => exportCSV([student], `รายงานบุคคล_${student.name}`)}
                     className="p-3 bg-gray-50 text-gray-400 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm group-hover:scale-110"
                   >
                     📄
                   </button>
                </div>
              ))}
              {studentSearch && searchedStudents.length === 0 && (
                <p className="col-span-2 text-center py-10 text-gray-300 italic">ไม่พบรายชื่อนักเรียนที่ค้นหา</p>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ReportDownload;
