"use client"

import { Student } from '@/api/interfaces/student.interface'
import { schemaStudent } from '@/app/(dashboard)/list/students/validate.student'
import React, { useActionState } from 'react'
import { Button } from '../ui/button';
import { StudentService } from '@/api/models/student/students.api';
import { redirect } from 'next/navigation';
import InputFieldUpdate from '../customs/InputFieldUpdate';
import { toast } from 'sonner';

interface StudentFormProps {
  data: Student;
  page?: number;
  onSuccess?: (updateStudentForm: Student) => void;
}

const StudentForm = (
  { data, page, onSuccess }: StudentFormProps
) => {

  const handleSubmit = async (
    _: unknown,
    formData: FormData,
  ) => {
    const rawData = Object.fromEntries(formData.entries())
    const parsedData: Student = schemaStudent.parse({
      ...rawData, id: data.id, tutorId: data.tutorId
    })

    const response = await StudentService.updateStudent(parsedData)
    if (!response) {
      toast.error('Error al actualizar el estudiante')
      return
    }
    onSuccess?.(response)
    toast.success('Estudiante actualizado correctamente')
    redirect(`/list/students?page=${page}`)

  }

  const handleCancel = () => {
    redirect(`/list/students?page=${page}`)
  }

  const [state, submitAction, isPending] = useActionState(handleSubmit, null)

  return (

    <form action={submitAction} className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
        <InputFieldUpdate
          label="Nombre"
          name="firstName"
          defaultValue={data.firstName}
          inputProps={{ maxLength: 50, minLength: 3, pattern: '[a-zA-Z ]*' }}
        />
        <InputFieldUpdate
          label="Apellido"
          name="lastName"
          defaultValue={data.lastName}
          inputProps={{ maxLength: 50, minLength: 3, pattern: '[a-zA-Z ]*' }}
        />
        <InputFieldUpdate
          label="DNI"
          name="dni"
          defaultValue={data.dni}
          inputProps={{ maxLength: 8, pattern: "[0-9]*" }}
        />
        <InputFieldUpdate
          label="Teléfono"
          name="phone"
          defaultValue={data.phone}
          inputProps={{ maxLength: 9, pattern: "[0-9]*" }}
        />
        <InputFieldUpdate
          label="Email"
          name="email"
          defaultValue={data.email}
        />
        <InputFieldUpdate
          label="Dirección"
          name="address"
          defaultValue={data.address}
        />
        <InputFieldUpdate
          label="Escuela"
          name="school"
          defaultValue={data.school}
        />
        {/* <InputFieldUpdate
            label="Imagen"
            name="image"
            defaultValue={data.image}
          /> */}
        <InputFieldUpdate
          label="Fecha de Nacimiento"
          name="birthday"
          type="date"
          defaultValue={data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''}
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

export default StudentForm