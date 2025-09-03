import { fetchWrapper } from "@/api/services/api";
export class CareerApi {
  static list() { return fetchWrapper<any[]>('/careers', { method: 'GET' }); }
  static create(body: any) { return fetchWrapper('/careers', { method: 'POST', body }); }
  static update(id: string, body: any) { return fetchWrapper(`/careers/${id}`, { method: 'PATCH', body }); }
  static remove(id: string) { return fetchWrapper(`/careers/${id}`, { method: 'DELETE' }); } // soft delete
}
