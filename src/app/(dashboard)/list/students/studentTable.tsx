import { StudentListResponse, StudentWithTutor } from "@/api/interfaces/student.interface";
import { StudentService } from "@/api/models/student/students.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import {  EyeIcon,  } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {  use } from "react";


const columns: ColumnDefinition<StudentWithTutor>[] = [
  { header: "Info", accessor: "info" },
  { header: "DNI", accessor: "dni", className: "hidden md:table-cell" },
  { header: "Celular", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Padre/Apoderado", accessor: "tutorName", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function StudentTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage?: number;
}) {

  currentPage = currentPage || 1;

  const dataStudentByPage: StudentListResponse = use(StudentService.StudentByPage(currentPage, ITEMS_PER_PAGE))
  const allStudentsData: StudentListResponse[] = use(StudentService.listStudents())

  const { data, meta }: StudentListResponse = Array.isArray(dataStudentByPage) ? dataStudentByPage[0] : dataStudentByPage
  const { data: allStudents }: StudentListResponse = Array.isArray(allStudentsData) ? allStudentsData[0] : allStudentsData

  const dataStudent = data.map((item: StudentListResponse['data'][number]): StudentWithTutor => ({
    id: item.id!,
    firstName: item.firstName,
    lastName: item.lastName,
    dni: item.dni,
    email: item.email,
    phone: item.phone,
    image: item.image ?? "/avatar.png",
    school: item.school,
    tutorName: `${item.tutor?.firstName} ${item.tutor?.lastName}`,
  }))

  const dataStudentList = allStudents.map((item): StudentWithTutor => ({
    id: item.id!,
    firstName: item.firstName,
    lastName: item.lastName,
    dni: item.dni,
    email: item.email,
    phone: item.phone,
    image: item.image ?? "/avatar.png",
    school: item.school,
    tutorName: `${item.tutor?.firstName} ${item.tutor?.lastName}`,
  }));

  const filteredData = query.length > 0
    ? dataStudentList.filter((student) =>
      `${student.firstName} ${student.lastName} ${student.dni}`.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  const filteredLastPage = query.length > 0 ? Math.ceil(filteredData.length / ITEMS_PER_PAGE) : meta.lastPage;
  const renderData = query.length>0 ? filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE): dataStudent

  // const handleDelete = async (id: string) => {

  //   Swal.fire({
  //     title: "¿Estás seguro?",
  //     text: "No podrás revertir esto!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Sí, eliminar!",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       const response = await StudentService.deleteStudent(id);
  //       if (!response.state) {
  //         Swal.fire({
  //           icon: "error",
  //           title: "Error",
  //           text: response.message,
  //         });
  //         return;
  //       }
  //       // fetchData(currentPageState);
  //     }
  //   })
  // };

  const renderRow = (item: StudentWithTutor) => {
    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-200">
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.image!}
            alt={`Foto de ${item.firstName}`}
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{`${item.firstName} ${item.lastName}`}</h3>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.dni || 'No registrado'}</td>
        <td className="hidden lg:table-cell">{item.phone}</td>
        <td className="hidden md:table-cell">{item.tutorName}</td>
        <td>
          <div className="flex items-start gap-2">
            <Link href={`/list/students/edit/${item.id}?page=${currentPage}`} title="Editar Estudiante">
            <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 cursor-pointer">
              <EyeIcon size={16} />
            </Button>
            </Link>
          </div>
        </td>
      </tr>
    );
  }


  return (
    <>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={renderData}
      />
      {meta.total > ITEMS_PER_PAGE && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            totalPages={filteredLastPage}
          />
        </div>
      )}
    </>
  );
}