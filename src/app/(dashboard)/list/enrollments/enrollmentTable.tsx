"use client";

import { EnrollmentListResponse, EnrollmentWithStudent } from "@/api/interfaces/enrollment.interface";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { BadgeDollarSignIcon, CalendarDaysIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

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
  const [dataEnrollment, setDataEnrollment] = useState<EnrollmentWithStudent[]>([]);
  const [metaData, setMetaData] = useState({
    lastPage: 1,
    page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const deferredData = useDeferredValue(dataEnrollment);

  const fetchData = async (page?: number, searchData?: boolean) => {
    try {
      setLoading(true);

      page = page || currentPage;
      let response: EnrollmentListResponse;

      if (searchData && query.trim()) {
        response = await EnrollmentService.listEnrollments();
      } else {
        response = await EnrollmentService.listEnrollmentsByPage(page, ITEMS_PER_PAGE);
      }

      const { data, meta } = Array.isArray(response) ? response[0] : response;

      const transformed = (data || [])
        .filter((item: EnrollmentListResponse["data"][number]) => {
          if (!query.trim()) return true;

          const fullName = `${item.student?.firstName || ""} ${item.student?.lastName || ""}`.toLowerCase();
          const studentCode = `${item.codeStudent || ""}`.toLowerCase();
          const search = query.toLowerCase();

          return fullName.includes(search) || studentCode.includes(search);
        })
        .map(
          (item: EnrollmentListResponse["data"][number]): EnrollmentWithStudent => ({
            id: item.studentId,
            enrollmentId: item.id,
            codeStudent: item.codeStudent || "-",
            studentName: `${item.student?.firstName || ""} ${item.student?.lastName || ""}`.trim(),
            careerName: item.career?.name || "-",
            studentImage: item.student?.image ?? "/avatar.png",
            studentPhone: item.student?.phone || "-",
            startDate: new Date(item.startDate).toLocaleDateString(),
            endDate: new Date(item.endDate).toLocaleDateString(),
          }),
        );

      setDataEnrollment(transformed);

      if (searchData && query.trim()) {
        setMetaData({
          lastPage: 1,
          page: 1,
          total: transformed.length,
        });
      } else {
        setMetaData(meta);
      }
    } catch (error) {
      console.error("Error al obtener matrículas:", error);
      setDataEnrollment([]);
      setMetaData({
        lastPage: 1,
        page: 1,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      fetchData(1, true);
    } else {
      fetchData(currentPage, false);
    }
  }, [query, currentPage]);

  async function handleDelete(enrollmentId: string) {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "La matrícula será anulada solo si no tiene pagos registrados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
    });

    if (!result.isConfirmed) return;

    try {
      await EnrollmentService.deleteEnrollment(enrollmentId);
      await Swal.fire("Correcto", "Matrícula anulada", "success");
      fetchData(currentPage, !!query.trim());
      router.refresh();
    } catch (error: any) {
      await Swal.fire("Error", error?.message || "No se pudo anular la matrícula", "error");
    }
  }

  const renderRow = (item: EnrollmentWithStudent) => (
    <tr
      key={item.enrollmentId}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.studentImage}
          alt={item.studentName}
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

          <Link href={`/list/payments/${item.enrollmentId}`} title="Ver Pagos">
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

  if (loading) {
    return <div>Cargando Lista Estudiantes matriculados...</div>;
  }

  return (
    <>
      <TableView columns={columns} renderRow={renderRow} data={deferredData} />

      {metaData.total > ITEMS_PER_PAGE && !query.trim() && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={metaData.lastPage} />
        </div>
      )}
    </>
  );
}