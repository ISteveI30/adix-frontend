import fetchWrapper from "@/api/services/api";
import {
  AttendanceReportFilters,
  AttendanceReportResponse,
  ExamReportFilters,
  ExamReportResponse,
  PaymentReportFilters,
  PaymentReportResponse,
} from "@/api/interfaces/report.interface";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

function buildQuery(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export class ReportService {
  static async getPaymentReport(filters: PaymentReportFilters) {
    return await fetchWrapper<PaymentReportResponse>(
      `/report/payments${buildQuery(filters)}`,
    );
  }

  static async getAttendanceReport(filters: AttendanceReportFilters) {
    return await fetchWrapper<AttendanceReportResponse>(
      `/report/attendance${buildQuery(filters)}`,
    );
  }

  static async getExamReport(filters: ExamReportFilters) {
    return await fetchWrapper<ExamReportResponse>(
      `/report/exams${buildQuery(filters)}`,
    );
  }

  static getPaymentExportUrl(filters: PaymentReportFilters) {
    return `${API_BASE}/report/payments/export${buildQuery(filters)}`;
  }

  static getAttendanceExportUrl(filters: AttendanceReportFilters) {
    return `${API_BASE}/report/attendance/export${buildQuery(filters)}`;
  }

  static getExamExportUrl(filters: ExamReportFilters) {
    return `${API_BASE}/report/exams/export${buildQuery(filters)}`;
  }
}