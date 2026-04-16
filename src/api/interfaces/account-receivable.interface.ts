export enum PaymentStatus {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  ANULADO = "ANULADO",
}

export enum AccountReceivableCategory {
  MATRICULA = "MATRICULA",
  CARNET = "CARNET",
  OTRO = "OTRO",
}

export interface AccountReceivable {
  id: string;
  paymentDate?: string;
  studentId?: string;
  enrollmentId?: string;
  totalAmount: number;
  pendingBalance: number;
  amountPaid?: number;
  dueDate: string;
  status: PaymentStatus;
  category?: AccountReceivableCategory;
  concept: string;
  installmentNumber?: number;
  installmentTotal?: number;
}