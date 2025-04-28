import { CreatePaymentDto, PaymentAnulateDto, PaymentDto } from "@/api/interfaces/payment.interface"
import fetchWrapper from "@/api/services/api"

export class PaymentService {
  static async listPayments() {
    return await fetchWrapper<PaymentDto>("/payments")
  }
  
  static async createPayment(createPaymentDto: CreatePaymentDto) {
    console.log("createPaymentDto: ", createPaymentDto)
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


  static async updatePayment(data: PaymentDto) {
    return await fetchWrapper<PaymentDto>(`/payments/${data.id}`, {
      method: "PUT",
      body: data,
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