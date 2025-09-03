"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { ExamService, ScoreRowPayload } from "@/api/models/exam/exam.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";

type Exam = { id: string; title: string; modality: string; type: string; cycleId: string; };
type RosterRow = {
  detailId: string;
  personKey: string;
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerName?: string;
  goodAnswers?: number | null;
  wrongAnswers?: number | null;
  totalScore?: number | null;
};

export default function EditScoresPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [rows, setRows] = useState<RosterRow[]>([]);

  // filtros
  const [areaId, setAreaId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    (async () => {
      const e = await ExamService.getById(id);
      setExam(e);
      setAreas((await getAreas()) ?? []);
      const roster = await ExamService.getRoster(id);
      setRows(roster);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!areaId) { setCareers([]); setCareerId(""); return; }
      setCareers((await getCareersByArea(areaId)) ?? []);
      setCareerId("");
    })();
  }, [areaId]);

  const filtered = useMemo(
    () => rows.filter(r =>
      (!careerId || r.careerName === careers.find(c => c.id === careerId)?.name) // simple match por nombre
    ),
    [rows, careerId, careers]
  );

  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

  const handleSave = async () => {
    const payload: ScoreRowPayload[] = filtered.map(r => ({
      detailId: r.detailId,
      goodAnswers : r.goodAnswers  ?? null,
      wrongAnswers: r.wrongAnswers ?? null,
      totalScore  : r.totalScore   ?? null,
    }));
    await ExamService.updateScores(id, payload);
    await Swal.fire({ icon: "success", title: "Notas guardadas" });
    router.replace("/list/exam");
  };

  if (!exam) return null;

  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold mb-1">Asignar notas</h2>
      <p className="text-sm text-gray-600 mb-4">
        <b>Tipo:</b> {exam.type} &nbsp;|&nbsp; <b>Modalidad:</b> {exam.modality}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Área</label>
          <select className="border rounded px-2 py-1 w-full" value={areaId} onChange={e => setAreaId(e.target.value)}>
            <option value="">Todas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Carrera</label>
          <select className="border rounded px-2 py-1 w-full" value={careerId} onChange={e => setCareerId(e.target.value)}>
            <option value="">Todas</option>
            {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Carrera</th>
            <th className="text-left p-2">Tipo</th>
            <th className="text-left p-2">Buenas</th>
            <th className="text-left p-2">Malas</th>
            <th className="text-left p-2">Puntaje</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.detailId} className="border-t">
              <td className="p-2">{r.firstName} {r.lastName}</td>
              <td className="p-2">{r.careerName ?? "-"}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">
                <input type="number" min={0} max={100} className="w-24 border rounded px-2 py-1 text-center"
                  value={r.goodAnswers ?? ""} onChange={e => {
                    const v = e.target.value === "" ? null : clamp(Number(e.target.value), 100);
                    setRows(prev => prev.map(x => x.detailId === r.detailId ? { ...x, goodAnswers: v } : x));
                  }} />
              </td>
              <td className="p-2">
                <input type="number" min={0} max={100} className="w-24 border rounded px-2 py-1 text-center"
                  value={r.wrongAnswers ?? ""} onChange={e => {
                    const v = e.target.value === "" ? null : clamp(Number(e.target.value), 100);
                    setRows(prev => prev.map(x => x.detailId === r.detailId ? { ...x, wrongAnswers: v } : x));
                  }} />
              </td>
              <td className="p-2">
                <input type="number" min={0} max={400} className="w-24 border rounded px-2 py-1 text-center"
                  value={r.totalScore ?? ""} onChange={e => {
                    const v = e.target.value === "" ? null : clamp(Number(e.target.value), 400);
                    setRows(prev => prev.map(x => x.detailId === r.detailId ? { ...x, totalScore: v } : x));
                  }} />
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-sm text-gray-500">No hay asignados en este filtro</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-3 mt-6">
        <Button variant="destructive" onClick={() => router.replace("/list/exam")}>Cancelar</Button>
        <Button className="bg-blue-600" onClick={handleSave}>Guardar notas</Button>
      </div>
    </section>
  );
}
