"use client";

import { StudentList, StudentListResponse } from "@/api/interfaces/student.interface";
import { StudentService } from "@/api/models/student/students.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

type StudentRow = Omit<StudentList, "id"> & {
  id: string;
  tutorName: string;
  latestCycle: string;
  latestCareer: string;
  latestEnrollment: string;
  actions: string;
  info: string;
};

const columns: ColumnDefinition<StudentRow>[] = [
  { header: "Info", accessor: "info" },
  { header: "DNI", accessor: "dni", className: "hidden md:table-cell" },
  { header: "Celular", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Padre/Apoderado", accessor: "tutorName", className: "hidden lg:table-cell" },
  { header: "Última Matrícula", accessor: "latestEnrollment", className: "hidden lg:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

function getLatestEnrollment(student: StudentList) {
  if (!student.enrollments || student.enrollments.length === 0) return null;
  return student.enrollments[0];
}

export default function StudentTable({
  query,
  currentPage = 1,
}: {
  query: string;
  currentPage?: number;
}) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [meta, setMeta] = useState({
    lastPage: 1,
    page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const deferredRows = useDeferredValue(rows);

  const fetchData = async (page?: number, searchData?: boolean) => {
    try {
      setLoading(true);

      page = page || currentPage;
      const response = searchData && query.trim()
        ? await StudentService.listStudents()
        : await StudentService.listStudentsByPage(page, ITEMS_PER_PAGE);

      const { data, meta } = Array.isArray(response) ? response[0] : response;

      const transformed: StudentRow[] = (data || [])
        .filter((student: StudentList) => {
          if (!query.trim()) return true;

          const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
          const tutorName = `${student.tutor?.firstName || ""} ${student.tutor?.lastName || ""}`.toLowerCase();
          const dni = `${student.dni || ""}`.toLowerCase();
          const search = query.toLowerCase();

          return (
            fullName.includes(search) ||
            tutorName.includes(search) ||
            dni.includes(search)
          );
        })
        .map((student: StudentList): StudentRow => {
          const latestEnrollment = getLatestEnrollment(student);

          return {
            ...student,
            id: student.id!,
            tutorName:
              `${student.tutor?.firstName || ""} ${student.tutor?.lastName || ""}`.trim() ||
              "No registrado",
            latestCycle: latestEnrollment?.cycle?.name || "Sin matrícula",
            latestCareer: latestEnrollment?.career?.name || "Sin matrícula",
            latestEnrollment: latestEnrollment
              ? `${latestEnrollment?.cycle?.name || "Sin ciclo"} - ${latestEnrollment?.career?.name || "Sin carrera"}`
              : "Sin matrícula",
            info: `${student.firstName} ${student.lastName}`,
            actions: "actions",
          };
        });

      setRows(transformed);

      if (searchData && query.trim()) {
        setMeta({
          lastPage: 1,
          page: 1,
          total: transformed.length,
        });
      } else {
        setMeta(meta);
      }
    } catch (error) {
      console.error("Error cargando alumnos:", error);
      setRows([]);
      setMeta({
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

  const renderRow = (item: StudentRow) => {
    const latestEnrollment = getLatestEnrollment(item);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50"
      >
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.image || "/avatar.png"}
            alt={`${item.firstName} ${item.lastName}`}
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">
              {item.firstName} {item.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              {latestEnrollment?.career?.name || "Sin matrícula activa"}
            </p>
          </div>
        </td>

        <td className="hidden md:table-cell">{item.dni || "No registrado"}</td>
        <td className="hidden md:table-cell">{item.phone || "No registrado"}</td>
        <td className="hidden lg:table-cell">{item.tutorName}</td>
        <td className="hidden lg:table-cell">
          {latestEnrollment ? (
            <div className="flex flex-col">
              <span className="font-medium">{item.latestCycle}</span>
              <span className="text-xs text-gray-500">{item.latestCareer}</span>
            </div>
          ) : (
            <span className="text-gray-500">Sin matrícula</span>
          )}
        </td>

        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}/current-enrollment`}>
              <Button
                size="icon"
                className="w-7 h-7 rounded-full bg-amber-500 text-white"
                title="Ver matrícula actual"
              >
                <Eye size={16} />
              </Button>
            </Link>

            <Link href={`/list/students/edit/${item.id}?page=${currentPage}`}>
              <Button
                size="icon"
                className="w-7 h-7 rounded-full bg-blue-600 text-white"
                title="Editar alumno"
              >
                <Pencil size={16} />
              </Button>
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div>Cargando alumnos...</div>;
  }

  return (
    <>
      <TableView columns={columns} renderRow={renderRow} data={deferredRows} />

      {meta.total > ITEMS_PER_PAGE && !query.trim() && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={meta.lastPage} />
        </div>
      )}
    </>
  );
}