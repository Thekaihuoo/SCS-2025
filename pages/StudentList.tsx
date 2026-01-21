
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { Status, EQLevel, Student } from '../types';
import { COLORS, GRADES, ROOMS } from '../constants';
import Swal from 'sweetalert2';

const StatusBadge = ({ label, status }: { label: string, status?: Status | EQLevel }) => {
  let colorClass = 'bg-gray-100 text-gray-400';
  if (status === Status.NORMAL || status === EQLevel.NORMAL || status === EQLevel.HIGH) {
    colorClass = 'bg-green-100 text-green-600';
  } else if (status === Status.RISK) {
    colorClass = 'bg-orange-100 text-orange-600';
  } else if (status === Status.PROBLEM || status === EQLevel.NEEDS_IMPROVEMENT) {
    colorClass = 'bg-red-100 text-red-600';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colorClass}`}>
      {label}: {status ? (status === Status.NORMAL ? 'ปกติ' : status === Status.RISK ? 'เสี่ยง' : status === Status.PROBLEM ? 'ปัญหา' : status) : 'ยังไม่ระบุ'}
    </span>
  );
};

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterRoom, setFilterRoom] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    grade: GRADES[0],
    room: ROOMS[0]
  });

  const [bulkText, setBulkText] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
      const matchGrade = filterGrade === 'ALL' || s.grade === filterGrade;
      const matchRoom = filterRoom === 'ALL' || s.room === filterRoom;
      return matchSearch && matchGrade && matchRoom;
    });
  }, [students, searchTerm, filterGrade, filterRoom]);

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    
    const headers = ["รหัสนักเรียน", "ชื่อ-นามสกุล", "ชั้น", "ห้อง", "SDQ Status", "Risk Status", "EQ Level"];
    const rows = filteredStudents.map(s => [
      s.id, s.name, s.grade, s.room, 
      s.sdq?.status || 'N/A', 
      s.risk?.status || 'N/A', 
      s.eq?.level || 'N/A'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `student_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Swal.fire('สำเร็จ', 'ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว', 'success');
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "ข้อมูลการประเมินทั้งหมดของนักเรียนคนนี้จะหายไป",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF5350',
      cancelButtonColor: '#9E9E9E',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        storage.deleteStudent(id);
        setStudents(storage.getStudents());
        Swal.fire('ลบแล้ว!', 'ลบข้อมูลนักเรียนเรียบร้อย', 'success');
      }
    });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updated: Student = { ...editingStudent, ...formData };
      storage.updateStudent(updated);
      Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success');
    } else {
      const newId = `S${Date.now().toString().slice(-4)}`;
      const newStudent: Student = {
        id: newId,
        teacherId: storage.getAuth()?.teacherId || 'T001',
        ...formData
      };
      storage.addStudent(newStudent);
      Swal.fire('สำเร็จ', 'เพิ่มนักเรียนเรียบร้อย', 'success');
    }
    setStudents(storage.getStudents());
    setEditingStudent(null);
    setIsAddModalOpen(false);
    setFormData({ name: '', nickname: '', grade: GRADES[0], room: ROOMS[0] });
  };

  const handleBulkAdd = () => {
    const names = bulkText.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length === 0) return;

    const newStudents: Student[] = names.map((name, index) => ({
      id: `S${(Date.now() + index).toString().slice(-4)}`,
      name,
      nickname: '',
      grade: formData.grade,
      room: formData.room,
      teacherId: storage.getAuth()?.teacherId || 'T001'
    }));

    storage.bulkAddStudents(newStudents);
    setStudents(storage.getStudents());
    setIsBulkModalOpen(false);
    setBulkText('');
    Swal.fire('สำเร็จ', `เพิ่มนักเรียนจำนวน ${names.length} คน เรียบร้อยแล้ว`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">รายชื่อนักเรียน</h1>
          <p className="text-gray-500">จัดการรายชื่อและติดตามสถานะการคัดกรอง</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            📊 Export CSV
          </button>
           <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all"
          >
            เพิ่มกลุ่มนักเรียน
          </button>
          <button 
            onClick={() => { setEditingStudent(null); setIsAddModalOpen(true); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
          >
            + เพิ่มรายบุคคล
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัส..."
            className="pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-gray-400">🔍</span>
        </div>
        <div>
          <select 
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="ALL">ทุกระดับชั้น</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <select 
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="ALL">ทุกห้อง</option>
            {ROOMS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] shadow-sm border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">รหัส</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">นักเรียน</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ผลการประเมินล่าสุด</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">แอคชั่น</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400 font-mono">{student.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">ชั้น {student.grade}/{student.room}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <StatusBadge label="SDQ" status={student.sdq?.status} />
                      <StatusBadge label="RISK" status={student.risk?.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link title="ดูประวัติ" to={`/student/${student.id}`} className="p-2.5 bg-gray-50 text-gray-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm">👁️</Link>
                      <button title="แก้ไข" onClick={() => { setEditingStudent(student); setFormData({name: student.name, nickname: student.nickname, grade: student.grade, room: student.room}); setIsAddModalOpen(true); }} className="p-2.5 bg-gray-50 text-gray-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm">✏️</button>
                      <button title="ลบ" onClick={() => handleDelete(student.id)} className="p-2.5 bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-300 italic">ไม่พบรายชื่อนักเรียน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-scale-in">
            <h3 className="text-xl font-bold mb-6">{editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">ชื่อ-นามสกุล</label>
                <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">ชื่อเล่น</label>
                  <input type="text" className="w-full px-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">ระดับชั้น</label>
                  <select className="w-full px-4 py-4 rounded-2xl border border-gray-100 outline-none bg-gray-50 font-bold" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">ห้องเรียน</label>
                <select className="w-full px-4 py-4 rounded-2xl border border-gray-100 outline-none bg-gray-50 font-bold" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}>
                  {ROOMS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-4 bg-blue-500 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 shadow-blue-200">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-scale-in">
            <h3 className="text-xl font-bold mb-2">เพิ่มนักเรียนเป็นกลุ่ม</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">ระบุชื่อ-นามสกุล 1 คนต่อ 1 บรรทัด</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">ระดับชั้น</label>
                  <select className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 outline-none bg-gray-50 font-bold" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">ห้องเรียน</label>
                  <select className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 outline-none bg-gray-50 font-bold" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}>
                    {ROOMS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                  </select>
                </div>
              </div>
              <textarea 
                className="w-full h-48 px-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm bg-gray-50 shadow-inner"
                placeholder="ด.ช. สมชาย มั่งมี&#10;ด.ญ. มานี ใจดี&#10;ด.ช. ปิติ ยิ้มแย้ม"
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
              />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">ยกเลิก</button>
                <button onClick={handleBulkAdd} className="flex-1 py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-200">ยืนยันเพิ่ม {bulkText.split('\n').filter(n => n.trim() !== '').length} รายชื่อ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
