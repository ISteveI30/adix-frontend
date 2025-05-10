import { TutorListResponse, TutorWithStudent } from "@/api/interfaces/tutor.interface"
import { TutorService } from "@/api/models/tutor/tutor.api"
import { ITEMS_PER_PAGE } from "@/api/services/api"
import Pagination from "@/components/customs/Pagination"
import TableView, { ColumnDefinition } from "@/components/customs/TableView"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"
import { EyeIcon } from "lucide-react"
import Link from "next/link"
import { use } from "react"

const columns: ColumnDefinition<TutorWithStudent>[] = [
  { header: "Info", accessor: "info" },
  { header: "Celular", accessor: "phone1", className: "hidden lg:table-cell" },
  { header: "Tipo de Tutor", accessor: "type", className: "hidden md:table-cell" },
  { header: "Hijos", accessor: "students", className: "hidden md:table-cell" },
  { header: "Observación", accessor: "observation", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
]

const TutorTable = (
  props: {
    query: string;
    currentPage?: number;
  }
) => {

  let { query, currentPage } = props
  currentPage = currentPage || 1

  const tutorData: TutorListResponse = use(TutorService.getTutorsByPage(currentPage, ITEMS_PER_PAGE))
  const allTutorsData: TutorListResponse = use(TutorService.getAllTutors())

  const { data, meta }: TutorListResponse = Array.isArray(tutorData) ? tutorData[0] : tutorData
  const { data: allTutors }: TutorListResponse = Array.isArray(allTutorsData) ? allTutorsData[0] : allTutorsData

  const filteredData = query.length > 0
    ? allTutors.filter((tutor) => `${tutor.firstName} ${tutor.lastName} ${tutor.dni}`.toLowerCase().includes(query.toLowerCase()))
    : []

  const filteredLastPage = query.length > 0 ? Math.ceil(filteredData.length / ITEMS_PER_PAGE) : meta.lastPage
  const dataRender = !query ? data : filteredData

  const renderRow = (item: TutorWithStudent) => {
    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-green-50 ">
        <td className="flex items-center gap-4 p-4">
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
            <p className="text-xs text-gray-500">DNI: {item.dni}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </td>
        <td className="p-2 hidden lg:table-cell">{item.phone1}</td>
        <td className="p-2 hidden md:table-cell">{item.type}</td>
        <td className="p-2 hidden md:table-cell">{item.students ? item.students.length : 0}</td>
        <td className="p-2 hidden md:table-cell">{item.observation}</td>
        <td>
          <div className="flex items-start gap-2">
            <Link href={`/list/tutors/${item.id}?page=${currentPage}`} title="Ver Apoderado" className="w-full">
              <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 cursor-pointer">
                <EyeIcon size={16} />
              </Button>
            </Link>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={query.length > 0 ? dataRender.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) : data}
      />
      {meta.total > ITEMS_PER_PAGE && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            totalPages={query.length > 0 ? filteredLastPage : meta.lastPage}
          />
        </div>
      )}
    </>
  )
}

export default TutorTable

