"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MasterService } from "@/api/models/masters/masters";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { ReportService } from "@/api/models/report/report.api";
import {
  AttendanceReportFilters,
  AttendanceReportResponse,
} from "@/api/interfaces/report.interface";
import { toast } from "sonner";

const SHIFTS = [
  { value: "", label: "Todos" },
  { value: "MANANA", label: "Mañana" },
  { value: "TARDE", label: "Tarde" },
];

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AttendanceReportResponse | null>(null);

  const [admissions, setAdmissions] = useState<Array<{ id: string; name: string }>>([]);
  const [cycles, setCycles] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

  const [filters, setFilters] = useState<AttendanceReportFilters>({
    page: 1,
    limit: 20,
    admissionId: "",
    cycleId: "",
    areaId: "",
    careerId: "",
    shift: "",
    dateFrom: "",
    dateTo: "",
    studentQuery: "",
    status: "",
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await ReportService.getAttendanceReport(filters);
      setReport(data);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cargar el reporte de asistencias");
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
    loadReport();
  }, [filters.page, filters.limit]);

  const exportUrl = useMemo(
    () => ReportService.getAttendanceExportUrl({ ...filters, page: 1, limit: 100000 }),
    [filters],
  );

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadReport();
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      admissionId: "",
      cycleId: "",
      areaId: "",
      careerId: "",
      shift: "",
      dateFrom: "",
      dateTo: "",
      studentQuery: "",
      status: "",
    });
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reporte de Asistencias</h1>
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
            onChange={(e) => setFilters((p) => ({ ...p, admissionId: e.target.value }))}
          >
            <option value="">Todas</option>
            {admissions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ciclo</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.cycleId}
            onChange={(e) => setFilters((p) => ({ ...p, cycleId: e.target.value }))}
          >
            <option value="">Todos</option>
            {cycles.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Área</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.areaId}
            onChange={(e) => setFilters((p) => ({ ...p, areaId: e.target.value }))}
          >
            <option value="">Todas</option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Carrera</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.careerId}
            onChange={(e) => setFilters((p) => ({ ...p, careerId: e.target.value }))}
          >
            <option value="">Todas</option>
            {careers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Turno</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.shift}
            onChange={(e) => setFilters((p) => ({ ...p, shift: e.target.value }))}
          >
            {SHIFTS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Fecha desde</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Fecha hasta</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Alumno / DNI</label>
          <Input
            value={filters.studentQuery}
            onChange={(e) => setFilters((p) => ({ ...p, studentQuery: e.target.value }))}
            placeholder="Buscar alumno"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Estado</label>
          <Input
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            placeholder="Ej. TARDANZA"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button onClick={applyFilters} className="bg-blue-600">Aplicar filtros</Button>
        <Button variant="outline" onClick={clearFilters}>Limpiar</Button>
      </div>



      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Código</th>
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">Admisión</th>
              <th className="p-3 text-left">Ciclo</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Turno</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Hora entrada</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {report?.data.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">{row.codeStudent}</td>
                <td className="p-3">{row.studentFullName}</td>
                <td className="p-3">{row.admissionName}</td>
                <td className="p-3">{row.cycleName}</td>
                <td className="p-3">{row.careerName}</td>
                <td className="p-3">{row.shift}</td>
                <td className="p-3">{new Date(row.date).toLocaleDateString()}</td>
                <td className="p-3">
                  {row.entryTime ? new Date(row.entryTime).toLocaleTimeString() : "-"}
                </td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{row.notes || "-"}</td>
              </tr>
            ))}

            {!loading && (!report || report.data.length === 0) && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No hay resultados
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