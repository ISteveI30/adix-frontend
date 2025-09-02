import { fetchWrapper } from "@/api/services/api";

export class ExamDetailService {
    static async assignStudents(examId: string, studentIds: string[]): Promise<void> {
        await fetchWrapper<void>(`/examdetail/assign-students`, {
            method: "POST",
            body: { examId, studentIds },
        });
    }

    static async assignInterested(examId: string, interestedIds: string[]): Promise<void> {
        await fetchWrapper<void>(`/examdetail/assign-interested`, {
            method: "POST",
            body: { examId, interestedIds },
        });
    }

    static async getByExam(examId: string): Promise<any[]> {
        return await fetchWrapper<any[]>(`/examdetail/${examId}`, {
            method: "GET",
        });
    }


}
