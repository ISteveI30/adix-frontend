"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { ExamService } from "@/api/models/exam/exam.api";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { InterestedService } from "@/api/models/interested/interested.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";

type Exam = { id: string; title: string; modality: string; type: string; cycleId: string; };
type Row = {
  key: string; // studentId o "ext-{id}"
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerId?: string;
  careerName?: string;
  areaId?: string;
  assigned: boolean; // Estado
};

export default function ManageExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");

  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // filtros
  const [areaId, setAreaId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

  const headerChkRef = useRef<HTMLInputElement>(null);

  // Cargar examen + roster + elegibles
  useEffect(() => {
    (async () => {
      const e = await ExamService.getById(id);
      setExam(e);
      setTitle(e.title);

      setAreas((await getAreas()) ?? []);

      // roster actual para saber quién está asignado
      const roster: Array<{ personKey: string }> = await ExamService.getRoster(id);
      const assignedSet = new Set(roster.map(r => r.personKey));

      // elegibles (matriculados del ciclo/mod y, si es simulacro, interesados del ciclo)
      const enrollments = await EnrollmentService.listActives({
        cycleId: e.cycleId,
        modality: e.modality,
      });
      const stds: Row[] = (Array.isArray(enrollments) ? enrollments : []).map((en: any) => ({
        key: en?.student?.id,
        firstName: en?.student?.firstName ?? "",
        lastName : en?.student?.lastName ?? "",
        type: "Matriculado",
        careerId: en?.career?.id,
        careerName: en?.career?.name,
        areaId: en?.career?.areaId,
        assigned: assignedSet.has(en?.student?.id),
      }));

      let exts: Row[] = [];
      if (e.type === "SIMULACRO") {
        const page = await InterestedService.getByPage(1, 500);
        exts = page.data
          .filter((i: any) => (i.cycle?.id ?? i.cycleId) === e.cycleId)
          .map((i: any) => ({
            key: `ext-${i.id}`,
            firstName: i.firstName, lastName: i.lastName,
            type: "Externo",
            careerId: i.career?.id ?? i.careerId,
            careerName: i.career?.name ?? "-",
            areaId: i.career?.areaId ?? i.career?.area?.id,
            assigned: assignedSet.has(`ext-${i.id}`),
          }));
      }

      setRows([...stds, ...exts]);
    })();
  }, [id]);

  // cargar carreras según área
  useEffect(() => {
    (async () => {
      if (!areaId) { setCareers([]); setCareerId(""); return; }
      setCareers((await getCareersByArea(areaId)) ?? []);
      setCareerId("");
    })();
  }, [areaId]);

  const filteredRows = useMemo(
    () => rows.filter(r => (!areaId || r.areaId === areaId) && (!careerId || r.careerId === careerId)),
    [rows, areaId, careerId]
  );
  const visibleIds = useMemo(() => filteredRows.map(r => r.key), [filteredRows]);

  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every(id => selected.includes(id)),
    [visibleIds, selected]
  );
  const someVisibleSelected = useMemo(
    () => visibleIds.some(id => selected.includes(id)) && !allVisibleSelected,
    [visibleIds, selected, allVisibleSelected]
  );
  useEffect(() => { if (headerChkRef.current) headerChkRef.current.indeterminate = someVisibleSelected; }, [someVisibleSelected]);

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllVisible = () => {
    setSelected(prev => allVisibleSelected
      ? prev.filter(id => !visibleIds.includes(id))
      : Array.from(new Set([...prev, ...visibleIds])));
  };

  // Guardar título
  const saveTitle = async () => {
    if (!exam) return;
    if (title.trim() && title.trim() !== exam.title) {
      await ExamService.updateTitle(exam.id, title.trim());
      await Swal.fire({ icon: "success", title: "Nombre actualizado" });
    }
  };

  const doAdd = async () => {
    if (!exam) return;
    const toAddStd = selected.filter(k => !k.startsWith("ext-") && !rows.find(r => r.key === k)?.assigned);
    const toAddExt = selected.filter(k => k.startsWith("ext-") && !rows.find(r => r.key === k)?.assigned).map(k => k.replace("ext-", ""));
    if (toAddStd.length === 0 && toAddExt.length === 0) return;

    await ExamService.addParticipants(exam.id, { studentIds: toAddStd, interestedIds: toAddExt });
    await Swal.fire({ icon: "success", title: "Alumnos agregados" });
    router.replace("/list/exam");
  };

  const doRemove = async () => {
    if (!exam) return;
    const toRemStd = selected.filter(k => !k.startsWith("ext-") && rows.find(r => r.key === k)?.assigned);
    const toRemExt = selected.filter(k => k.startsWith("ext-") && rows.find(r => r.key === k)?.assigned).map(k => k.replace("ext-", ""));
    if (toRemStd.length === 0 && toRemExt.length === 0) return;

    await ExamService.removeParticipants(exam.id, { studentIds: toRemStd, interestedIds: toRemExt });
    await Swal.fire({ icon: "success", title: "Modificado con éxito" });
    router.replace("/list/exam");
  };

  if (!exam) return null;

  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold mb-1">Editar examen</h2>
      <p className="text-sm text-gray-600 mb-4">
        <b>Tipo:</b> {exam.type} &nbsp;|&nbsp; <b>Modalidad:</b> {exam.modality}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium">Nombre del examen</label>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button className="bg-blue-600" onClick={saveTitle}>Guardar nombre</Button>
          </div>
        </div>
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
            <th className="text-left p-2">
              <input type="checkbox" ref={headerChkRef} checked={allVisibleSelected} onChange={toggleAllVisible} />
            </th>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Carrera</th>
            <th className="text-left p-2">Tipo</th>
            <th className="text-left p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(r => (
            <tr key={r.key} className="border-t">
              <td className="p-2"><input type="checkbox" checked={selected.includes(r.key)} onChange={() => toggle(r.key)} /></td>
              <td className="p-2">{r.firstName} {r.lastName}</td>
              <td className="p-2">{r.careerName ?? "-"}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">
                {r.assigned
                  ? <span className="text-green-700 font-medium">Asignado</span>
                  : <span className="text-gray-500">No asignado</span>}
              </td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-sm text-gray-500">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-3 mt-6">
        <Button className="bg-red-600" onClick={() => router.back()}>Cancelar</Button>
        <Button className="bg-yellow-600" onClick={doRemove}>Quitar alumnos</Button>
        <Button className="bg-blue-600" onClick={doAdd}>Agregar alumnos y Guardar</Button>
      </div>
    </section>
  );
}
