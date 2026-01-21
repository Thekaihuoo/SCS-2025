
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { Teacher } from '../types';
import Swal from 'sweetalert2';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(storage.getTeachers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subject: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.startsWith('T')) {
      Swal.fire('ข้อผิดพลาด', 'รหัสครูต้องขึ้นต้นด้วยอักษร T (เช่น T001)', 'error');
      return;
    }

    if (editingTeacher) {
      storage.updateTeacher(formData);
      Swal.fire('สำเร็จ', 'อัปเดตข้อมูลคุณครูเรียบร้อย', 'success');
    } else {
      if (teachers.some(t => t.id === formData.id)) {
        Swal.fire('ข้อผิดพลาด', 'รหัสครูนี้มีอยู่ในระบบแล้ว', 'error');
        return;
      }
      storage.addTeacher(formData);
      Swal.fire('สำเร็จ', 'เพิ่มคุณครูใหม่เรียบร้อย', 'success');
    }
    setTeachers(storage.getTeachers());
    setIsModalOpen(false);
    setFormData({ id: '', name: '', subject: '' });
  };

  const handleEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลคุณครูท่านนี้ได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#EF5350'
    }).then(res => {
      if (res.isConfirmed) {
        storage.deleteTeacher(id);
        setTeachers(storage.getTeachers());
        Swal.fire('ลบแล้ว', '', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">จัดการรายชื่อคุณครู</h1>
          <p className="text-gray-500">สำหรับผู้ดูแลระบบ (Admin Only)</p>
        </div>
        <button 
          onClick={() => { setEditingTeacher(null); setFormData({id:'', name:'', subject:''}); setIsModalOpen(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"
        >
          + เพิ่มคุณครู
        </button>
      </div>

      <div className="glass-card rounded-3xl shadow-sm border border-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">รหัส (Username)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">วิชาที่สอน</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map(t => (
              <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-blue-600">{t.id}</td>
                <td className="px-6 py-4 font-bold text-gray-700">{t.name}</td>
                <td className="px-6 py-4 text-gray-500">{t.subject}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(t)} className="text-orange-500 hover:underline mr-4 text-sm font-bold">แก้ไข</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline text-sm font-bold">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-scale-in">
            <h3 className="text-xl font-bold mb-6">{editingTeacher ? 'แก้ไขข้อมูลคุณครู' : 'เพิ่มคุณครูท่านใหม่'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">รหัสประจำตัว (ใช้ล็อกอิน)</label>
                <input 
                  required 
                  disabled={!!editingTeacher}
                  type="text" 
                  placeholder="เช่น T001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">ชื่อ-นามสกุล</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">วิชาที่รับผิดชอบ</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
