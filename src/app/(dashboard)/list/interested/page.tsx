import { TutorSkeleton } from '@/components/customs/SkeletonTables';
import Search from '@/components/forms/EnrollmentSearchForm';
import { Suspense, use } from 'react'
import InterestedTable from './interestedTable';
import { CreateInterested } from '@/components/customs/ButtonsForm';


interface InterestedPageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>,
}

const InterestedPage = (props: InterestedPageProps) => {

  const searchParams = use(props.searchParams!)
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
    <div className="flex items-center justify-between">
      <h1 className="hidden md:block text-lg font-semibold">Lista de Interesados</h1>
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <Search placeholder="Buscar Interesado..." />
        <CreateInterested />
      </div>
    </div>
    <Suspense key={query + currentPage} fallback={<TutorSkeleton />}>
      <InterestedTable query={query} currentPage={currentPage} />
    </Suspense>

  </div>
  )
}

export default InterestedPage