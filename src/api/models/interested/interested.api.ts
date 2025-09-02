import { InterestedColumns, InterestedListResponse } from "@/api/interfaces/interested.interface";
import { fetchWrapper } from "@/api/services/api";
import { InterestedSchema } from "@/app/(dashboard)/list/interested/validate.interested";

export class InterestedService {

  static async getAll(): Promise<InterestedListResponse> {
    const response = await fetchWrapper<InterestedListResponse>(`/interested`);
    return response
  }

  static async getByPage(page: number, limit: number): Promise<InterestedListResponse> {
    const response = await fetchWrapper<InterestedListResponse>(`/interested?page=${page}&limit=${limit}`);
    return response
  }
  static async create(interested: Omit<InterestedSchema, "id">): Promise<InterestedSchema> {
    const response = await fetchWrapper<InterestedSchema>(`/interested`, {
      method: "POST",
      body: interested,
    });
    return response
  }

  static async update(interested: InterestedSchema): Promise<InterestedSchema> {
    const { id, ...rest } = interested
    const response = await fetchWrapper<InterestedSchema>(`/interested/${id}`, {
      method: "PATCH",
      body: rest,
    });
    return response
  }

  static async deleteOld(): Promise<InterestedSchema> {
    const response = await fetchWrapper<InterestedSchema>(`/interested/old`, {
      method: "DELETE",
    });
    return response
  }

  static async delete(id: string): Promise<InterestedSchema> {
    const response = await fetchWrapper<InterestedSchema>(`/interested/${id}`, {
      method: "DELETE",
    });
    return response
  }

  static async getById(id: string): Promise<InterestedColumns> {
    const response = await fetchWrapper<InterestedColumns>(`/interested/${id}`);
    return response
  }


  
}