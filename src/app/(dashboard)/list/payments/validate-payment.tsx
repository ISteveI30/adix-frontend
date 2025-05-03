import { PaymentMethod, PaymentStatus } from "@/api/interfaces/payment.interface";
import { z } from "zod";

export const validatePaymentSchema = z.object({
  id: z.string().optional(),
  accountReceivableId: z.string().uuid("ID de Cuenta por cobrar inválida"),
  invoiceNumber: z.string().optional(),
  dueDate: z.string(),
  amountPaid: z.number().positive("El monto debe ser mayor a 0").max(10000, "El monto no puede ser mayor a 10000"),
  paymentDate: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PAGADO),
  notes: z.string().optional(),
});


export const validatePaymentUpdateSchema = z.object({
  id: z.string().uuid("ID de Pago inválida"),
  invoiceNumber: z.string().optional(),
  paymentDate: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
});

export type ValidatePaymentSchema = z.infer<typeof validatePaymentSchema>;
export type ValidatePaymentUpdateSchema = z.infer<typeof validatePaymentUpdateSchema>;