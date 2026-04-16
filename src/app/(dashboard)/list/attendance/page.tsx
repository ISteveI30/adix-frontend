"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { AttendanceService } from "@/api/models/attendance/attendance.api";
import { MasterService } from "@/api/models/masters/masters";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { AttendanceRow } from "@/api/interfaces/attendance.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AttendancePage() {
  const [barcodeValue, setBarcodeValue] = useState("");
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [admissions, setAdmissions] = useState<Array<{ id: string; name: string }>>([]);
  const [cycles, setCycles] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);
  const [lastScan, setLastScan] = useState<{
    fullName: string;
    status: string;
    cycleName: string;
    careerName: string;
    shift?: string;
  } | null>(null);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    admissionId: "",
    cycleId: "",
    areaId: "",
    careerId: "",
  });

  const scannerRef = useRef<HTMLInputElement>(null);

  const loadRows = async () => {
    try {
      const data = await AttendanceService.listBySection({
        date: filters.date,
        admissionId: filters.admissionId || undefined,
        cycleId: filters.cycleId || undefined,
        careerId: filters.careerId || undefined,
      });
      setRows(data);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cargar la lista de asistencias");
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
        toast.error("No se pudieron cargar filtros");
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
    loadRows();
  }, [filters.date, filters.admissionId, filters.cycleId, filters.careerId]);

  useEffect(() => {
    scannerRef.current?.focus();
  }, []);

  const handleScan = async () => {
    if (!barcodeValue.trim()) return;

    try {
      const response = await AttendanceService.scan(barcodeValue.trim());

      setLastScan({
        fullName: response.student.fullName,
        status: response.attendance.status,
        cycleName: response.student.cycleName,
        careerName: response.student.careerName,
        shift: response.student.shift,
      });

      toast.success(`${response.student.fullName}: ${response.attendance.status}`);
      setBarcodeValue("");
      await loadRows();
      scannerRef.current?.focus();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo registrar la asistencia");
      setBarcodeValue("");
      scannerRef.current?.focus();
    }
  };

  const saveStatus = async (row: AttendanceRow, nextStatus: string, notes?: string) => {
    try {
      if (!nextStatus) {
        toast.error("Selecciona un estado válido");
        return;
      }

      if (row.attendanceId) {
        await AttendanceService.updateStatus(row.attendanceId, {
          status: nextStatus,
          notes,
        });
      } else {
        await AttendanceService.upsertStatus({
          studentId: row.studentId,
          date: filters.date,
          status: nextStatus,
          notes,
        });
      }

      await loadRows();
      toast.success("Estado actualizado");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo actualizar el estado");
    }
  };

  const handleJustify = async (row: AttendanceRow) => {
    const justifyStatus =
      row.status === "TARDANZA" ? "TARDANZA_JUSTIFICADA" : "FALTA_JUSTIFICADA";

    const result = await Swal.fire({
      title: "Justificar registro",
      input: "text",
      inputLabel: "Motivo / observación",
      inputPlaceholder: "Ingrese el motivo",
      showCancelButton: true,
      confirmButtonText: "Justificar",
    });

    if (!result.isConfirmed) return;

    await saveStatus(row, justifyStatus, result.value || undefined);
  };

  const summary = useMemo(() => {
    const asistio = rows.filter((r) => r.status === "ASISTIO").length;
    const tardanza = rows.filter(
      (r) => r.status === "TARDANZA" || r.status === "TARDANZA_JUSTIFICADA",
    ).length;
    const falta = rows.filter(
      (r) => r.status === "FALTA" || r.status === "FALTA_JUSTIFICADA",
    ).length;

    return { asistio, tardanza, falta, total: rows.length };
  }, [rows]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="hidden md:block text-lg font-semibold">Registro de Asistencias</h1>
        <Link href="/list/students/barcodes">
          <Button className="bg-slate-700">Ver e imprimir carnets</Button>
        </Link>
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2">
          <label className="text-sm font-medium">Escanear código</label>
          <Input
            ref={scannerRef}
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleScan();
              }
            }}
            placeholder="Escanea aquí el código de barras"
          />
        </div>

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

        <div className="flex items-end">
          <Button className="w-full bg-blue-600" onClick={handleScan}>
            Registrar asistencia
          </Button>
        </div>
      </div>

      {lastScan && (
        <div className="mb-6 rounded-xl border p-4 bg-slate-50">
          <div className="text-sm text-gray-500 mb-1">Último escaneo</div>
          <div className="text-lg font-bold">{lastScan.fullName}</div>
          <div className="text-sm">{lastScan.cycleName} - {lastScan.careerName}</div>
          <div className="text-sm">Turno: {lastScan.shift || "-"}</div>
          <div className="mt-2 inline-flex rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
            {lastScan.status}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Admisión</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.admissionId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, admissionId: e.target.value }))
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
              setFilters((prev) => ({ ...prev, cycleId: e.target.value }))
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Asistieron</div>
          <div className="text-2xl font-bold text-green-600">{summary.asistio}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Tardanzas</div>
          <div className="text-2xl font-bold text-yellow-600">{summary.tardanza}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Faltas</div>
          <div className="text-2xl font-bold text-red-600">{summary.falta}</div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">Admisión</th>
              <th className="p-3 text-left">Ciclo</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Turno</th>
              <th className="p-3 text-left">Hora de entrada</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Justificación</th>
              <th className="p-3 text-left">Editar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">{row.fullName}</td>
                <td className="p-3">{row.admissionName || "-"}</td>
                <td className="p-3">{row.cycleName}</td>
                <td className="p-3">{row.careerName}</td>
                <td className="p-3">{row.shift || "-"}</td>
                <td className="p-3">
                  {row.entryTime ? new Date(row.entryTime).toLocaleTimeString() : "-"}
                </td>
                <td className="p-3">{row.status || "SIN REGISTRO"}</td>
                <td className="p-3">{row.notes || "-"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={row.status || ""}
                      onChange={(e) => saveStatus(row, e.target.value)}
                    >
                      <option value="">SIN REGISTRO</option>
                      <option value="ASISTIO">ASISTIO</option>
                      <option value="TARDANZA">TARDANZA</option>
                      <option value="FALTA">FALTA</option>
                      <option value="TARDANZA_JUSTIFICADA">TARDANZA JUSTIFICADA</option>
                      <option value="FALTA_JUSTIFICADA">FALTA JUSTIFICADA</option>
                    </select>

                    {row.canJustify && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleJustify(row)}
                      >
                        Justificar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No hay alumnos para este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}