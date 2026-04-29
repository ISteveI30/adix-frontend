"use client";

import { Fragment, useEffect, useState } from "react";
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

function sortAdmissionsDesc(items: Array<{ id: string; name: string }>) {
  return [...items].sort((a, b) =>
    b.name.localeCompare(a.name, "es", { numeric: true }),
  );
}

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
    dateFrom: "",
    dateTo: "",
    studentQuery: "",
  });

  const loadReport = async (currentFilters?: AttendanceReportFilters) => {
    try {
      setLoading(true);
      const data = await ReportService.getAttendanceReport(currentFilters || filters);
      setReport(data);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cargar el reporte de asistencias");
      setReport({
        summary: { totalRows: 0 },
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
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

        setAdmissions(sortAdmissionsDesc(admissionsData));
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
        const data = await getCareersByArea(filters.areaId);
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

  const applyFilters = async () => {
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    setExpandedId(null);
    await loadReport(nextFilters);
  };

  const clearFilters = async () => {
    const cleanFilters: AttendanceReportFilters = {
      page: 1,
      limit: 20,
      admissionId: "",
      cycleId: "",
      areaId: "",
      careerId: "",
      dateFrom: "",
      dateTo: "",
      studentQuery: "",
    };

    setFilters(cleanFilters);
    setExpandedId(null);
    await loadReport(cleanFilters);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reporte de Asistencias</h1>

        <Link href="/list/reports">
          <Button variant="outline">Retroceder</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        <div>
          <label className="text-sm font-medium">Alumno / DNI</label>
          <Input
            value={filters.studentQuery}
            onChange={(e) =>
              setFilters((p) => ({ ...p, studentQuery: e.target.value }))
            }
            placeholder="Buscar alumno"
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
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">DNI</th>
              <th className="p-3 text-left">Admisión</th>
              <th className="p-3 text-left">Ciclo</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Turno</th>
              <th className="p-3 text-left">Asistencias</th>
              <th className="p-3 text-left">Tardanzas</th>
              <th className="p-3 text-left">Faltas</th>
              <th className="p-3 text-left">Detalle</th>
            </tr>
          </thead>

          <tbody>
            {report?.data.map((row) => (
              <Fragment key={row.groupId}>
                <tr className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{row.studentFullName}</div>
                    <div className="text-xs text-gray-500">{row.codeStudent}</div>
                  </td>
                  <td className="p-3">{row.dni}</td>
                  <td className="p-3">{row.admissionName}</td>
                  <td className="p-3">{row.cycleName}</td>
                  <td className="p-3">{row.careerName}</td>
                  <td className="p-3">{row.shift}</td>
                  <td className="p-3">{row.attendanceCount}</td>
                  <td className="p-3">{row.tardinessCount}</td>
                  <td className="p-3">{row.absenceCount}</td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      onClick={() => toggleExpanded(row.groupId)}
                    >
                      {expandedId === row.groupId ? "Ocultar" : "Ver asistencias"}
                    </Button>
                  </td>
                </tr>

                {expandedId === row.groupId && (
                  <tr>
                    <td colSpan={10} className="bg-slate-50 p-4">
                      <div className="font-semibold mb-3">
                        Asistencias del alumno en el periodo
                      </div>

                      <div className="overflow-x-auto border rounded-lg bg-white">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b bg-white">
                              <th className="p-3 text-left">Fecha</th>
                              <th className="p-3 text-left">Hora entrada</th>
                              <th className="p-3 text-left">Estado</th>
                              <th className="p-3 text-left">Observación</th>
                            </tr>
                          </thead>

                          <tbody>
                            {row.records.map((record) => (
                              <tr key={record.id} className="border-b">
                                <td className="p-3">
                                  {record.date
                                    ? new Date(record.date).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="p-3">
                                  {record.entryTime
                                    ? new Date(record.entryTime).toLocaleTimeString()
                                    : "-"}
                                </td>
                                <td className="p-3">{record.status}</td>
                                <td className="p-3">{record.notes || "-"}</td>
                              </tr>
                            ))}

                            {row.records.length === 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="p-4 text-center text-gray-500"
                                >
                                  No hay asistencias registradas
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {loading && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  Cargando reporte...
                </td>
              </tr>
            )}

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