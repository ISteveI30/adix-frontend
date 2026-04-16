"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { InterestedService } from "@/api/models/interested/interested.api";
import { ExamService } from "@/api/models/exam/exam.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { TypeExam } from "@/api/interfaces/exam.interface";
import { useExamDraftStore } from "@/store/examDraftStore";

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerId?: string;
  careerName?: string;
  areaId?: string;
};

export default function AssignExamPage() {
  const router = useRouter();
  const { draft, clearDraft } = useExamDraftStore();

  const [areaId, setAreaId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const headerChkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!draft) {
      router.replace("/list/exam");
    }
  }, [draft, router]);

  useEffect(() => {
    const loadBase = async () => {
      try {
        const areasData = await getAreas();
        setAreas(areasData);
      } catch (error) {
        console.error(error);
      }
    };

    loadBase();
  }, []);

  useEffect(() => {
    const loadCareers = async () => {
      if (!areaId) {
        setCareers([]);
        setCareerId("");
        return;
      }

      const data = await getCareersByArea(areaId);
      setCareers(data);
    };

    loadCareers();
  }, [areaId]);

  useEffect(() => {
    const loadRows = async () => {
      if (!draft) return;

      try {
        if (draft.type === TypeExam.SIMULACRO) {
          const response = await InterestedService.listInterested();
          const interestedData = Array.isArray(response.data) ? response.data : [];

          setRows(
            interestedData.map((item: any) => ({
              id: item.id,
              firstName: item.firstName,
              lastName: item.lastName,
              type: "Externo",
              careerId: item.career?.id,
              careerName: item.career?.name,
              areaId: item.career?.areaId,
            })),
          );
        } else {
          const enrollments = await EnrollmentService.listEnrollments();
          const enrollmentsData = Array.isArray(enrollments.data) ? enrollments.data : [];

          const filtered = enrollmentsData.filter(
            (item: any) =>
              item.deletedAt == null &&
              item.cycleId === draft.cycleId &&
              item.studentId,
          );

          const uniqueMap = new Map<string, Row>();

          for (const item of filtered) {
            if (!uniqueMap.has(item.studentId)) {
              uniqueMap.set(item.studentId, {
                id: item.studentId,
                firstName: item.student?.firstName || "",
                lastName: item.student?.lastName || "",
                type: "Matriculado",
                careerId: item.career?.id,
                careerName: item.career?.name,
                areaId: item.career?.areaId,
              });
            }
          }

          setRows(Array.from(uniqueMap.values()));
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudieron cargar los alumnos para asignación", "error");
      }
    };

    loadRows();
  }, [draft]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!areaId || r.areaId === areaId) &&
          (!careerId || r.careerId === careerId),
      ),
    [rows, areaId, careerId],
  );

  const visibleIds = useMemo(() => filteredRows.map((r) => r.id), [filteredRows]);

  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id)),
    [visibleIds, selected],
  );

  const someVisibleSelected = useMemo(
    () => visibleIds.some((id) => selected.includes(id)) && !allVisibleSelected,
    [visibleIds, selected, allVisibleSelected],
  );

  useEffect(() => {
    if (headerChkRef.current) {
      headerChkRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleCreateExam = async () => {
    if (!draft) return;

    if (selected.length === 0) {
      Swal.fire("Atención", "Debes seleccionar al menos un participante", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Crear examen?",
      text: "Se creará el examen y se asignarán los participantes seleccionados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);

      const dto =
        draft.type === TypeExam.SIMULACRO
          ? {
              title: draft.title,
              modality: draft.modality,
              type: draft.type,
              cycleId: draft.cycleId,
              interestedIds: selected,
            }
          : {
              title: draft.title,
              modality: draft.modality,
              type: draft.type,
              cycleId: draft.cycleId,
              studentIds: selected,
            };

      await ExamService.createWithDetails(dto);
      clearDraft();

      await Swal.fire("Correcto", "Examen creado correctamente", "success");
      router.replace("/list/exam");
      router.refresh();
    } catch (error: any) {
      Swal.fire("Error", error?.message || "No se pudo crear el examen", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!draft) return null;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-2xl font-bold mb-2">Asignar alumnos al examen</h1>

      <p className="mb-6 text-sm text-gray-600">
        <b>Título:</b> {draft.title} &nbsp;|&nbsp;
        <b>Tipo:</b> {draft.type} &nbsp;|&nbsp;
        <b>Modalidad:</b> {draft.modality} &nbsp;|&nbsp;
        <b>Ciclo:</b> {draft.cycleName || draft.cycleId}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Modalidad</label>
          <input
            className="w-full h-10 rounded-md border px-3 bg-muted"
            value={draft.modality}
            disabled
          />
        </div>

        <div>
          <label className="text-sm font-medium">Área</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
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
            value={careerId}
            onChange={(e) => setCareerId(e.target.value)}
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

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left w-12">
                <input
                  ref={headerChkRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                />
              </th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </td>
                <td className="p-3">
                  {row.firstName} {row.lastName}
                </td>
                <td className="p-3">{row.careerName || "-"}</td>
                <td className="p-3">{row.type}</td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay participantes disponibles con este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="destructive" onClick={() => router.replace("/list/exam")}>
          Cancelar
        </Button>
        <Button className="bg-blue-600" onClick={handleCreateExam} disabled={saving}>
          {saving ? "Creando..." : "Crear examen y asignar"}
        </Button>
      </div>
    </div>
  );
}