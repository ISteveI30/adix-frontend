import { Student } from '@/api/interfaces/student.interface';
import { Tutor } from '@/api/interfaces/tutor.interface';
import { create } from 'zustand';

interface TutorStudentState {
  tutorStudentData: {
    tutor: Tutor;
    student: Student;
  } | null;
  studentId: string | null;
  setTutorStudentData: (data: { tutor: Tutor; student: Student }) => void;
  setStudentId: (id: string) => void;
  reset: () => void;
}

export const useTutorStudentStore = create<TutorStudentState>((set) => ({
  tutorStudentData: null,
  studentId: null,
  setTutorStudentData: (data) => set({ tutorStudentData: data }),
  setStudentId: (id) => set({ studentId: id }),
  reset: () => set({ tutorStudentData: null, studentId: null }),
}));