import fetchWrapper from "@/api/services/api";
import { AttendanceRow, ScanAttendanceResponse } from "@/api/interfaces/attendance.interface";

export class AttendanceService {
  static async scan(barcodeValue: string) {
    return await fetchWrapper<ScanAttendanceResponse>("/attendance/scan", {
      method: "POST",
      body: { barcodeValue },
    });
  }

  static async listBySection(params?: {
    date?: string;
    admissionId?: string;
    cycleId?: string;
    careerId?: string;
  }) {
    const query = new URLSearchParams();

    if (params?.date) query.set("date", params.date);
    if (params?.admissionId) query.set("admissionId", params.admissionId);
    if (params?.cycleId) query.set("cycleId", params.cycleId);
    if (params?.careerId) query.set("careerId", params.careerId);

    return await fetchWrapper<AttendanceRow[]>(
      `/attendance/by-section${query.toString() ? `?${query.toString()}` : ""}`,
    );
  }

  static async updateStatus(id: string, data: { status: string; notes?: string }) {
    return await fetchWrapper(`/attendance/${id}/status`, {
      method: "PATCH",
      body: data,
    });
  }

  static async upsertStatus(data: {
    studentId: string;
    date: string;
    status: string;
    notes?: string;
  }) {
    return await fetchWrapper("/attendance/upsert-status", {
      method: "POST",
      body: data,
    });
  }
}