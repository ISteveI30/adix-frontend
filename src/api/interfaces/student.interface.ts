// types/student.ts

import { MetaData } from "../services/api";
import { Tutor } from "./tutor.interface";


export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday?: string;
  tutorId: string;
  tutor?: Tutor;
}

export interface StudentList {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday?: string;
  tutorId: string;
  tutor?: Tutor;
}

export interface StudentSearch {
  id: string
  name: string
}

export interface StudentWithTutor{
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email: string;
  phone?: string;
  image?: string;
  school?: string;
  tutorName: string;
}

export interface StudentListResponse {
  meta: MetaData;
  data: StudentList[];
}
