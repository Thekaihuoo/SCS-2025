
import { Student, Teacher, User } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS } from '../constants';

const KEYS = {
  STUDENTS: 'scs_students',
  TEACHERS: 'scs_teachers',
  AUTH: 'scs_auth_user'
};

export const storage = {
  // Students
  getStudents: (): Student[] => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (!data) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(data);
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },
  addStudent: (student: Student) => {
    const students = storage.getStudents();
    students.push(student);
    storage.saveStudents(students);
  },
  bulkAddStudents: (newStudents: Student[]) => {
    const students = storage.getStudents();
    storage.saveStudents([...students, ...newStudents]);
  },
  updateStudent: (updatedStudent: Student) => {
    const students = storage.getStudents();
    const index = students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
      students[index] = updatedStudent;
      storage.saveStudents(students);
    }
  },
  deleteStudent: (studentId: string) => {
    const students = storage.getStudents();
    const filtered = students.filter(s => s.id !== studentId);
    storage.saveStudents(filtered);
  },

  // Teachers
  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(KEYS.TEACHERS);
    if (!data) {
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(data);
  },
  saveTeachers: (teachers: Teacher[]) => {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
  },
  addTeacher: (teacher: Teacher) => {
    const teachers = storage.getTeachers();
    teachers.push(teacher);
    storage.saveTeachers(teachers);
  },
  updateTeacher: (updated: Teacher) => {
    const teachers = storage.getTeachers();
    const idx = teachers.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      teachers[idx] = updated;
      storage.saveTeachers(teachers);
    }
  },
  deleteTeacher: (id: string) => {
    const teachers = storage.getTeachers();
    storage.saveTeachers(teachers.filter(t => t.id !== id));
  },

  // Auth
  getAuth: (): User | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  setAuth: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.AUTH);
    }
  }
};
