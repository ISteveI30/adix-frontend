import { Career } from "./career.interface"
import { Cycle } from "./cycle.interface"
import { Student } from "./student.interface"
import { Tutor } from "./tutor.interface"

export enum EnrollmentStatus {
  ACTIVO = "ACTIVO",
  CANCELADO = "CANCELADO",
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  ANULADO = "ANULADO",
}

export enum Modality {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
  HIBRIDO = "HIBRIDO",
}

export enum Shift {
  MANANA = "MANANA",
  TARDE = "TARDE",
  NOCHE = "NOCHE",
}

export enum TutorType {
  PADRE = "PADRE",
  MADRE = "MADRE",
  TUTOR = "TUTOR",
}


export interface Enrollment {
  id: string
  startDate: string
  endDate: string
  studentId: string
  codeStudent: string
  admissionId: string
  cycle: Cycle
  career: Career
  modality: Modality
  shift: Shift
  credit: boolean
  numInstallments: number
  paymentCarnet: boolean
  carnetCost: number
  totalCost: number
  initialPayment?: number
  discounts?: number
  notes?: string
  status: EnrollmentStatus
  createdAt: string
  updatedAt: string

  student?: Student
}

export interface EnrollmentWithStudent  {
  id: string
  enrollmentId?: string
  startDate: string
  endDate: string
  codeStudent: string
  studentName: string
  studentPhone?: string
  studentImage: string
  careerName: string
  // [key: string]: unknown
}
export interface MetaData {
  lastPage: number;
  page: number;
  total: number;
}

export interface EnrollmentListResponse {
  data: Enrollment[];
  meta: MetaData;
}
export interface CreateEnrollmentDto {
  startDate: string
  endDate: string
  studentId: string
  admissionId: string
  cycleId: string
  careerId: string
  modality: Modality
  shift: Shift
  credit: boolean
  numInstallments: number
  paymentCarnet: boolean
  carnetCost: number
  totalCost: number
  initialPayment?: number
  discounts?: number
  notes?: string
  status?: EnrollmentStatus
}

export interface TutorStudentData {
  tutorId?: string;
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1: string;
  phone2?: string;
  type: TutorType;
  observation?: string;

  studentId?: string;
  studentFirstName: string;
  studentLastName: string;
  studentDni?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentAddress?: string;
  studentSchool?: string;
  studentBirthday?: string;

}

export interface TutorStudentNestedData {
  tutor: Tutor;
  student: Student;
}

export type ConflictResolutionAction = 'edit' | 'create' | 'cancel';

export interface TutorConflict {
  show: boolean;
  existingTutor?: Tutor;
  newTutorData?: TutorStudentData;
}

export interface ApiErrorDetails {
  message: string;
  existingTutor?: Tutor;
  isConflict?: boolean;
  [key: string]: unknown;
}