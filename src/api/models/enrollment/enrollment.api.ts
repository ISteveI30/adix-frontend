import fetchWrapper from "@/api/services/api"
import { CreateEnrollmentDto, Enrollment, EnrollmentListResponse } from "@/api/interfaces/enrollment.interface"
// import { currentUser } from '@clerk/nextjs/server'

// const user = await currentUser()
// const username: string  = user?.firstName as string
// const userId: string  = user?.id as string


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
}
