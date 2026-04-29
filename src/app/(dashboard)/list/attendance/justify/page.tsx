"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { AttendanceService } from "@/api/models/attendance/attendance.api";
import { MasterService } from "@/api/models/masters/masters";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function sortAdmissionsDesc(items: Array<{ id: string; name: string }>) {
  return [...items].sort((a, b) =>
    b.name.localeCompare(a.name, "es", { numeric: true }),
  );
}

function getErrorMessage(error: unknown, fallback: string) {
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

export default function JustifyTardinessPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [admissions, setAdmissions] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    admissionId: "",
    areaId: "",
    careerId: "",
  });

  const loadRows = async () => {
    try {
      setLoading(true);

      const data = await AttendanceService.listTardies({
        date: filters.date,
        admissionId: filters.admissionId || undefined,
        areaId: filters.areaId || undefined,
        careerId: filters.careerId || undefined,
      });

      setRows(data);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudieron cargar las tardanzas"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const [admissionsData, areasData] = await Promise.all([
        MasterService.getAdmissions(),
        getAreas(),
      ]);

      setAdmissions(sortAdmissionsDesc(admissionsData));
      setAreas(areasData);
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

      const data = await getCareersByArea(filters.areaId);
      setCareers(data);
    };

    loadCareers();
  }, [filters.areaId]);

  useEffect(() => {
    loadRows();
  }, [filters.date, filters.admissionId, filters.areaId, filters.careerId]);

  const justify = async (id: string) => {
    const result = await Swal.fire({
      title: "Justificar tardanza",
      input: "text",
      inputLabel: "Motivo / observación",
      inputPlaceholder: "Ingrese el motivo",
      showCancelButton: true,
      confirmButtonText: "Justificar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563EB",
    });

    if (!result.isConfirmed) return;

    try {
      await AttendanceService.justifyTardiness(
        id,
        result.value || "Tardanza justificada",
      );

      await Swal.fire({
        icon: "success",
        title: "Tardanza justificada",
        confirmButtonColor: "#2563EB",
      });

      await loadRows();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudo justificar la tardanza"),
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      date: new Date().toISOString().slice(0, 10),
      admissionId: "",
      areaId: "",
      careerId: "",
    });
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Justificar tardanzas</h1>

        <Link href="/list/attendance">
          <Button variant="outline">Retroceder</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Fecha</label>
          <Input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Admisión</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.admissionId}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                admissionId: e.target.value,
              }))
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
          <label className="text-sm font-medium">Área</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.areaId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, areaId: e.target.value }))
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
              setFilters((prev) => ({ ...prev, careerId: e.target.value }))
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
      </div>

      <div className="flex gap-2 mb-6">
        <Button onClick={loadRows} className="bg-blue-600">
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
              <th className="p-3 text-left">Hora entrada</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const enrollment = row.student?.enrollments?.[0];

              return (
                <tr key={row.id} className="border-b">
                  <td className="p-3">
                    {row.student?.firstName} {row.student?.lastName}
                  </td>
                  <td className="p-3">{row.student?.dni || "-"}</td>
                  <td className="p-3">{enrollment?.admission?.name || "-"}</td>
                  <td className="p-3">{enrollment?.cycle?.name || "-"}</td>
                  <td className="p-3">{enrollment?.career?.name || "-"}</td>
                  <td className="p-3">
                    {row.entryTime
                      ? new Date(row.entryTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">
                    <Button
                      onClick={() => justify(row.id)}
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Justificar
                    </Button>
                  </td>
                </tr>
              );
            })}

            {loading && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Cargando tardanzas...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No hay tardanzas pendientes de justificar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}