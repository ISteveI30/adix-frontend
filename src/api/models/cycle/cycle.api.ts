import { Cycle } from "@/api/interfaces/cycle.interface";
import { fetchWrapper } from "@/api/services/api";

export class CycleService {
  static async list(): Promise<Cycle[]> {
    return await fetchWrapper<Cycle[]>("/cycles", { method: "GET" });
  }

  static async getById(id: string): Promise<Cycle> {
    return await fetchWrapper<Cycle>(`/cycles/${id}`, { method: "GET" });
  }

  static create(body: any) { return fetchWrapper('/cycles', { method: 'POST', body }); }
  static update(id: string, body: any) { return fetchWrapper(`/cycles/${id}`, { method: 'PATCH', body }); }
  static remove(id: string) { return fetchWrapper(`/cycles/${id}`, { method: 'DELETE' }); }
}