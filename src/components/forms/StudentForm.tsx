"use client"

import { Student } from '@/api/interfaces/student.interface'
import { schemaStudent } from '@/app/(dashboard)/list/students/validate.student'
import React, { useActionState } from 'react'
import { Button } from '../ui/button';
import { StudentService } from '@/api/models/student/students.api';
import { redirect } from 'next/navigation';
import InputFieldUpdate from '../customs/InputFieldUpdate';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { ROLE } from '@/lib/data';

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

    const parsedResult = schemaStudent.safeParse({
      ...rawData,
      id: data.id,
      tutorId: data.tutorId,
    })

    if (!parsedResult.success) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: parsedResult.error.errors[0].message,
      })
      return
    }

    const response = await StudentService.updateStudent({
      ...parsedResult.data,
      email: parsedResult.data.email!,
    })
    if (!response) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el estudiante',
      })
      return
    }
    onSuccess?.(response)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Estudiante actualizado correctamente',
    })
    redirect(`/list/students?page=${page}`)
  }

  const handleDelete = async (id: string) => {

    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await StudentService.deleteStudent(id);
        if (!response.state) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
          return;
        }
      }
    })
  };

  const handleCancel = () => {
    redirect(`/list/students?page=${page}`)
  }

  const [isError, submitAction, isPending] = useActionState(handleSubmit, null)

  if (isError) {
    toast.error('Error al actualizar el estudiante')
  }
  return (

    <form action={submitAction} className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
        <InputFieldUpdate
          label="Nombre"
          name="firstName"
          defaultValue={data.firstName}
          inputProps={{ maxLength: 50, minLength: 3, pattern: '[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*' }}
        />
        <InputFieldUpdate
          label="Apellido"
          name="lastName"
          defaultValue={data.lastName}
          inputProps={{ maxLength: 50, minLength: 3, pattern: '[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*' }}
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
          variant="outline"
          className="bg-gray-500 text-white rounded-md p-4 cursor-pointer"
          disabled={isPending}
        >
          Cancelar
        </Button>
        {
          ROLE === 'admin' && (
            <Button
              type="button"
              onClick={() => handleDelete(data.id!)}
              variant="destructive"
              className="bg-red-500 text-white rounded-md p-4 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )
        }
        <Button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-700 cursor-pointer"
          disabled={isPending}
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}

export default StudentForm