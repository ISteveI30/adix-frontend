"use client"

import { useActionState } from 'react'
import InputFieldUpdate from '../customs/InputFieldUpdate'
import { Button } from '../ui/button'
import { interestedSchema } from '@/app/(dashboard)/list/interested/validate.interested'
import Swal from 'sweetalert2'
import { InterestedService } from '@/api/models/interested/interested.api'
import { InterestedColumns } from '@/api/interfaces/interested.interface'
import { redirect } from 'next/navigation'

const InterestedForm = (
  props: {
    dataEdit?: InterestedColumns
    page?: number
    type?: 'create' | 'update'
  }
) => {

  const currentPage = props.page || 1
  const actionType = props.type || 'create'

  const [isError, submitAction, isPending] = useActionState(handleSubmit, null)
    
  async function handleSubmit(
    _: unknown,
    formData: FormData,
  ) {

    const data = Object.fromEntries(formData.entries())
    
    if (actionType === 'update') {
      props.dataEdit?.id && (data.id = props.dataEdit.id)
    }
    const parseData = interestedSchema.safeParse(data)

    if (!parseData.success) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: parseData.error.errors[0].message,
      })
      return
    }
    if (actionType === 'update') {
      await InterestedService.update(parseData?.data)
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Interesado actualizado correctamente',
      })
    } else {
      await InterestedService.create(parseData.data)
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Interesado creado correctamente',
      })
    }
    handleCancel()
  }

  const handleCancel = () => {
    redirect(`/list/interested?page=${currentPage}`)
  }

  if (isError) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Registro',
      text: isError,
    })
  }

  return (
    <div className="flex flex-col gap-4 w-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800">
        {props.type === 'update' ? 'Editar interesado' : 'Registrar interesado'}
      </h2>
      <form action={submitAction} className="flex flex-col gap-4 p-4" >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
          <InputFieldUpdate
            name="firstName"
            label="Nombre"
            defaultValue={props.dataEdit?.firstName}
            inputProps={
              {
                maxLength: 50,
                minLength: 2,
                pattern: '[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*',
                required: true,
              }
            }
          />
          <InputFieldUpdate
            name="lastName"
            label="Apellido"
            defaultValue={props.dataEdit?.lastName}
            inputProps={
              {
                maxLength: 50,
                minLength: 2,
                pattern: '[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*',
                required: true,
              }
            }
          />
          <InputFieldUpdate
            name="email"
            label="Email"
            type="email"
            defaultValue={props.dataEdit?.email}
            inputProps={
              {
                maxLength: 50,
                required: true,
              }
            }
          />
          <InputFieldUpdate
            name="phone1"
            label="Teléfono"
            defaultValue={props.dataEdit?.phone1}
            inputProps={
              {
                maxLength: 9,
                minLength: 9,
                pattern: '[0-9]*',
                required: true,
              }
            }
          />
          <InputFieldUpdate
            name="phone2"
            label="Teléfono 2"
            defaultValue={props.dataEdit?.phone2}
            inputProps={
              {
                maxLength: 9,
                pattern: '[0-9]*',
              }
            }
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
            className="bg-blue-600 text-white hover:bg-blue-800"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default InterestedForm