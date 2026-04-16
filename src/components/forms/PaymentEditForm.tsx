"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PaymentMethod, UpdatePaymentDto } from "@/api/interfaces/payment.interface";
import { PaymentService } from "@/api/models/payment/payment.api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function PaymentEditForm({ data }: { data: UpdatePaymentDto }) {
  const router = useRouter();

  const backUrl = useMemo(() => {
    const enrollmentId = data.accountReceivable?.enrollment?.id;
    if (enrollmentId) return `/list/payments/${enrollmentId}`;
    return `/list/enrollments`;
  }, [data]);

  const [form, setForm] = useState<UpdatePaymentDto>({
    id: data.id,
    invoiceNumber: data.invoiceNumber || "",
    paymentDate: data.paymentDate ? data.paymentDate.slice(0, 10) : "",
    paymentMethod: data.paymentMethod,
    notes: data.notes || "",
    accountReceivable: data.accountReceivable,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await PaymentService.updatePayment({
        ...form,
        paymentDate: form.paymentDate
          ? new Date(form.paymentDate).toISOString()
          : undefined,
      });
      toast.success("Pago actualizado");
      router.push(backUrl);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo actualizar el pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl border bg-white p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Fecha de Pago</label>
          <Input
            type="date"
            value={form.paymentDate || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, paymentDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Número de Recibo</label>
          <Input
            value={form.invoiceNumber || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))
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
          <label className="text-sm font-medium">Notas</label>
          <Input
            value={form.notes || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(backUrl)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}