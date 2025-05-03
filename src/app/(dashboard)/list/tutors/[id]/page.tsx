import { Tutor } from '@/api/interfaces/tutor.interface'
import { TutorService } from '@/api/models/tutor/tutor.api'
import TutorEditForm from '@/components/forms/TutorEditForm'
import { Suspense, use } from 'react'

interface TutorEditPageProps {
  params: Promise<{
    id: string
  }>;
  searchParams: Promise<{
    page?: string
  }>
}

const TutorEditPage = ({ params, searchParams }: TutorEditPageProps) => {
  const { id } = use(params)
  
  const { page } = use(searchParams)

  const tutorData: Tutor = use(TutorService.getTutorById(id))

  return (
    <div className="flex flex-col gap-4 w-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xlg font-bold text-gray-800">Editar Datos de Apoderado</h2>
      <Suspense fallback={<div className="p-4 text-center">Cargando Datos del Apoderado...</div>}>
        <TutorEditForm
          data={tutorData}
          page={page ? Number(page) : 1}
        />
      </Suspense>
    </div>
  )
}

export default TutorEditPage