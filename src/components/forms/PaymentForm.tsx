"use client"

import { CreatePaymentDto, PaymentMethod } from "@/api/interfaces/payment.interface"
import { validatePaymentSchema } from "@/app/(dashboard)/list/payments/validate-payment"
import { useActionState } from "react"
import InputFieldUpdate from "../customs/InputFieldUpdate"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AccountReceivable } from "@/api/interfaces/account-receivable.interface"
import { formatCurrency, formatDateToISO } from "@/lib/utils"
import { PaymentService } from "@/api/models/payment/payment.api"
import Swal from "sweetalert2"
import { redirect } from "next/navigation"


export function PaymentForm({ data }: { data: AccountReceivable }) {

  const [isError, formAction, isPending] = useActionState(handleSubmit, null)
  
  if (!data) {
    return <div>No hay datos</div>
  }

  async function handleSubmit (
    _: unknown,
    formData: FormData,
  ) {
    const rawData = Object.fromEntries(formData.entries())
    const result = validatePaymentSchema.safeParse({
      ...rawData,
      accountReceivableId: data.id,
      amountPaid: Number(rawData.amountPaid),
    });

    if (!result.success) {
      console.error("Validation failed:", result.error);
      return;
    }

    const parsedData: CreatePaymentDto = result.data;

    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres guardar los cambios?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar cambios',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await PaymentService.createPayment(parsedData)
        if (!response) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar el pago',
          })
          return
        }
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Pago guardado correctamente',
        })
        handleCancel()
      }
    }
    )
  }

  const handleCancel = () => {
    redirect("/list/schedule/" + data.studentId)
  }

  if (isError) {
    return <div>Error al guardar el pago</div>
  }
  
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="hidden" name="accountReceivableId" value={data.id} />

        <InputFieldUpdate
          name=""
          label="Deuda Total"
          type="text"
          defaultValue={formatCurrency(data.pendingBalance)}
          inputProps={{
            readOnly: true,
          }}
        />
        <InputFieldUpdate
          name="dueDate"
          label="Fecha de Vencimiento"
          type="date"
          defaultValue={data.dueDate.split("T")[0]}
          inputProps={
            {
              min: new Date().toISOString().split("T")[0],
              readOnly: true,
            }
          }
        />
        <InputFieldUpdate
          name="invoiceNumber"
          label="Número de Recibo"
          type="text"
        />
        <InputFieldUpdate
          name="paymentDate"
          label="Fecha de Pago"
          type="date"
          defaultValue={formatDateToISO(new Date())}
          inputProps={{
            max: data.dueDate.split("T")[0],
          }}
        />
        <div className="flex flex-col gap-4">
          <label className="text-xs text-gray-500">Método de pago</label>
          <Select
            name="paymentMethod"
            defaultValue={PaymentMethod.EFECTIVO}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un Método de Pago" />
            </SelectTrigger>
            <SelectContent >
              {Object.values(PaymentMethod).map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputFieldUpdate
          name="amountPaid"
          label="Monto"
          type="number"
          defaultValue={data.pendingBalance}
          inputProps={{
            min: 0,
            step: 0.01,
            //max: data.pendingBalance,
            pattern: "[0-9]*",
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <InputFieldUpdate
          name="notes"
          label="Notas"
          type="text"
          defaultValue={data.concept}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-around gap-3">
        <Button
          type="button"
          onClick={handleCancel}
          variant="destructive"
          className="bg-red-500 text-white rounded-md p-4 cursor-pointer"
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 cursor-pointer"
          disabled={isPending}
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )

}
