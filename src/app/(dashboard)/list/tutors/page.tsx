import { Suspense } from "react";
import Search from "@/components/forms/EnrollmentSearchForm";
import TutorTable from "./tutorTable";

const TutorListPage = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Lista de Apoderados</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <Search placeholder="Buscar Apoderado..." />
        </div>
      </div>

      <Suspense
        key={`${query}-${currentPage}`}
        fallback={<div className="p-4 text-center">Cargando apoderados...</div>}
      >
        <TutorTable query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
};

export default TutorListPage;