import { AccountReceivable } from "@/api/interfaces/account-receivable.interface";
import fetchWrapper from "@/api/services/api";

export class AccountReceivableService {
  static async listAccountReceivables() {
    return await fetchWrapper<AccountReceivable[]>("/account-receivables");
  }

  static async getAccountReceivableById(id: string) {
    return await fetchWrapper<AccountReceivable>(`/account-receivables/${id}`);
  }

  static async listAccountReceivablesByCodeStudent(codeStudent: string) {
    return await fetchWrapper<AccountReceivable[]>(
      `/account-receivables/codeStudent/${codeStudent}`,
    );
  }

  static async listAccountReceivablesByStudentId(studentId: string) {
    return await fetchWrapper<AccountReceivable[]>(
      `/account-receivables/student/${studentId}`,
    );
  }
}