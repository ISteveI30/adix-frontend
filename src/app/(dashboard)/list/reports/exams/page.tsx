"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MasterService } from "@/api/models/masters/masters";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { ReportService } from "@/api/models/report/report.api";
import {
  ExamReportFilters,
  ExamReportResponse,
} from "@/api/interfaces/report.interface";
import { toast } from "sonner";

function getSafeErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      errorData?: { message?: unknown };
    };

    if (typeof maybeError.message === "string") return maybeError.message;

    if (
      maybeError.errorData &&
      typeof maybeError.errorData === "object" &&
      typeof maybeError.errorData.message === "string"
    ) {
      return maybeError.errorData.message;
    }
  }

  return fallback;
}

export default function ExamReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ExamReportResponse | null>(null);

  const [admissions, setAdmissions] = useState<Array<{ id: string; name: string }>>([]);
  const [cycles, setCycles] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

  const [filters, setFilters] = useState<ExamReportFilters>({
    page: 1,
    limit: 20,
    admissionId: "",
    cycleId: "",
    areaId: "",
    careerId: "",
    type: "",
    modality: "",
    examId: "",
    studentQuery: "",
    statusPaid: "",
    dateFrom: "",
    dateTo: "",
  });

  const loadReport = async (currentFilters?: ExamReportFilters) => {
    try {
      setLoading(true);
      const data = await ReportService.getExamReport(currentFilters || filters);
      setReport(data);
    } catch (error) {
      toast.error(
        getSafeErrorMessage(error, "No se pudo cargar el reporte de exámenes"),
      );
      setReport({
        summary: {
          totalRows: 0,
          totalAmountPaid: 0,
          averageScore: 0,
          totalExams: 0,
        },
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 1,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [admissionsData, cyclesData, areasData] = await Promise.all([
          MasterService.getAdmissions(),
          MasterService.getCycles(),
          getAreas(),
        ]);
        setAdmissions(admissionsData);
        setCycles(cyclesData);
        setAreas(areasData);
      } catch {
        toast.error("No se pudieron cargar los filtros");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadCareers = async () => {
      if (!filters.areaId) {
        setCareers([]);
        setFilters((prev) => ({ ...prev, careerId: "" }));
        return;
      }

      try {
        const data = await getCareersByArea(filters.areaId!);
        setCareers(data);
      } catch {
        toast.error("No se pudieron cargar las carreras");
      }
    };

    loadCareers();
  }, [filters.areaId]);

  useEffect(() => {
    loadReport(filters);
  }, [filters.page, filters.limit]);

  const exportUrl = useMemo(
    () => ReportService.getExamExportUrl({ ...filters, page: 1, limit: 100000 }),
    [filters],
  );

  const applyFilters = async () => {
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    await loadReport(nextFilters);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      admissionId: "",
      cycleId: "",
      areaId: "",
      careerId: "",
      type: "",
      modality: "",
      examId: "",
      studentQuery: "",
      statusPaid: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reporte de Exámenes</h1>
        <div className="flex gap-2">
          <Link href="/list/reports">
            <Button variant="outline">Retroceder</Button>
          </Link>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Admisión</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.admissionId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, admissionId: e.target.value }))
            }
          >
            <option value="">Todas</option>
            {admissions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ciclo</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.cycleId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, cycleId: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {cycles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Área</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.areaId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, areaId: e.target.value }))
            }
          >
            <option value="">Todas</option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Carrera</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.careerId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, careerId: e.target.value }))
            }
          >
            <option value="">Todas</option>
            {careers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Tipo examen</label>
          <Input
            value={filters.type}
            onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
            placeholder="Ej. SIMULACRO"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Modalidad</label>
          <Input
            value={filters.modality}
            onChange={(e) =>
              setFilters((p) => ({ ...p, modality: e.target.value }))
            }
            placeholder="Ej. PRESENCIAL"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Alumno</label>
          <Input
            value={filters.studentQuery}
            onChange={(e) =>
              setFilters((p) => ({ ...p, studentQuery: e.target.value }))
            }
            placeholder="Buscar alumno"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Estado pago</label>
          <Input
            value={filters.statusPaid}
            onChange={(e) =>
              setFilters((p) => ({ ...p, statusPaid: e.target.value }))
            }
            placeholder="Ej. PAGO"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Fecha desde</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((p) => ({ ...p, dateFrom: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Fecha hasta</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((p) => ({ ...p, dateTo: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button onClick={applyFilters} className="bg-blue-600">
          Aplicar filtros
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>


      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Examen</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Modalidad</th>
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">Admisión</th>
              <th className="p-3 text-left">Ciclo</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Buenas</th>
              <th className="p-3 text-left">Malas</th>
              <th className="p-3 text-left">Puntaje</th>
              <th className="p-3 text-left">Pagado</th>
              <th className="p-3 text-left">Método</th>
              <th className="p-3 text-left">Estado pago</th>
            </tr>
          </thead>
          <tbody>
            {report?.data.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">{row.examTitle}</td>
                <td className="p-3">{row.examType}</td>
                <td className="p-3">{row.modality}</td>
                <td className="p-3">{row.studentFullName}</td>
                <td className="p-3">{row.admissionName}</td>
                <td className="p-3">{row.cycleName}</td>
                <td className="p-3">{row.careerName}</td>
                <td className="p-3">{row.goodAnswers ?? "-"}</td>
                <td className="p-3">{row.wrongAnswers ?? "-"}</td>
                <td className="p-3">{row.totalScore ?? "-"}</td>
                <td className="p-3">S/ {Number(row.amountPaid).toFixed(2)}</td>
                <td className="p-3">{row.typePaid}</td>
                <td className="p-3">{row.statusPaid}</td>
              </tr>
            ))}

            {!loading && (!report || report.data.length === 0) && (
              <tr>
                <td colSpan={13} className="p-4 text-center text-gray-500">
                  No hay resultados
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={13} className="p-4 text-center text-gray-500">
                  Cargando reporte...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={report?.meta.page || 1}
        lastPage={report?.meta.lastPage || 1}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Pagination({
  page,
  lastPage,
  onPageChange,
}: {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm">
        Página {page} de {lastPage}
      </span>
      <Button
        variant="outline"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
}