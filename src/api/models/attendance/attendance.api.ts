import { Attendance } from "@/api/interfaces/attendance.interface";
import { fetchWrapper } from "@/api/services/api";

export class AttendanceService {

  static async create(attendance: Attendance): Promise<Attendance> {
    return await fetchWrapper<Attendance>("/attendance", {
      method: "POST",
      body: attendance,
    });
  }
}