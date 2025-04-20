"use client"

import { EnrollmentWithStudent } from "@/api/interfaces/enrollment.interface";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE } from "@/lib/data";
import { BadgeDollarSignIcon, CalendarDaysIcon, EyeOffIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 10;

const columns: ColumnDefinition<EnrollmentWithStudent>[] = [
  { header: "Info", accessor: "info" },
  { header: "Código de Alumno", accessor: "codeStudent", className: "hidden md:table-cell" },
  { header: "Fecha de Inicio", accessor: "startDate", className: "hidden md:table-cell" },
  { header: "Celular", accessor: "studentPhone", className: "hidden lg:table-cell" },
  { header: "Fecha de Fin", accessor: "endDate", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function EnrollmentTable({
  query
}: {
  query: string;
}) {
  const [dataEntollment, setDataEnrollment] = useState<EnrollmentWithStudent[]>([]);
  const [metaData, setMetaData] = useState({
    lastPage: 0,
    page: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { EnrollmentService } = await import("@/api/models/enrollment/enrollment.api");
      const { data, meta } = await EnrollmentService.listEnrollments();

      if (!data || data.length === 0) {
        setDataEnrollment([]);
        setMetaData(meta);
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
      setDataEnrollment([]);
      setMetaData({ lastPage: 0, page: 0, total: 0 });
      console.error("Error al obtener datos de matrícula:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta matrícula?")) {
      try {
        const { EnrollmentService } = await import("@/api/models/enrollment/enrollment.api");
        await EnrollmentService.deleteEnrollment(id);
        setDataEnrollment(prev => prev.filter(item => item.id !== id));
        console.log("Matrícula eliminada:", id);
      } catch (error) {
        console.error("Error al eliminar la matrícula:", error);
      }finally {
        fetchData();
      }
    }
  };

  const filteredData = dataEntollment.filter((student) =>
    `${student.studentName} ${student.codeStudent}`.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(metaData.total / ITEMS_PER_PAGE);
  const startIndex = (metaData.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const renderRow = (item: EnrollmentWithStudent) => {
    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-userPurpleLight">
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
            <Link href={`/list/enrollments/${item.id}`} title="Ver Detalles">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white cursor-pointer">
                <EyeOffIcon size={16} />
              </button>
            </Link>
            <Link href={`/list/schedule/${item.id}`} title="Ver Cronograma">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500 text-white cursor-pointer">
                <CalendarDaysIcon size={16} />
              </button>
            </Link>
            <Link href={`/list/payments/${item.id}`} title="Ver Pagos">
              <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-500 text-white cursor-pointer">
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
    // return <Skeleton className="h-10 w-full bg-amber-300" />;
    return <div>Cargando...</div>;
  }

  return (
    <>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={currentItems}
      />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}