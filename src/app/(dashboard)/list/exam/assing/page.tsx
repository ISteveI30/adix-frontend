"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { InterestedService } from "@/api/models/interested/interested.api";
import { ExamService } from "@/api/models/exam/exam.api";
import { Button } from "@/components/ui/button";
import { TypeExam } from "@/api/interfaces/exam.interface";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { CycleService } from "@/api/models/cycle/cycle.api";
import Swal from "sweetalert2";

const DRAFT_KEY = "exam_draft";

type Draft = { title: string; modality: string; type: TypeExam | string; cycleId: string; cycleName?: string; };
type Row = { id: string; firstName: string; lastName: string; type: "Matriculado" | "Externo"; careerId?: string; careerName?: string; areaId?: string; };

export default function AssignExamPage() {
    const router = useRouter();
    const [draft, setDraft] = useState<Draft | null>(null);

    const [cycleName, setCycleName] = useState<string>("");
    // filtros UI
    const [areaId, setAreaId] = useState("");
    const [careerId, setCareerId] = useState("");

    const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
    const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

    const [rows, setRows] = useState<Row[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const headerChkRef = useRef<HTMLInputElement>(null);


    const filteredRows = useMemo(
        () =>
            rows.filter(r =>
                (!areaId || r.areaId === areaId) &&
                (!careerId || r.careerId === careerId)
            ),
        [rows, areaId, careerId]
    );

    const visibleIds = useMemo(() => filteredRows.map(r => r.id), [filteredRows]);

    const allVisibleSelected = useMemo(
        () => visibleIds.length > 0 && visibleIds.every(id => selected.includes(id)),
        [visibleIds, selected]
    );

    // ¿selección parcial?
    const someVisibleSelected = useMemo(
        () => visibleIds.some(id => selected.includes(id)) && !allVisibleSelected,
        [visibleIds, selected, allVisibleSelected]
    );

    // pintar estado indeterminate en el checkbox maestro
    useEffect(() => {
        if (headerChkRef.current) {
            headerChkRef.current.indeterminate = someVisibleSelected;
        }
    }, [someVisibleSelected]);

    // alternar selección de todos los visibles
    const toggleAllVisible = () => {
        setSelected(prev => {
            if (allVisibleSelected) {
                // deselecciona solo los visibles
                return prev.filter(id => !visibleIds.includes(id));
            }
            // agrega los visibles a lo ya seleccionado (sin duplicar)
            const s = new Set(prev);
            visibleIds.forEach(id => s.add(id));
            return Array.from(s);
        });
    };
    // cargar draft
    useEffect(() => {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) { router.replace("/list/exam"); return; }
        const d: Draft = JSON.parse(raw);
        setDraft(d);
    }, [router]);

    // combos
    useEffect(() => { (async () => { setAreas(await getAreas() ?? []); })(); }, []);
    useEffect(() => {
        (async () => {
            if (!areaId) { setCareers([]); setCareerId(""); return; }
            setCareers(await getCareersByArea(areaId) ?? []); setCareerId("");
        })();
    }, [areaId]);

    // Traer nombre del ciclo
    useEffect(() => {
        (async () => {
            if (!draft?.cycleId) return;

            // si el draft ya trae cycleName del formulario, úsalo
            if (draft.cycleName) { setCycleName(draft.cycleName); return; }

            try {
                const c = await CycleService.getById(draft.cycleId);
                setCycleName(c?.name ?? "");
            } catch {
                setCycleName("");
            }
        })();
    }, [draft?.cycleId, draft?.cycleName]);



    // cargar datos
    useEffect(() => {
        (async () => {
            if (!draft) return;

            // 1) Matriculados
            const enrollments = await EnrollmentService.listActives({
                cycleId: draft.cycleId,
                modality: draft.modality,
                careerId: careerId || undefined,
            });

            const students: Row[] = (Array.isArray(enrollments) ? enrollments : []).map((e: any) => ({
                id: e?.student?.id,
                firstName: e?.student?.firstName || "",
                lastName: e?.student?.lastName || "",
                type: "Matriculado",
                careerId: e?.career?.id,
                careerName: e?.career?.name,
                areaId: e?.career?.areaId,
            }));

            // 2) Externos en SIMULACRO
            let externals: Row[] = [];
            if (draft.type === "SIMULACRO") {
                const page = await InterestedService.getByPage(1, 500);
                externals = page.data
                    .filter(i => (i.cycle?.id ?? i.cycleId) === draft.cycleId)
                    .filter(i => !careerId || (i.career?.id ?? i.careerId) === careerId)
                    .map(i => ({
                        id: `ext-${i.id}`,
                        firstName: i.firstName,
                        lastName: i.lastName,
                        type: "Externo",
                        careerId: i.career?.id ?? i.careerId,
                        careerName: i.career?.name ?? "-",
                        areaId: i.career?.areaId ?? i.career?.area?.id,
                    }));
            }

            setRows([...students, ...externals]);
        })();
    }, [draft, careerId]);

    const handleCreateAndAssign = async () => {
        if (!draft) return;

        try {
            const studentIds = selected.filter(id => !id.startsWith("ext-"));
            const interestedIds = selected
                .filter(id => id.startsWith("ext-"))
                .map(id => id.replace("ext-", ""));

            await ExamService.createWithDetails({
                title: draft.title.trim(),
                modality: draft.modality as any,
                type: String(draft.type),
                cycleId: draft.cycleId,
                studentIds,
                interestedIds,
            });

            sessionStorage.removeItem(DRAFT_KEY);

            await Swal.fire({
                icon: "success",
                title: "¡Examen creado!",
                text: "Los alumnos fueron asignados correctamente.",
                confirmButtonText: "Ir a Exámenes"
            });

            // Redirige a la página principal de exámenes
            router.replace("/list/exam");
        } catch (err: any) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo crear el examen",
                text: err?.message ?? "Inténtalo nuevamente."
            });
        }
    };

    const handleCancel = () => {
        sessionStorage.removeItem(DRAFT_KEY);
        router.back();
    };

    if (!draft) return null;

    return (
        <section className="p-10">
            <h2 className="text-2xl font-bold mb-1">Asignar alumnos al examen</h2>
            <p className="text-sm text-gray-600 mb-6">
                <b>Título:</b> {draft.title} &nbsp;|&nbsp; <b>Tipo:</b> {draft.type} &nbsp;|&nbsp; <b>Modalidad:</b> {draft.modality} &nbsp;|&nbsp; <b>Ciclo:</b>  {cycleName || "—"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium">Modalidad</label>
                    <input className="border rounded px-2 py-1 w-full bg-gray-100" value={draft.modality} disabled />
                </div>
                <div>
                    <label className="block text-sm font-medium">Área</label>
                    <select className="border rounded px-2 py-1 w-full" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                        <option value="">Todas</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Carrera</label>
                    <select className="border rounded px-2 py-1 w-full" value={careerId} onChange={(e) => setCareerId(e.target.value)}>
                        <option value="">Todas</option>
                        {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="text-left p-2">
                            <input
                                type="checkbox"
                                ref={headerChkRef}
                                checked={allVisibleSelected}
                                onChange={toggleAllVisible}
                                title="Seleccionar / deseleccionar todos los visibles"
                            />
                        </th>
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Carrera</th>
                        <th className="text-left p-2">Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} /></td>
                            <td className="p-2">{r.firstName} {r.lastName}</td>
                            <td className="p-2">{r.careerName ?? "-"}</td>
                            <td className="p-2">{r.type}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan={4} className="p-4 text-sm text-gray-500">Sin resultados</td></tr>}
                </tbody>
            </table>

            <div className="flex gap-3 mt-6">
                <Button variant="destructive" onClick={handleCancel}>Cancelar</Button> {/* rojo */}
                <Button className="bg-blue-600" onClick={handleCreateAndAssign}>Crear examen y asignar</Button>
            </div>
        </section>
    );
}
