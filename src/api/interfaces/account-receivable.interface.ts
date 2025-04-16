
enum PaymentStatus {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  ANULADO = "ANULADO"
}

export interface AccountReceivable {
  id: string
  paymentDate?: string
  studentId?: string
  totalAmount: number
  pendingBalance: number
  dueDate: string
  status: PaymentStatus
  concept: string
}

export interface CreateAccountReceivable {
  id?: string
  paymentDate: string
  studentId: string
  totalAmount: number
  pendingBalance: number
  dueDate: string
  concept: string
  status: PaymentStatus
}