import fetchWrapper from "@/api/services/api";
import { InterestedSchema } from "@/app/(dashboard)/list/interested/validate.interested";

export interface InterestedListResponse {
  data: InterestedSchema[];
  meta: {
    total: number;
    lastPage: number;
    page: number;
  };
}

function stripEmpty<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  ) as Partial<T>;
}

function sanitizeInterestedPayload(data?: Partial<InterestedSchema>) {
  const safeData = data ?? {};

  return stripEmpty({
    firstName: safeData.firstName,
    lastName: safeData.lastName,
    email: safeData.email,
    phone1: safeData.phone1,
    phone2: safeData.phone2,
    careerId: safeData.careerId,
    cycleId: safeData.cycleId,
  });
}

export class InterestedService {
  static async listInterested(): Promise<InterestedListResponse> {
    return await fetchWrapper<InterestedListResponse>("/interested");
  }

  static async listInterestedByPage(
    page: number,
    limit: number,
  ): Promise<InterestedListResponse> {
    return await fetchWrapper<InterestedListResponse>(
      `/interested?page=${page}&limit=${limit}`,
    );
  }

  static async getInterestedById(id: string): Promise<InterestedSchema> {
    return await fetchWrapper<InterestedSchema>(`/interested/${id}`);
  }

  static async createInterested(
    data: InterestedSchema,
  ): Promise<InterestedSchema> {
    const payload = sanitizeInterestedPayload(data);

    return await fetchWrapper<InterestedSchema>("/interested", {
      method: "POST",
      body: payload,
    });
  }

  static async updateInterested(
    idOrData: string | Partial<InterestedSchema>,
    maybeData?: Partial<InterestedSchema>,
  ): Promise<InterestedSchema> {
    const id =
      typeof idOrData === "string"
        ? idOrData
        : String((idOrData as Partial<InterestedSchema>)?.id || "");

    if (!id) {
      throw new Error("El id del interesado es requerido para actualizar");
    }

    const payload =
      typeof idOrData === "string"
        ? sanitizeInterestedPayload(maybeData)
        : sanitizeInterestedPayload(idOrData);

    return await fetchWrapper<InterestedSchema>(`/interested/${id}`, {
      method: "PATCH",
      body: payload,
    });
  }

  static async deleteInterested(
    id: string,
  ): Promise<InterestedSchema | { message?: string }> {
    return await fetchWrapper<InterestedSchema | { message?: string }>(
      `/interested/${id}`,
      {
        method: "DELETE",
      },
    );
  }

  // Compatibilidad con código existente
  static async create(data: InterestedSchema): Promise<InterestedSchema> {
    return this.createInterested(data);
  }

  static async update(
    idOrData: string | Partial<InterestedSchema>,
    maybeData?: Partial<InterestedSchema>,
  ): Promise<InterestedSchema> {
    return this.updateInterested(idOrData, maybeData);
  }

  static async remove(
    id: string,
  ): Promise<InterestedSchema | { message?: string }> {
    return this.deleteInterested(id);
  }

  static async getById(id: string): Promise<InterestedSchema> {
    return this.getInterestedById(id);
  }
}