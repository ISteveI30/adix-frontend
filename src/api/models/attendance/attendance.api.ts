import { Attendance } from "@/api/interfaces/attendance.interface";
import { fetchWrapper } from "@/api/services/api";

export class AttendanceService {

  static async create(attendance: Attendance): Promise<Attendance> {
    return await fetchWrapper<Attendance>("/attendance", {
      method: "POST",
      body: attendance,
    });
  }

  static async seedToday(): Promise<{ created: number }> {
    return await fetchWrapper<{ created: number }>("/attendance/seed-today", { method: "POST" });
  }
  static async listTardies(params: { areaId?: string; careerId?: string; onlyLatestAdmission?: boolean } = {}) {
    const u = new URLSearchParams();
    if (params.areaId) u.set("areaId", params.areaId);
    if (params.careerId) u.set("careerId", params.careerId);
    if (params.onlyLatestAdmission !== undefined) u.set("onlyLatestAdmission", String(params.onlyLatestAdmission));
    return await fetchWrapper<any[]>(`/attendance/tardies?${u.toString()}`, { method: "GET" });
  }
  static async justifyTardiness(attendanceId: string) {
    return await fetchWrapper(`/attendance/${attendanceId}/justify-tardiness`, { method: "PATCH" });
  }
}