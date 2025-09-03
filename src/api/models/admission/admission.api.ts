import { fetchWrapper } from "@/api/services/api";
export class AdmissionApi {
  static list() { return fetchWrapper<any[]>('/admissions', { method: 'GET' }); }
  static create(body: any) { return fetchWrapper('/admissions', { method: 'POST', body }); }
  static update(id: string, body: any) { return fetchWrapper(`/admissions/${id}`, { method: 'PATCH', body }); }
  static remove(id: string) { return fetchWrapper(`/admissions/${id}`, { method: 'DELETE' }); }
}
