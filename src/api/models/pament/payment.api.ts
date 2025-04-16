import { CreatePaymentDto, PaymentDto } from "@/api/interfaces/payment.interface"
import fetchWrapper from "@/api/services/api"

export class PaymentService {
  static async listPayments() {
    return fetchWrapper<PaymentDto>("/payments")
  }
  
  static async createPayment(createPaymentDto: CreatePaymentDto) {
    return fetchWrapper<CreatePaymentDto>("/payments", {
      method: "POST",
      body: createPaymentDto,
    })
  }

  static async getPaymentById(id: string) {
    return fetchWrapper<PaymentDto>(`/payments/${id}`)
  }

  static async getPaymentsByStudentId(studentId: string) {
    const data = await fetchWrapper<PaymentDto[]>(`/payments/student/${studentId}`)
    return data
  }


  static async updatePayment(data: PaymentDto) {
    return fetchWrapper<PaymentDto>(`/payments/${data.id}`, {
      method: "PUT",
      body: data,
    })
  }

  static async deletePayment(id: string) {
    return fetchWrapper<PaymentDto>(`/payments/${id}`, {
      method: "DELETE",
    })
  }
}