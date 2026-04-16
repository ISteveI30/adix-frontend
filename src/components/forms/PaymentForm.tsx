"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountReceivable } from "@/api/interfaces/account-receivable.interface";
import {
  CreatePaymentDto,
  PaymentMethod,
} from "@/api/interfaces/payment.interface";
import { PaymentService } from "@/api/models/payment/payment.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentForm({ data }: { data: AccountReceivable }) {
  const router = useRouter();

  const studentOrEnrollmentBackUrl = useMemo(() => {
    if ((data as any)?.enrollmentId) {
      return `/list/payments/${(data as any).enrollmentId}`;
    }
    if ((data as any)?.studentId) {
      return `/list/enrollments`;
    }
    return `/list/enrollments`;
  }, [data]);

  const [form, setForm] = useState<CreatePaymentDto>({
    accountReceivableId: data.id,
    dueDate: new Date().toISOString(),
    amountPaid: Number(data.pendingBalance),
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: PaymentMethod.EFECTIVO,
    invoiceNumber: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(form.amountPaid) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    try {
      setSaving(true);
      await PaymentService.createPayment({
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
        paymentDate: new Date(form.paymentDate).toISOString(),
      });
      toast.success("Pago registrado correctamente");
      router.push(studentOrEnrollmentBackUrl);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo registrar el pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Concepto</label>
          <Input value={data.concept} disabled />
        </div>
        <div>
          <label className="text-sm font-medium">Saldo Pendiente</label>
          <Input value={String(data.pendingBalance)} disabled />
        </div>
        <div>
          <label className="text-sm font-medium">Monto a pagar</label>
          <Input
            type="number"
            step="0.01"
            value={form.amountPaid}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amountPaid: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha de pago</label>
          <Input
            type="date"
            value={form.paymentDate.slice(0, 10)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, paymentDate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Método de pago</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={form.paymentMethod}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                paymentMethod: e.target.value as PaymentMethod,
              }))
            }
          >
            {Object.values(PaymentMethod).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Número de recibo</label>
          <Input
            value={form.invoiceNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))
            }
            placeholder="Opcional"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Notas</label>
          <Input
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        Si pagas un monto mayor al saldo de esta cuota, el sistema aplicará el excedente a las
        siguientes cuotas pendientes de la misma matrícula.
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(studentOrEnrollmentBackUrl)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Registrar Pago"}
        </Button>
      </div>
    </form>
  );
}