"use client";

import { TutorListResponse } from "@/api/interfaces/tutor.interface";
import { TutorService } from "@/api/models/tutor/tutor.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

type TutorRow = {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone1?: string;
  type: string;
  observation?: string;
  studentCount: number;
  info: string;
  apoderado: string;
  actions: string;
};

const columns: ColumnDefinition<TutorRow>[] = [
  { header: "Info", accessor: "info" },
  { header: "Apoderado", accessor: "apoderado" },
  { header: "Celular", accessor: "phone1", className: "hidden md:table-cell" },
  { header: "Tipo de Tutor", accessor: "type", className: "hidden md:table-cell" },
  { header: "Hijos", accessor: "studentCount", className: "hidden md:table-cell" },
  { header: "Observación", accessor: "observation", className: "hidden lg:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function TutorTable({
  query,
  currentPage = 1,
}: {
  query: string;
  currentPage?: number;
}) {
  const [rows, setRows] = useState<TutorRow[]>([]);
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
      let response: TutorListResponse;

      if (searchData && query.trim()) {
        response = await TutorService.listTutors();
      } else {
        response = await TutorService.listTutorsByPage(page, ITEMS_PER_PAGE);
      }

      const { data, meta } = Array.isArray(response) ? response[0] : response;

      const transformed: TutorRow[] = (data || [])
        .filter((tutor: TutorListResponse["data"][number]) => {
          if (!query.trim()) return true;

          const fullName = `${tutor.firstName} ${tutor.lastName}`.toLowerCase();
          const dni = `${tutor.dni || ""}`.toLowerCase();
          const search = query.toLowerCase();

          return fullName.includes(search) || dni.includes(search);
        })
        .map((tutor: TutorListResponse["data"][number]) => ({
          id: tutor.id,
          firstName: tutor.firstName,
          lastName: tutor.lastName,
          dni: tutor.dni,
          email: tutor.email,
          phone1: tutor.phone1,
          type: tutor.type,
          observation: tutor.observation,
          studentCount: tutor.students?.length || 0,
          info: `${tutor.firstName} ${tutor.lastName}`,
          apoderado: `${tutor.firstName} ${tutor.lastName}`,
          actions: "actions",
        }));

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
      console.error("Error cargando tutores:", error);
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

  const renderRow = (item: TutorRow) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-semibold">
            {item.firstName} {item.lastName}
          </span>
          <span className="text-xs text-gray-500">DNI: {item.dni || "-"}</span>
          <span className="text-xs text-gray-500">{item.email || ""}</span>
        </div>
      </td>
      <td>{item.firstName} {item.lastName}</td>
      <td className="hidden md:table-cell">{item.phone1 || "No registrado"}</td>
      <td className="hidden md:table-cell">{item.type}</td>
      <td className="hidden md:table-cell">{item.studentCount}</td>
      <td className="hidden lg:table-cell">{item.observation || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/tutors/${item.id}?page=${currentPage}`}>
            <Button size="icon" className="w-7 h-7 rounded-full bg-blue-600 text-white">
              <Pencil size={16} />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <div>Cargando apoderados...</div>;
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