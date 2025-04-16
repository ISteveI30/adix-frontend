
enum PaymentStatus {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  ANULADO = "ANULADO"
}

enum PaymentMethod {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA_BANCARIA = "TRANSFERENCIA_BANCARIA",
  TARJETA = "TARJETA"
}

export interface PaymentDto {
  id: string
  accountReceivableId: string
  invoiceNumber: string
  dueDate: string
  amountPaid: number
  paymentDate?: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  notes?: string
}

export interface CreatePaymentDto {
  id?: string
  accountReceivableId: string
  invoiceNumber: string
  dueDate: string
  amountPaid: number
  paymentDate?: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  notes?: string
}