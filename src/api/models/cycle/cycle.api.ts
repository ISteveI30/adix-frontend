import { Cycle } from "@/api/interfaces/cycle.interface";
import { fetchWrapper } from "@/api/services/api";

export class CycleService {
   static async getAllCycles(): Promise<Cycle[]> {
    return await fetchWrapper<Cycle[]>("/cycles", { method: "GET" });
  }

  static async getById(id: string): Promise<Cycle> {
    return await fetchWrapper<Cycle>(`/cycles/${id}`, { method: "GET" });
  }
}