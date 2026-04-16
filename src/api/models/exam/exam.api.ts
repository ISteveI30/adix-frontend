import fetchWrapper from "@/api/services/api";
import {
  CreateExamDto,
  CreateExamWithDetailsDto,
  Exam,
  ExamRosterRow,
  ExamSummary,
  SavePaymentRow,
  SaveScoreRow,
  SyncParticipantsDto,
} from "@/api/interfaces/exam.interface";

export class ExamService {
  static async summary(): Promise<ExamSummary[]> {
    return await fetchWrapper<ExamSummary[]>("/exam/summary");
  }

  static async list(): Promise<Exam[]> {
    return await fetchWrapper<Exam[]>("/exam");
  }

  static async getById(id: string): Promise<Exam> {
    return await fetchWrapper<Exam>(`/exam/${id}`);
  }

  static async create(dto: CreateExamDto) {
    return await fetchWrapper<Exam>("/exam", {
      method: "POST",
      body: dto,
    });
  }

  static async createWithDetails(dto: CreateExamWithDetailsDto) {
    return await fetchWrapper<{ exam: Exam; createdStudents: number; createdInterested: number }>(
      "/exam/create-with-details",
      {
        method: "POST",
        body: dto,
      },
    );
  }

  static async update(id: string, dto: { title?: string }) {
    return await fetchWrapper<Exam>(`/exam/${id}`, {
      method: "PATCH",
      body: dto,
    });
  }

  static async delete(id: string) {
    return await fetchWrapper<{ deleted: boolean }>(`/exam/${id}`, {
      method: "DELETE",
    });
  }

  static async roster(id: string): Promise<ExamRosterRow[]> {
    return await fetchWrapper<ExamRosterRow[]>(`/exam/${id}/roster`);
  }

  static async syncParticipants(id: string, dto: SyncParticipantsDto) {
    return await fetchWrapper<{ added: number; removed: number }>(`/exam/${id}/participants`, {
      method: "PUT",
      body: dto,
    });
  }

  static async addParticipants(id: string, dto: SyncParticipantsDto) {
    return await fetchWrapper<{ added: number }>(`/exam/${id}/participants/add`, {
      method: "POST",
      body: dto,
    });
  }

  static async removeParticipants(id: string, dto: SyncParticipantsDto) {
    return await fetchWrapper<{ removed: number }>(`/exam/${id}/participants/remove`, {
      method: "POST",
      body: dto,
    });
  }

  static async saveScores(id: string, rows: SaveScoreRow[]) {
    return await fetchWrapper<{ updated: number }>(`/exam/${id}/scores`, {
      method: "PATCH",
      body: { rows },
    });
  }

  static async savePayments(id: string, rows: SavePaymentRow[]) {
    return await fetchWrapper<{ updated: number }>(`/exam/${id}/payments`, {
      method: "PATCH",
      body: { rows },
    });
  }
}