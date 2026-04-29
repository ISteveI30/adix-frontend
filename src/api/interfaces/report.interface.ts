export type ReportMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type PaymentReceiptRow = {
  id: string;
  concept: string;
  totalAmount: number;
  amountPaid: number;
  pendingBalance: number;
  dueDate: string;
  status: string;
};

export type PaymentReportRow = {
  enrollmentId: string;
  codeStudent: string;
  studentFullName: string;
  dni: string;
  admissionName: string;
  cycleName: string;
  areaName: string;
  careerName: string;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  status: string;
  receipts: PaymentReceiptRow[];
};

export type PaymentReportResponse = {
  summary: {
    totalRows: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    pendingStudents: number;
    paidStudents: number;
  };
  data: PaymentReportRow[];
  meta: ReportMeta;
};

export type AttendanceRecordRow = {
  id: string;
  date: string;
  entryTime: string | null;
  status: string;
  notes: string;
};

export type AttendanceReportRow = {
  groupId: string;
  studentId: string;
  enrollmentId: string;
  codeStudent: string;
  studentFullName: string;
  dni: string;
  admissionName: string;
  cycleName: string;
  areaName: string;
  careerName: string;
  shift: string;
  attendanceCount: number;
  tardinessCount: number;
  absenceCount: number;
  records: AttendanceRecordRow[];
};

export type AttendanceReportResponse = {
  summary: {
    totalRows: number;
  };
  data: AttendanceReportRow[];
  meta: ReportMeta;
};

export type ExamReportStudentRow = {
  detailId: string;
  studentFullName: string;
  careerName: string;
  goodAnswers: number | null;
  wrongAnswers: number | null;
  totalScore: number | null;
  amountPaid: number;
  typePaid: string;
  statusPaid: string;
};

export type ExamReportRow = {
  examId: string;
  examTitle: string;
  examType: string;
  modality: string;
  admissionName: string;
  cycleName: string;
  studentsCount: number;
  students: ExamReportStudentRow[];
};

export type ExamReportResponse = {
  summary: {
    totalRows: number;
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
  status?: string;
};

export type AttendanceReportFilters = ReportFilterBase;

export type ExamReportFilters = ReportFilterBase & {
  type?: string;
  examName?: string;
};