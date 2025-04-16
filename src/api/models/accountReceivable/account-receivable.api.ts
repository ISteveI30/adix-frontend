import { AccountReceivable, CreateAccountReceivable } from "@/api/interfaces/account-receivable.interface"
import fetchWrapper from "@/api/services/api"

export class AccountReceivableService {
  
  static  listAccountReceivablesByStudent(id: string){
    const data  =  fetchWrapper<AccountReceivable[]>(`/account-receivables/student/${id}`)   
    return data
  }

  static async listAccountReceivables() {
    const data = await fetchWrapper<AccountReceivable[]>("/account-receivables")
    return data
 
  }
  
  static async createAccountReceivable(data: CreateAccountReceivable) {
    return fetchWrapper<CreateAccountReceivable>("/account-receivables", {
      method: "POST",
      body: data,
    })
  }
}