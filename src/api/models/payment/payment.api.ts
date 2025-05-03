import { CreatePaymentDto, PaymentAnulateDto, PaymentDto, UpdatePaymentDto } from "@/api/interfaces/payment.interface"
import fetchWrapper from "@/api/services/api"

export class PaymentService {
  static async listPayments() {
    return await fetchWrapper<PaymentDto>("/payments")
  }
  
  static async createPayment(createPaymentDto: CreatePaymentDto) {
    return await fetchWrapper<CreatePaymentDto>("/payments", {
      method: "POST",
      body: createPaymentDto,
    })
  }

  static async getPaymentById(id: string) {
    return await fetchWrapper<PaymentDto>(`/payments/${id}`)
  }

  static async getPaymentsByStudentId(studentId: string) {
    const data = await fetchWrapper<PaymentDto[]>(`/payments/student/${studentId}`)
    return data
  }


  static async updatePayment(data: UpdatePaymentDto) {
    const { id, ...rest } = data
    return await fetchWrapper<UpdatePaymentDto>(`/payments/${id}`, {
      method: "PATCH",
      body: rest,
    })
  }

  static async cancelPayment(id: string) {
    return await fetchWrapper<PaymentAnulateDto>(`/payments/cancel/${id}`, {
      method: "PATCH",
    })
  }

  static async deletePayment(id: string) {
    return await fetchWrapper<PaymentDto>(`/payments/${id}`, {
      method: "DELETE",
    })
  }
}