import { Exam } from "@/api/interfaces/exam.interface";
import { fetchWrapper } from "@/api/services/api";
import { ExamSummary } from '@/api/interfaces/exam.interface';

export type ScoreRowPayload = { detailId: string; score: number | null };

export class ExamService {

  static async create(data: Partial<Exam>): Promise<Exam> {
    return await fetchWrapper<Exam>("/exam", {
      method: "POST",
      body: data,
    });
  }

  static async getAll(): Promise<Exam[]> {
    return await fetchWrapper<Exam[]>("/exam", { method: "GET" });
  }

  static async getById(id: string): Promise<Exam> {
    return await fetchWrapper<Exam>(`/exam/${id}`, { method: "GET" });
  }
  static async getRoster(examId: string) {
    return await fetchWrapper(`/exam/${examId}/roster`);
  }

  static async updateTitle(examId: string, title: string) {
    return await fetchWrapper(`/exam/${examId}`, {
      method: "PATCH",
      body: { title },
    });
  }

  static async syncParticipants(examId: string, payload: { studentIds: string[]; interestedIds: string[] }) {
    return await fetchWrapper(`/exam/${examId}/participants`, {
      method: "PUT",
      body: payload,
    });
  }

  static async updateScores(examId: string, rows: ScoreRowPayload[]): Promise<void> {
    await fetchWrapper<void>(`/exam/${examId}/scores`, {
      method: "PATCH",
      body: { rows }, 
    });
  }



  static async saveScores(
    examId: string,
    rows: { detailId: string; score: number | null }[],
  ) {
    return await fetchWrapper(`/exam/${examId}/scores`, {
      method: "PATCH",
      body: { rows },
    });
  }
  static async update(id: string, data: Partial<Exam>): Promise<Exam> {
    return await fetchWrapper<Exam>(`/exam/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  static async delete(id: string): Promise<void> {
    return await fetchWrapper<void>(`/exam/${id}`, { method: "DELETE" });
  }

  static async createWithDetails(payload: {
    title: string;
    modality: string;
    type: string;
    cycleId: string;
    studentIds?: string[];
    interestedIds?: string[];
  }) {
    return await fetchWrapper<{
      exam: Exam;
      createdStudents: number;
      createdInterested: number;
    }>("/exam/create-with-details", {
      method: "POST",
      body: payload,
    });
  }



  static async getSummary() {
    return await fetchWrapper('/exam/summary', { method: 'GET' });
  }
}
