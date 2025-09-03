"use client";
import { useEffect, useState } from "react";
import { AttendanceService } from "@/api/models/attendance/attendance.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

export default function JustifyTardinessPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [areaId, setAreaId] = useState<string | undefined>();
  const [careerId, setCareerId] = useState<string | undefined>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getAreas().then(setAreas); }, []);
  useEffect(() => {
    if (!areaId) { setCareers([]); setCareerId(undefined); return; }
    getCareersByArea(areaId).then(setCareers);
  }, [areaId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await AttendanceService.listTardies({ areaId, careerId, onlyLatestAdmission: true });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [areaId, careerId]);

  const justify = async (id: string) => {
    await AttendanceService.justifyTardiness(id);
    Swal.fire({ icon: "success", title: "Tardanza justificada", confirmButtonColor: "#2563EB" });
    load();
  };

  return (
    <div className="bg-white p-4 rounded-md m-4 border">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h1 className="text-lg font-semibold">Justificar tardanzas</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <Select onValueChange={(v) => setAreaId(v)} value={areaId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar por área" /></SelectTrigger>
          <SelectContent>
            {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setCareerId(v)} value={careerId} disabled={!areas.length || !areaId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar por carrera" /></SelectTrigger>
          <SelectContent>
            {careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setAreaId(undefined); setCareerId(undefined); }}>Limpiar</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Tardanzas (hoy)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Alumno</th>
                  <th className="py-2 px-3">Carrera</th>
                  <th className="py-2 px-3">Fecha registro</th>
                  <th className="py-2 px-3">Estatus</th>
                  <th className="py-2 px-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 px-3">{r.student.firstName} {r.student.lastName}</td>
                    <td className="py-2 px-3">{r.student.enrollments?.[0]?.career?.name ?? "—"}</td>
                    <td className="py-2 px-3">{new Date(r.date).toLocaleString("es-PE")}</td>
                    <td className="py-2 px-3">{r.status}</td>
                    <td className="py-2 px-3">
                      <Button onClick={() => justify(r.id)} disabled={loading}>Justificar</Button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td className="py-6 px-3 text-gray-500" colSpan={5}>Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
