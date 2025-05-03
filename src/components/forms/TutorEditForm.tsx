"use client"

import { UpdateTutor } from '@/api/interfaces/tutor.interface'
import { redirect } from 'next/navigation';
import { useActionState } from 'react'
import InputFieldUpdate from '../customs/InputFieldUpdate';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { TutorType } from '@/api/interfaces/enrollment.interface';
import { TutorService } from '@/api/models/tutor/tutor.api';
import Swal from 'sweetalert2';

interface TutorEditPageProps {
  data: UpdateTutor
  page?: number
  onSuccess?: (updateTutorForm: UpdateTutor) => void;
}

const TutorEditForm = (
  { data, page, onSuccess }: TutorEditPageProps
) => {

  const handleSubmit = async (
    _: unknown,
    formData: FormData,
  ) => {
    const rawData = Object.fromEntries(formData.entries())
    const parsedData: UpdateTutor = {
      ...rawData, id: data.id
    }
    const response = await TutorService.updateTutor(parsedData)
    if (!response) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el tutor',
      })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tutor actualizado correctamente',
      })
      onSuccess?.(response)
      handleCancel()
    }

  }

  const handleCancel = () => {
    redirect(`/list/tutors?page=${page}`)
  }

  const [isError, editAction, isPending] = useActionState(handleSubmit, null)

  if (isError) {
    console.error('Error al editar el tutor', isError)
  }

  return (

    <form action={editAction} className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
        <InputFieldUpdate
          label="Nombre"
          name="firstName"
          defaultValue={data.firstName}
          inputProps={
            { maxLength: 50, minLength: 3, pattern: '[a-zA-Z ]*' }
          }
        />
        <InputFieldUpdate
          label="Apellido"
          name="lastName"
          defaultValue={data.lastName}
          inputProps={
            { maxLength: 50, minLength: 3, pattern: '[a-zA-Z ]*' }
          }
        />
        <InputFieldUpdate
          label="DNI"
          name="dni"
          defaultValue={data.dni}
          inputProps={
            { maxLength: 8, minLength: 8, pattern: '[0-9]*' }
          }
        />
        <InputFieldUpdate
          label="Celular"
          name="phone1"
          defaultValue={data.phone1}
          inputProps={
            { maxLength: 9, minLength: 9, pattern: '[0-9]*' }
          }
        />
        <InputFieldUpdate
          label="Email"
          name="email"
          defaultValue={data.email}
          type='email'  
        />
        <div>
          <label className="text-sm font-semibold text-gray-700">Tipo de Apoderado</label>
          <Select
            name="type"
            defaultValue={data.type}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md p-2">
              <SelectValue placeholder="Seleccionar tipo de apoderado" />
            </SelectTrigger>
            <SelectContent>
              {
                Object.values(TutorType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))
              }

            </SelectContent>
          </Select>

        </div>
        <InputFieldUpdate
          label="Teléfono 2"
          name="phone2"
          defaultValue={data.phone2}
          inputProps={
            { maxLength: 9, pattern: '[0-9]*' }
          }
        />
        <InputFieldUpdate
          label="Observación"
          name="observation"
          defaultValue={data.observation}
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

export default TutorEditForm