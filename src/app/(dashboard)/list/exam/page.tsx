"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { ExamService } from "@/api/models/exam/exam.api";
import { ExamSummary } from "@/api/interfaces/exam.interface";
import { CreateExam, CreateExamWithExternal } from "@/components/customs/ButtonsForm";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import { Button } from "@/components/ui/button";
import { Pencil, GraduationCap } from "lucide-react";

const ExamPage = () => {
  const router = useRouter();
  const [data, setData] = useState<ExamSummary[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await ExamService.getSummary();
        setData(rows);
      } catch (e) {
        console.error("Error cargando exámenes:", e);
      }
    })();
  }, []);

  const columns: ColumnDefinition<ExamSummary>[] = [
    { header: "Examen", accessor: "info", className: "py-2" },
    { header: "Modalidad", accessor: "modality", className: "py-2" },
    { header: "Asignados", accessor: "assigned", className: "py-2 text-right pr-6" },
    { header: "Acciones", accessor: "actions", className: "py-2 text-right pr-6" },
  ];

  const renderRow = (item: ExamSummary) => (
    <tr key={item.id} className="border-b text-sm">
      <td className="py-3">{item.title}</td>
      <td className="py-3">{item.modality}</td>
      <td className="py-3 text-right pr-6">{item.assigned}</td>

      {/* ICONOS con placeholder/tooltip */}
      <td className="py-3">
        <div className="flex justify-end gap-2 pr-6">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-blue-500"
            title="Editar examen"
            aria-label="Asignar/editar notas"
            onClick={() => router.push(`/list/exam/${item.id}/edit`)}
          >
            <GraduationCap className="h-4 w-4 " />
          </Button>
        </div>
      </td>
    </tr>
  );

  const meta = { total: data.length, page: 1, lastPage: 1 };
  const renderData = useMemo(() => data, [data]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Registro de exámenes</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <CreateExam />
        <CreateExamWithExternal />
      </div>

      <>
        <TableView columns={columns} renderRow={renderRow} data={renderData} />
        {meta.total > ITEMS_PER_PAGE && (
          <div className="mt-5 flex w-full justify-center" />
        )}
      </>
    </div>
  );
};

export default ExamPage;
