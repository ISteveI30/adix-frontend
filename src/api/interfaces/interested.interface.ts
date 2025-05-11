import { MetaData } from "../services/api"

export interface InterestedColumns {
  id: string
  firstName: string
  lastName: string
  email: string
  phone1: string
  phone2?: string
}

export interface InterestedListResponse {
  data: InterestedColumns[]
  meta: MetaData
}
