import fetchWrapper from "@/api/services/api"
import { CreateEnrollmentDto, Enrollment, EnrollmentListResponse } from "@/api/interfaces/enrollment.interface"
import { Modality } from "@/api/interfaces/exam.interface";
// import { currentUser } from '@clerk/nextjs/server'

// const user = await currentUser()
// const username: string  = user?.firstName as string
// const userId: string  = user?.id as string

export type ActivesFilters = {
  cycleId?: string;
  careerId?: string;
  modality?: string;
};

export class EnrollmentService {
  static async listEnrollments() {
    const listEnrollmente = await fetchWrapper<EnrollmentListResponse>("/enrollments")
    return listEnrollmente
  }

  static async listEnrollmentsByPage(page: number, limit: number): Promise<EnrollmentListResponse> {
    const listEnrollmente = await fetchWrapper<EnrollmentListResponse>(`/enrollments?page=${page}&limit=${limit}`)
    return listEnrollmente
  }

  static async createEnrollment(createEnrollmentDto: CreateEnrollmentDto) {
    return fetchWrapper<CreateEnrollmentDto>("/enrollments", {
      method: "POST",
      body: createEnrollmentDto,
    })
  }

  static async deleteEnrollment(id: string) {
    return fetchWrapper<Enrollment>(`/enrollments/${id}`, {
      method: "DELETE",
    })
  }
  static async listActives(filters: { cycleId: string; careerId?: string; modality?: string }) {
    const params = new URLSearchParams();
    if (filters.cycleId) params.set("cycleId", filters.cycleId);
    if (filters.modality) params.set("modality", filters.modality);
    if (filters.careerId) params.set("careerId", filters.careerId);
    return fetchWrapper<any[]>(`/enrollments/actives?${params.toString()}`, { method: "GET" });
  }

}
