"use client"

import { StudentListResponse, StudentWithTutor } from "@/api/interfaces/student.interface";
import { StudentService } from "@/api/models/student/students.api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { Edit3Icon, EyeOffIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useDeferredValue } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 7;

const columns: ColumnDefinition<StudentWithTutor>[] = [
  { header: "Info", accessor: "info" },
  { header: "DNI", accessor: "dni", className: "hidden md:table-cell" },
  { header: "Celular", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Padre/Apoderado", accessor: "tutorName", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function StudentTable({
  query,
  currentPage = 1,
}: {
  query: string;
  currentPage?: number;
}) {
  const [dataStudent, setDataStudent] = useState<StudentWithTutor[]>([]);
  const [dataStudentList, setDataStudentList] = useState<StudentWithTutor[]>([]);
  const [metaData, setMetaData] = useState({
    lastPage: 1,
    page: 1,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPageState, setCurrentPageState] = useState(currentPage);

  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await StudentService.listStudentsByPage(page, ITEMS_PER_PAGE);

      const { data, meta }: StudentListResponse = Array.isArray(response) ? response[0] : response;

      if (!data || data.length === 0) {
        setDataStudent([]);
        setMetaData({
          lastPage: 1,
          page: 1,
          total: 0
        });
        console.info("No se encontraron datos de estudiantes.");
        return;
      }

      const transformed = data.map((item): StudentWithTutor => ({
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


      setDataStudent(transformed);
      setMetaData(meta);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await StudentService.listStudents();
      const { data } = Array.isArray(response) ? response[0] : response;

      const transformed = data.map((item): StudentWithTutor => ({
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
      setDataStudentList(transformed);
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchAllData();
      setCurrentPageState(1);
    } else {
      fetchData(currentPageState);
    }
  }, [query, currentPageState]);


  const filteredData = query
    ? dataStudentList.filter((student) =>
      `${student.firstName} ${student.lastName} ${student.dni}`.toLowerCase().includes(query.toLowerCase())
    )
    : dataStudent;

  const deferredData = useDeferredValue(filteredData)
  
  const handlePageChange = (page: number) => {
    setCurrentPageState(page);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
      try {
        const response = await StudentService.deleteStudent(id);
        if (!response.state) {
          toast.error(response.message);
          return;
        }
        toast.success(response.message);
        fetchData(currentPageState);
      } catch (error) {
        console.error("Error al eliminar el estudiante:", error);
        toast.error("Error al eliminar el estudiante");
      }
    }
  };

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
          <div className="flex items-center gap-2">
            <Link href={`/list/students/edit/${item.id}?page=${currentPage}`} title="Editar Estudiante">
              <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500 text-white cursor-pointer">
                <Edit3Icon size={16} />
              </Button>
            </Link>

            {ROLE === "admin" && (
              <Button
                title="Eliminar"
                onClick={() => handleDelete(item.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
              >
                <Trash2Icon size={16} />
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando estudiantes...</div>;
  }

  return (
    <>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={deferredData}
      />
      {metaData.total > ITEMS_PER_PAGE && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            totalPages={metaData.lastPage}
          />
        </div>
      )}
    </>
  );
}