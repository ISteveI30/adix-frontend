import fetchWrapper from "@/api/services/api";

export type AttendanceScheduleSetting = {
  id: string;
  shift: "MANANA" | "TARDE" | "NOCHE";
  start: string;
  punctualLimit: string;
  absenceCutoff: string;
  end: string;
};

export type UpdateAttendanceSchedulePayload = {
  start: string;
  punctualLimit: string;
  absenceCutoff: string;
  end: string;
};

export class AttendanceScheduleService {
  static async list() {
    return await fetchWrapper<AttendanceScheduleSetting[]>("/attendance-schedules");
  }

  static async update(
    shift: "MANANA" | "TARDE" | "NOCHE",
    data: UpdateAttendanceSchedulePayload,
  ) {
    return await fetchWrapper<AttendanceScheduleSetting>(
      `/attendance-schedules/${shift}`,
      {
        method: "PATCH",
        body: data,
      },
    );
  }
}