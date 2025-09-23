export enum Modality {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
  HIBRIDO = "HIBRIDO",
}

export enum TypeExam {
  DIARIO = "DIARIO",
  SEMANAL = "SEMANAL",
  SIMULACRO = "SIMULACRO",
}

// NUEVO: tipos de pago
export type PaymentMethod = 'YAPE' | 'PLIN' | 'RECIBO';
export type PaymentStatus = 'PAGO' | 'DEBE';

export interface Exam {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  modality: Modality;
  type: TypeExam;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  cycleId: string;
}

export interface ExamDetail {
  id: string;
  examId: string;
  studentId?: string;
  externalId?: string;

  goodAnswers?: number | null;
  wrongAnswers?: number | null;
  totalScore?: number | null;

  // NUEVO: pagos
  amountPaid?: number | null;
  typePaid?: PaymentMethod | null;
  statusPaid?: PaymentStatus | null;

  status?: string;
  registered: string;
}

export interface ExamSummary {
  id: string;
  title: string;
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
  assigned: number;
}

export type RosterRow = {
  personKey: string;             // studentId o "ext-{id}"
  detailId?: string;             // presente sólo si está asignado

  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerName?: string;

  goodAnswers?: number | null;
  wrongAnswers?: number | null;
  totalScore?: number | null;

  // NUEVO: pagos (para filas asignadas)
  amountPaid?: number | null;
  typePaid?: PaymentMethod | null;
  statusPaid?: PaymentStatus | null;
};
