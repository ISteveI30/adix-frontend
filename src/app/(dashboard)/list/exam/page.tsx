"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { ExamService } from "@/api/models/exam/exam.api";
import { ExamSummary } from "@/api/interfaces/exam.interface";
import { CreateExam, CreateExamWithExternal } from "@/components/customs/ButtonsForm";
import { Button } from "@/components/ui/button";
import { Pencil, GraduationCap, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "@/components/customs/Pagination";

const PAGE_SIZE = 10;

const columns: ColumnDefinition<ExamSummary>[] = [
  { header: "Examen", accessor: "title" },
  { header: "Modalidad", accessor: "modality" },
  { header: "Asignados", accessor: "assigned" },
  { header: "Acciones", accessor: "actions" },
];

const ExamPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = useMemo(
    () => data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [data, page],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await ExamService.summary();
        setData(rows);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudieron cargar los exámenes", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar examen?",
      text: "El examen será eliminado de forma lógica.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    await ExamService.delete(id);
    setData((prev) => prev.filter((x) => x.id !== id));
  };

  const renderRow = (item: ExamSummary) => (
    <tr key={item.id} className="border-b text-sm">
      <td className="py-3">{item.title}</td>
      <td className="py-3">{item.modality}</td>
      <td className="py-3 text-right pr-6">{item.assigned}</td>
      <td className="py-3">
        <div className="flex justify-end gap-2 pr-6">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-blue-600"
            title="Editar examen (participantes y pagos)"
            onClick={() => router.push(`/list/exam/${item.id}/manage`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-yellow-500"
            title="Asignar notas"
            onClick={() => router.push(`/list/exam/${item.id}/edit`)}
          >
            <GraduationCap className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-red-600"
            title="Eliminar"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <div className="p-4">Cargando exámenes...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Registro de exámenes</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <CreateExam />
        <CreateExamWithExternal />
      </div>

      <TableView columns={columns} renderRow={renderRow} data={pageData} />
      <div className="mt-6 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
};

export default ExamPage;