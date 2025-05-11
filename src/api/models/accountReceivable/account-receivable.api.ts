import { AccountReceivable, CreateAccountReceivable } from "@/api/interfaces/account-receivable.interface"
import fetchWrapper from "@/api/services/api"

export class AccountReceivableService {
  
  static  listAccountReceivablesByStudent(id: string){
    const data  =  fetchWrapper<AccountReceivable[]>(`/account-receivables/student/${id}`)   
    return data
  }

  static async listAccountReceivablesByCodeStudent(codeStudent: string) {
    const data = await fetchWrapper<AccountReceivable[]>(`/account-receivables/codeStudent/${codeStudent}`)
    return data
  }

  static async listAccountReceivables() {
    const data = await fetchWrapper<AccountReceivable[]>("/account-receivables")
    return data
  }
  
  static async getAccountReceivableById(id: string) {
    return fetchWrapper<AccountReceivable>(`/account-receivables/${id}`)
  }

  static async createAccountReceivable(data: AccountReceivable) {
    return await fetchWrapper<AccountReceivable>("/account-receivables", {
      method: "POST",
      body: data,
    })
  }
}