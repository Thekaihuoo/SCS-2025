
import { Student, Status, EQLevel, Teacher } from './types';

export const COLORS = {
  PRIMARY: '#42A5F5',
  NORMAL: '#66BB6A',
  RISK: '#FFA726',
  PROBLEM: '#EF5350',
  BG: '#F3F6F9'
};

export const GRADES = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
export const ROOMS = ['1', '2', '3', '4'];

export const SDQ_QUESTIONS = [
  { id: 1, text: 'ห่วงใยความรู้สึกของคนอื่น', type: 'prosocial' },
  { id: 2, text: 'อยู่ไม่นิ่ง นั่งนิ่งๆ ไม่ได้', type: 'hyperactivity' },
  { id: 3, text: 'มักจะบ่นว่าปวดศีรษะ ปวดท้อง หรือไม่สบาย', type: 'emotional' },
  { id: 4, text: 'เต็มใจแบ่งปันสิ่งของให้เพื่อน (ขนม, ของเล่น, ดินสอ เป็นต้น)', type: 'prosocial' },
  { id: 5, text: 'มักจะอาละวาดหรือโมโหร้าย', type: 'conduct' },
  { id: 6, text: 'ค่อนข้างแยกตัว ชอบเล่นคนเดียว', type: 'peer' },
  { id: 7, text: 'เชื่อฟัง มักจะทำตามที่ผู้ใหญ่ต้องการ', type: 'conduct', reverse: true },
  { id: 8, text: 'กังวลใจหลายเรื่อง ดูวิตกกังวลเสมอ', type: 'emotional' },
  { id: 9, text: 'เป็นที่พึ่งได้เวลาที่คนอื่นเสียใจ อารมณ์ไม่ดี หรือไม่สบายใจ', type: 'prosocial' },
  { id: 10, text: 'อยู่ไม่สุข วุ่นวายอย่างมาก', type: 'hyperactivity' },
  { id: 11, text: 'มีเพื่อนสนิท', type: 'peer', reverse: true },
  { id: 12, text: 'มักมีเรื่องทะเลาะวิวาทกับเด็กอื่น หรือรังแกเด็กอื่น', type: 'conduct' },
  { id: 13, text: 'ดูไม่มีความสุข ท้อแท้ ร้องไห้บ่อย', type: 'emotional' },
  { id: 14, text: 'เป็นที่ชื่นชอบของเพื่อน', type: 'peer', reverse: true },
  { id: 15, text: 'วอกแวกง่าย สมาธิสั้น', type: 'hyperactivity' },
  { id: 16, text: 'เครียดไม่ยอมห่างเวลาอยู่ในสถานการณ์ที่ไม่คุ้น และขาดความเชื่อมั่นในตนเอง', type: 'emotional' },
  { id: 17, text: 'ใจดีกับเด็กที่เล็กกว่า', type: 'prosocial' },
  { id: 18, text: 'ชอบโกหกหรือขี้โกง', type: 'conduct' },
  { id: 19, text: 'ถูกเด็กคนอื่นล้อเลียนหรือรังแก', type: 'peer' },
  { id: 20, text: 'ชอบอาสาช่วยเหลือคนอื่น (พ่อ, แม่, ครู, เด็กคนอื่น)', type: 'prosocial' },
  { id: 21, text: 'คิดก่อนทำ', type: 'hyperactivity', reverse: true },
  { id: 22, text: 'ขโมยของของที่บ้าน ที่โรงเรียน หรือที่อื่น', type: 'conduct' },
  { id: 23, text: 'เข้ากับผู้ใหญ่ได้ดีกว่าเด็กวัยเดียวกัน', type: 'peer' },
  { id: 24, text: 'ขี้กลัว รู้สึกหวาดกลัวได้ง่าย', type: 'emotional' },
  { id: 25, text: 'ทำงานได้จนเสร็จ มีความตั้งใจในการทำงาน', type: 'hyperactivity', reverse: true }
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 'T001', name: 'คุณครูมานะ ขยันเรียน', subject: 'ภาษาไทย' },
  { id: 'T002', name: 'คุณครูชูใจ ใฝ่ดี', subject: 'คณิตศาสตร์' }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'S001',
    name: 'เด็กชายสมชาย มั่นคง',
    nickname: 'ชาย',
    grade: 'ป.1',
    room: '1',
    teacherId: 'T001',
    sdq: {
      emotional: 2, conduct: 1, hyperactivity: 3, peer: 2, prosocial: 8,
      totalDifficulties: 8, status: Status.NORMAL, updatedAt: '2025-01-10'
    },
    eq: {
      good: 15, smart: 14, happy: 16, total: 45, level: EQLevel.NORMAL, updatedAt: '2025-01-10'
    },
    risk: {
      academic: false, health: false, family: false, behavior: false, status: Status.NORMAL, updatedAt: '2025-01-10'
    }
  }
];
