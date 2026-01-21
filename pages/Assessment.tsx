
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
  const [eqScores, setEqScores] = useState<number[]>(new Array(3).fill(0));
  const [riskChecklist, setRiskChecklist] = useState({
    academic: false, health: false, family: false, behavior: false, economy: false, protection: false, other: false
  });

  useEffect(() => {
    const students = storage.getStudents();
    const found = students.find(s => s.id === studentId);
    if (found) setStudent(found);
    
    // Initialize SDQ with 0 if first time
    const initialSdq: Record<number, number> = {};
    SDQ_QUESTIONS.forEach(q => initialSdq[q.id] = 1); // Default to 'Somewhat true'
    setSdqAnswers(initialSdq);
  }, [studentId]);

  const handleSdqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (Object.keys(sdqAnswers).length < 25) {
      Swal.fire('คำเตือน', 'กรุณาตอบคำถามให้ครบ 25 ข้อ', 'warning');
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
    Swal.fire('สำเร็จ', `บันทึก SDQ เรียบร้อย (คะแนนรวม: ${totalDifficulties})`, 'success');
    navigate(`/student/${student.id}`);
  };

  const handleEqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const total = eqScores.reduce((a, b) => a + b, 0);
    let level = EQLevel.NORMAL;
    if (total > 11) level = EQLevel.HIGH;
    else if (total < 7) level = EQLevel.NEEDS_IMPROVEMENT;

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
      risk: { ...riskChecklist, status, updatedAt: new Date().toISOString() }
    };
    storage.updateStudent(updated);
    Swal.fire('สำเร็จ', 'บันทึกการคัดกรองความเสี่ยงเรียบร้อย', 'success');
    navigate(`/student/${student.id}`);
  };

  if (!student) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full">⬅️</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {type === 'sdq' ? 'แบบประเมินตนเอง (SDQ)' : type === 'eq' ? 'แบบประเมิน EQ' : 'แบบคัดกรองนักเรียน 7 ด้าน'}
          </h1>
          <p className="text-blue-500 font-semibold">{student.name} ({student.id})</p>
        </div>
      </div>

      <div className="glass-card p-4 md:p-8 rounded-3xl shadow-xl border border-white">
        {type === 'sdq' && (
          <form onSubmit={handleSdqSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-700 mb-6">
              คำชี้แจง: กรุณาทำเครื่องหมายให้ตรงความเป็นจริงที่เกิดขึ้นในช่วง 6 เดือนที่ผ่านมา
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-2 font-bold text-gray-700">ข้อที่ / รายการประเมิน</th>
                    <th className="py-3 px-2 font-bold text-gray-700 text-center">ไม่จริง (0)</th>
                    <th className="py-3 px-2 font-bold text-gray-700 text-center">ค่อนข้างจริง (1)</th>
                    <th className="py-3 px-2 font-bold text-gray-700 text-center">จริง (2)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SDQ_QUESTIONS.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-gray-600">{q.id}. {q.text}</td>
                      {[0, 1, 2].map((val) => (
                        <td key={val} className="py-4 px-2 text-center">
                          <input
                            type="radio"
                            name={`q${q.id}`}
                            className="w-4 h-4 text-blue-500"
                            checked={sdqAnswers[q.id] === val}
                            onChange={() => setSdqAnswers({ ...sdqAnswers, [q.id]: val })}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-600 transition-all mt-8">
              ส่งแบบประเมิน SDQ
            </button>
          </form>
        )}

        {type === 'risk' && (
          <form onSubmit={handleRiskSubmit} className="space-y-8">
            <div className="space-y-6">
              {[
                { key: 'academic', title: '1. ด้านการเรียน', desc: 'เกรดเฉลี่ยต่ำกว่า 1.00, มาเรียนสาย, อ่านไม่ออกเขียนไม่ได้' },
                { key: 'health', title: '2. ด้านสุขภาพ', desc: 'เจ็บป่วยบ่อย, โรคร้ายแรง, บกพร่องทางการมองเห็น/ได้ยิน' },
                { key: 'behavior', title: '3. ด้านสุขภาพจิตและพฤติกรรม', desc: 'ซึมเศร้า, ก้าวร้าว, ไม่นิ่ง (อ้างอิงจาก SDQ)' },
                { key: 'economy', title: '4. ด้านเศรษฐกิจ', desc: 'รายได้ครอบครัวต่ำกว่า 5,000 บาท/เดือน, ไม่มีเงินซื้ออุปกรณ์การเรียน' },
                { key: 'protection', title: '5. ด้านการคุ้มครองนักเรียน', desc: 'บิดามารดาแยกทาง, อยู่กับผู้สูงอายุ, สภาพแวดล้อมเสี่ยง' },
                { key: 'other', title: '6. ด้านอื่นๆ (ยาเสพติด/ชู้สาว)', desc: 'มีการใช้สารเสพติด หรือพฤติกรรมเสี่ยงทางเพศ' }
              ].map((section) => (
                <div key={section.key} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all bg-white shadow-sm">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded text-blue-500"
                      checked={riskChecklist[section.key as keyof typeof riskChecklist]}
                      onChange={(e) => setRiskChecklist({ ...riskChecklist, [section.key]: e.target.checked })}
                    />
                    <div>
                      <p className="font-bold text-gray-800">{section.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{section.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg hover:bg-orange-600 transition-all">
              บันทึกผลการคัดกรอง 7 ด้าน
            </button>
          </form>
        )}

        {type === 'eq' && (
          <form onSubmit={handleEqSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-gray-700 border-b pb-2">ความฉลาดทางอารมณ์ (เก่ง ดี มีสุข)</h3>
            {['ด้านความเก่ง (Good)', 'ด้านความดี (Smart)', 'ด้านความสุข (Happy)'].map((label, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block">{label}</label>
                <input 
                  type="range" min="1" max="4" step="1" 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={eqScores[idx]}
                  onChange={(e) => {
                    const newScores = [...eqScores];
                    newScores[idx] = parseInt(e.target.value);
                    setEqScores(newScores);
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>ปรับปรุง</span>
                  <span className="font-bold text-blue-500">ระดับ: {eqScores[idx]}</span>
                  <span>ดีเยี่ยม</span>
                </div>
              </div>
            ))}
            <button type="submit" className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 transition-all mt-4">
              บันทึกผล EQ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Assessment;
