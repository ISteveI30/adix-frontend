import { MetaData } from "../services/api";
import { TutorType } from "./enrollment.interface";
import { Student } from "./student.interface";

export interface Tutor {
  id?: string;
  dni?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  type: TutorType;
  observation?: string;
  students?: Student[];
}

export interface TutorWithStudent {
  id?: string;
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1: string;
  phone2?: string;
  type: TutorType;
  observation?: string;
  students?: Student[];
}

export interface createTutor {
  dni?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  type: TutorType;
  observation?: string;
  students?: Student[];
}

export type UpdateTutor = Partial<Tutor>

export interface TutorListResponse {
  data: TutorWithStudent[];
  meta: MetaData;
}