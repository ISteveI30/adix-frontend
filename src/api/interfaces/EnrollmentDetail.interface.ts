import { Career } from "./career.interface";
import { Cycle } from "./cycle.interface";
import { Student } from "./student.interface";
import { Admission } from "./admission.interface"; // si existe
import { Modality, Shift, EnrollmentStatus } from "./enrollment.interface";

export interface EnrollmentDetail {
  id: string;
  startDate: string;
  endDate: string;
  codeStudent: string;

  // Relaciones
  student: Student;
  career: Career;
  cycle: Cycle;
  admission?: Admission;

  // Datos académicos
  modality: Modality;
  shift: Shift;
  status: EnrollmentStatus;

  // Costos
  credit: boolean;
  carnetCost: number;
  totalCost: number;
  numInstallments: number;
  initialPayment?: number;
  discounts?: number;

  // Tiempos de control
  createdAt: string;
  updatedAt: string;
}
