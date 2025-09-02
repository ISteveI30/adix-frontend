import { MetaData } from "../services/api"

export interface InterestedColumns {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  careerId: string;
  cycleId: string;
  career?: {
    id: string;
    name: string;
    areaId: string;
    area?: {
      id: string;
      name: string;
    };
  };
  cycle?: {
    id: string;
    name: string;
  };
}
export interface InterestedListResponse {
  data: InterestedColumns[]
  meta: MetaData
}
