import { External } from "@/api/interfaces/external.interface";
import { fetchWrapper } from "@/api/services/api";

export class ExternalService {

  static async create(external: External): Promise<any> {
    return await fetchWrapper<External>("/external", {
      method: "POST",
      body: external,
    });
  }
}