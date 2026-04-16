export type ReportMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type PaymentReportRow = {
  id: string;
  codeStudent: string;
  studentFullName: string;
  admissionName: string;
  cycleName: string;
  areaName: string;
  careerName: string;
  shift: string;
  concept: string;
  totalAmount: number;
  amountPaid: number;
  pendingBalance: number;
  dueDate: string;
  status: string;
};

export type PaymentReportResponse = {
  summary: {
    totalRows: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  };
  data: PaymentReportRow[];
  meta: ReportMeta;
};

export type AttendanceReportRow = {
  id: string;
  codeStudent: string;
  studentFullName: string;
  admissionName: string;
  cycleName: string;
  areaName: string;
  careerName: string;
  shift: string;
  date: string;
  entryTime: string | null;
  status: string;
  notes: string;
};

export type AttendanceReportResponse = {
  summary: {
    totalRows: number;
    asistio: number;
    tardanza: number;
    falta: number;
    justificadas: number;
  };
  data: AttendanceReportRow[];
  meta: ReportMeta;
};

export type ExamReportRow = {
  id: string;
  examTitle: string;
  examType: string;
  modality: string;
  admissionName: string;
  cycleName: string;
  areaName: string;
  careerName: string;
  participantType: string;
  studentFullName: string;
  goodAnswers: number | null;
  wrongAnswers: number | null;
  totalScore: number | null;
  amountPaid: number;
  typePaid: string;
  statusPaid: string;
  registered: string;
};

export type ExamReportResponse = {
  summary: {
    totalRows: number;
    totalAmountPaid: number;
    averageScore: number;
    totalExams: number;
  };
  data: ExamReportRow[];
  meta: ReportMeta;
};

export type ReportFilterBase = {
  page?: number;
  limit?: number;
  admissionId?: string;
  cycleId?: string;
  areaId?: string;
  careerId?: string;
  dateFrom?: string;
  dateTo?: string;
  studentQuery?: string;
};

export type PaymentReportFilters = ReportFilterBase & {
  shift?: string;
  status?: string;
  concept?: string;
};

export type AttendanceReportFilters = ReportFilterBase & {
  shift?: string;
  status?: string;
};

export type ExamReportFilters = ReportFilterBase & {
  type?: string;
  modality?: string;
  examId?: string;
  statusPaid?: string;
};