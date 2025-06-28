import { PlusIcon } from 'lucide-react'
import Link from 'next/link'


export function CreateEnrollment() {
  return (
    <Link
     href="/list/enrollments/new"
     title="Crear Nueva Matrícula"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Matrícula</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateStudent() {
  return (
    <Link
     href="/list/students/new"
     title="Crear Nuevo Alumno"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Alumno</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateInterested() {
  return (
    <Link
     href="/list/interested/new"
     title="Crear Nuevo Interesado"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Interesado</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  ); 
} 
//Botones para la funcioalidad de registro de examen
export function CreateExternal() {
  return (
    <Link
     href="/list/exam/newExternal"
     title="Registro Alumno - Simulacro"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Registro Alumno - Simulacro</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
} 

export function CreateExam() {
  return (
    <Link
     href="/list/exam/newExam"
     title="Crear Examen Regular"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Examen Regular</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
} 

export function CreateExamWithExternal() {
  return (
    <Link
     href="/list/exam/newExamWithExternal"
     title="Crear Examen Simulacro"
    className="flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Examen Simulacro</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
} 
