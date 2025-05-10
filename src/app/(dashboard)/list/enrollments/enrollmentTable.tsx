"use client"

import { EnrollmentListResponse, EnrollmentWithStudent } from "@/api/interfaces/enrollment.interface";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { BadgeDollarSignIcon, CalendarDaysIcon, EyeOffIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useDeferredValue } from "react";
import Swal from "sweetalert2";

const columns: ColumnDefinition<EnrollmentWithStudent>[] = [
  { header: "Info", accessor: "info" },
  { header: "Código de Alumno", accessor: "codeStudent", className: "hidden md:table-cell" },
  { header: "Fecha de Inicio", accessor: "startDate", className: "hidden md:table-cell" },
  { header: "Celular", accessor: "studentPhone", className: "hidden lg:table-cell" },
  { header: "Fecha de Fin", accessor: "endDate", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function EnrollmentTable({
  query,
  currentPage = 1,
}: {
  query: string;
  currentPage?: number;
}) {
  const [dataEntollment, setDataEnrollment] = useState<EnrollmentWithStudent[]>([]);
  const [metaData, setMetaData] = useState({
    lastPage: 1,
    page: 1,
    total: 0
  });
  const [loading, setLoading] = useState(true);


  const fetchData = async (page?: number, searchData?: boolean) => {
    try {
      setLoading(true);

      page = page || currentPage;
      let response: EnrollmentListResponse = { data: [], meta: { lastPage: 1, page: 1, total: 0 } };

      if (searchData) {
        response = await EnrollmentService.listEnrollments();
      } else {
        response = await EnrollmentService.listEnrollmentsByPage(page, ITEMS_PER_PAGE);
      }
      const { data, meta }: EnrollmentListResponse = Array.isArray(response) ? response[0] : response;

      if (!data || data.length === 0) {
        setDataEnrollment([]);
        setMetaData({
          lastPage: 1,
          page: 1,
          total: 0
        });
        console.info("No se encontraron datos de matrícula.");
        return;
      }

      const transformed = data.map((item): EnrollmentWithStudent => ({
        id: item.studentId,
        enrollmentId: item.id,
        codeStudent: item.codeStudent,
        studentName: `${item.student?.firstName} ${item.student?.lastName}`,
        careerName: item.career.name,
        studentImage: item.student?.image ?? "/avatar.png",
        studentPhone: item.student?.phone,
        startDate: new Date(item.startDate).toLocaleDateString(),
        endDate: new Date(item.endDate).toLocaleDateString(),
      }));

      setDataEnrollment(transformed);
      setMetaData(meta);
    } catch (error) {
      console.error("Error al obtener datos de matrícula:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (query) {
      fetchData(1, true);
    } else {
      fetchData(currentPage, false);
    }
  }, [query, currentPage]);

  async function handleDelete(id: string) {
    Swal.fire({
          title: "¿Está seguro?",
          text: "No podrás revertir esto!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await EnrollmentService.deleteEnrollment(id);
            setDataEnrollment(prev => prev.filter(item => item.id !== id));
            Swal.fire("¡Anulado!",`Matrícula Eliminada`, "success");
          }
        });
  };

  const filteredData = query
    ? dataEntollment.filter((student) =>
      `${student.studentName} ${student.codeStudent}`.toLowerCase().includes(query.toLowerCase())
    )
    : dataEntollment;

  const deferredData = useDeferredValue(filteredData)

  const renderRow = (item: EnrollmentWithStudent) => {
    return (
      <tr key={item.enrollmentId} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-200">
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.studentImage}
            alt={`Foto de ${item.studentName}`}
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.studentName}</h3>
            <p className="text-xs text-gray-500">{item.careerName}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.codeStudent}</td>
        <td className="hidden md:table-cell">{item.startDate}</td>
        <td className="hidden lg:table-cell">{item.studentPhone}</td>
        <td className="hidden md:table-cell">{item.endDate}</td>
        <td>
          <div className="flex items-center gap-2">
  
            <Link href={`/list/schedule/${item.codeStudent}`} title="Ver Cronograma">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-500 text-white cursor-pointer">
                <CalendarDaysIcon size={16} />
              </button>
            </Link>
            <Link href={`/list/payments/${item.id}`} title="Ver Pagos">
              <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500 text-white cursor-pointer">
                <BadgeDollarSignIcon size={16} />
              </Button>
            </Link>
            {ROLE === "admin" && (
              <button
                title="Eliminar"
                onClick={() => handleDelete(item.enrollmentId!)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
              >
                <Trash2Icon size={16} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div>Cargando Lista Estudiantes matriculados...</div>;
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