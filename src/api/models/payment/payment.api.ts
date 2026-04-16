import {
  CreatePaymentDto,
  PaymentAnulateDto,
  PaymentDto,
  UpdatePaymentDto,
} from "@/api/interfaces/payment.interface";
import fetchWrapper from "@/api/services/api";

export class PaymentService {
  static async listPayments() {
    return await fetchWrapper<PaymentDto[]>("/payments");
  }

  static async createPayment(createPaymentDto: CreatePaymentDto) {
    return await fetchWrapper<PaymentDto>("/payments", {
      method: "POST",
      body: createPaymentDto,
    });
  }

  static async getPaymentById(id: string) {
    return await fetchWrapper<PaymentDto>(`/payments/${id}`);
  }

  static async getPaymentsByStudentId(studentId: string) {
    return await fetchWrapper<PaymentDto[]>(`/payments/student/${studentId}`);
  }

  static async getPaymentsByEnrollmentId(enrollmentId: string) {
    return await fetchWrapper<PaymentDto[]>(`/payments/enrollment/${enrollmentId}`);
  }

  static async updatePayment(data: UpdatePaymentDto) {
    const { id, ...rest } = data;
    return await fetchWrapper<PaymentDto>(`/payments/${id}`, {
      method: "PATCH",
      body: rest,
    });
  }

  static async cancelPayment(id: string) {
    return await fetchWrapper<PaymentAnulateDto>(`/payments/cancel/${id}`, {
      method: "PATCH",
    });
  }

  static async deletePayment(id: string) {
    return await fetchWrapper<void>(`/payments/${id}`, {
      method: "DELETE",
    });
  }
}