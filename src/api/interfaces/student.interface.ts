import { MetaData } from "../services/api";
import { Tutor } from "./tutor.interface";

export interface StudentEnrollmentInfo {
  id: string;
  codeStudent?: string;
  startDate: string;
  endDate: string;
  cycle?: {
    id: string;
    name: string;
  };
  career?: {
    id: string;
    name: string;
  };
  admission?: {
    id: string;
    name: string;
  };
  accountReceivables?: Array<{
    id: string;
    totalAmount: number;
    pendingBalance: number;
    dueDate: string;
    status: string;
    concept?: string;
    installmentNumber?: number;
    installmentTotal?: number;
  }>;
}

export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday: string;
  tutorId: string;
  tutor?: Tutor;
  enrollments?: StudentEnrollmentInfo[];
}

export interface StudentList {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday: string;
  tutorId: string;
  tutor?: Tutor;
  enrollments?: StudentEnrollmentInfo[];
}

export interface StudentSearch {
  id: string;
  name: string;
}

export interface StudentWithTutor {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone?: string;
  image?: string;
  school?: string;
  tutorName: string;
  enrollments?: StudentEnrollmentInfo[];
}

export interface StudentListResponse {
  meta: MetaData;
  data: StudentList[];
}

export interface StudentAttendance {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  birthday?: string;
  enrollments: Array<{
    cycle: { name: string };
    admission: { name: string };
  }>;
}