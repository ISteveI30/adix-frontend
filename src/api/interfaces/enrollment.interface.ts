import { Career } from "./career.interface"
import { Cycle } from "./cycle.interface"

export enum EnrollmentStatus {
  ACTIVO = "Activo",
  CANCELADO = "Pagado",
  PENDIENTE = "Pendiente",
}

export enum Modality {
  PRESENCIAL = "Presencial",
  VIRTUAL = "Virtual",
  HIBRIDO = "Híbrido",
}

export enum Shift {
  MANANA = "Mañana",
  TARDE = "Tarde",
  NOCHE = "Noche",
}

export interface Enrollment {
  id: string
  startDate: string
  endDate: string
  studentId: string
  cycle: Cycle
  career: Career
  modality: Modality
  shift: Shift
  credit: boolean
  paymentCarnet: boolean
  carnetCost: number
  totalCost: number
  initialPayment?: number
  discounts?: number
  notes?: string
  status: EnrollmentStatus
  createdAt: string
  updatedAt: string
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
  paymentCarnet: boolean
  carnetCost: number
  totalCost: number
  initialPayment?: number
  discounts?: number
  notes?: string
  status?: EnrollmentStatus
}
