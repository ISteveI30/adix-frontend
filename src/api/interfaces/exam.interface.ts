export enum TypeExam {
  DIARIO = "DIARIO",
  SEMANAL = "SEMANAL",
  SIMULACRO = "SIMULACRO",
}

export enum Modality {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
  HIBRIDO = "HIBRIDO",
}

export type ExamSummary = {
  id: string;
  title: string;
  modality: Modality | string;
  assigned: number;
};

export type Exam = {
  id: string;
  title: string;
  modality: Modality | string;
  type: TypeExam | string;
  cycleId: string;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateExamDto = {
  title: string;
  modality: Modality | string;
  type: TypeExam | string;
  cycleId: string;
};

export type CreateExamWithDetailsDto = {
  title: string;
  modality: Modality | string;
  type: TypeExam | string;
  cycleId: string;
  studentIds?: string[];
  interestedIds?: string[];
};

export type SyncParticipantsDto = {
  studentIds?: string[];
  interestedIds?: string[];
};

export type ExamRosterRow = {
  detailId: string;
  personKey: string;
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerName: string;
  goodAnswers: number | null;
  wrongAnswers: number | null;
  totalScore: number | null;
  amountPaid: number | null;
  typePaid: string | null;
  statusPaid: string | null;
};

export type SaveScoreRow = {
  detailId: string;
  goodAnswers?: number | null;
  wrongAnswers?: number | null;
  totalScore?: number | null;
};

export type SavePaymentRow = {
  detailId: string;
  amountPaid?: number | null;
  typePaid?: string | null;
  statusPaid?: string | null;
};

export type AssignableRow = {
  id: string;
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerId?: string;
  careerName?: string;
  areaId?: string;
};

export type ExamFormData = {
  title: string;
  modality: Modality | string;
  examType: TypeExam | string;
  cycleId: string;
  cycleName?: string;
};