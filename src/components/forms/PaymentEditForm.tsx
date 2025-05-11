"use client"


import { useActionState } from 'react'
import InputFieldUpdate from '../customs/InputFieldUpdate'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { PaymentMethod, UpdatePaymentDto } from '@/api/interfaces/payment.interface'
import { Button } from '../ui/button'
import { redirect } from 'next/navigation'
import Swal from 'sweetalert2'
import { PaymentService } from '@/api/models/payment/payment.api'
import { validatePaymentUpdateSchema } from '@/app/(dashboard)/list/payments/validate-payment'

const PaymentEditForm = (
  { data }: { data: UpdatePaymentDto } 
) => {

  const handleSubmit = async (
    _: unknown,
    formData: FormData,
  ) => {
    const rawData = Object.fromEntries(formData.entries())

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
        const paymentData: UpdatePaymentDto = {
          ...rawData,
          id: data.id,
        }
        
        const result = validatePaymentUpdateSchema.safeParse(paymentData)
        
        if (!result.success) {
          console.error("Validation failed:", result.error);
          return;
        }
        const parsedData: UpdatePaymentDto = result.data;

        const response = await PaymentService.updatePayment(parsedData)
        if (!response) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el pago.',
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Guardado',
            text: 'Los cambios se han guardado correctamente.',
          })
          handleCancel()
        }
      }
    })
  }

  const [isError, formAction, isPending] = useActionState(handleSubmit, null)
 
  if (isError) {
    return <div>Error al guardar el pago</div>
  }

  const handleCancel = () => {
    redirect("/list/payments/" + data.accountReceivable!.studentId!)
  }


  return (
    <form action={formAction} className="flex flex-col gap-4 p-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
        <InputFieldUpdate name="paymentDate" label="Fecha de Pago" type="date" defaultValue={data.paymentDate!.split("T")[0]} />
        <InputFieldUpdate name="invoiceNumber" label="Número de Recibo" type="text" defaultValue={data.invoiceNumber} />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Método de pago</label>
          <Select
            name="paymentMethod"
            defaultValue={data.paymentMethod}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md p-2">
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
        <InputFieldUpdate name="notes" label="Notas" type="text" defaultValue={data.notes} />
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

export default PaymentEditForm