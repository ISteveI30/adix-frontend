import { Admission } from "@/api/interfaces/admission.interface"
import { Career } from "@/api/interfaces/career.interface"
import { Cycle } from "@/api/interfaces/cycle.interface"
import fetchWrapper from "@/api/services/api"

export class MasterService {
  static async getCycles(): Promise<Cycle[]> {
    return fetchWrapper("/cycles")
  }

  static async getCareers(): Promise<Career[]> {
    return fetchWrapper("/careers")
  }

  static async getAdmissions(): Promise<Admission[]> {
    return fetchWrapper("/admissions")
  }
}
