"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

import { ExamService } from "@/api/models/exam/exam.api";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { InterestedService } from "@/api/models/interested/interested.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";

type Exam = {
    id: string;
    title: string;
    modality: string;
    type: string;
    cycleId: string;
};

type Row = {
    key: string; // studentId o "ext-{id}"
    firstName: string;
    lastName: string;
    type: "Matriculado" | "Externo";
    careerId?: string;
    careerName?: string;
    areaId?: string;
};

type RosterRow = {
    personKey: string;        // mismo formato que Row.key
    detailId?: string;        // ExamDetail.id si ya está asignado
    firstName: string;
    lastName: string;
    type: "Matriculado" | "Externo";
    score: number | null | undefined;
};

export default function EditExamPage() {
    const params = useParams();
    const examId = String(params.id);
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [title, setTitle] = useState("");

    // listado de elegibles (matriculados + interesados) para mostrar/filtrar
    const [rows, setRows] = useState<Row[]>([]);
    // seleccionados (marcados)
    const [selected, setSelected] = useState<string[]>([]);
    // mapa de notas por persona (solo para los que ya tenían ExamDetail)
    const [scores, setScores] = useState<
        Record<string, { detailId?: string; score: number | null }>
    >({});

    // filtros
    const [areaId, setAreaId] = useState("");
    const [careerId, setCareerId] = useState("");
    const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
    const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);

    const headerChkRef = useRef<HTMLInputElement>(null);

    // Cargar examen + roster + elegibles
    useEffect(() => {
        (async () => {
            const e = await ExamService.getById(examId);
            setExam(e);
            setTitle(e.title);

            setAreas((await getAreas()) ?? []);

            // 1) roster actual (quién está asignado y sus notas)
            const roster: RosterRow[] = await ExamService.getRoster(examId);
            const preSelected = roster.map((r) => r.personKey);
            setSelected(preSelected);

            const map: Record<string, { detailId?: string; score: number | null }> = {};
            roster.forEach((r) => {
                map[r.personKey] = { detailId: r.detailId, score: r.score ?? null };
            });
            setScores(map);

            // 2) armar listado elegible (igual que al crear)
            const enrollments = await EnrollmentService.listActives({
                cycleId: e.cycleId,
                modality: e.modality,
                careerId: undefined,
            });

            const stds: Row[] = (Array.isArray(enrollments) ? enrollments : []).map(
                (en: any) => ({
                    key: en?.student?.id,
                    firstName: en?.student?.firstName,
                    lastName: en?.student?.lastName,
                    type: "Matriculado",
                    careerId: en?.career?.id,
                    careerName: en?.career?.name,
                    areaId: en?.career?.areaId,
                })
            );

            let exts: Row[] = [];
            if (e.type === "SIMULACRO") {
                const page = await InterestedService.getByPage(1, 500);
                exts = page.data
                    .filter((i) => (i.cycle?.id ?? i.cycleId) === e.cycleId)
                    .map((i) => ({
                        key: `ext-${i.id}`,
                        firstName: i.firstName,
                        lastName: i.lastName,
                        type: "Externo",
                        careerId: i.career?.id ?? i.careerId,
                        careerName: i.career?.name,
                        areaId: i.career?.areaId ?? i.career?.area?.id,
                    }));
            }

            setRows([...stds, ...exts]);
        })();
    }, [examId]);

    // Cargar carreras cuando cambia el filtro área
    useEffect(() => {
        (async () => {
            if (!areaId) {
                setCareers([]);
                setCareerId("");
                return;
            }
            setCareers((await getCareersByArea(areaId)) ?? []);
            setCareerId("");
        })();
    }, [areaId]);

    // Filtrado + helpers de selección
    const filteredRows = useMemo(
        () =>
            rows.filter(
                (r) => (!areaId || r.areaId === areaId) && (!careerId || r.careerId === careerId)
            ),
        [rows, areaId, careerId]
    );
    const visibleIds = useMemo(() => filteredRows.map((r) => r.key), [filteredRows]);

    const allVisibleSelected = useMemo(
        () => visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id)),
        [visibleIds, selected]
    );
    const someVisibleSelected = useMemo(
        () => visibleIds.some((id) => selected.includes(id)) && !allVisibleSelected,
        [visibleIds, selected, allVisibleSelected]
    );
    useEffect(() => {
        if (headerChkRef.current) headerChkRef.current.indeterminate = someVisibleSelected;
    }, [someVisibleSelected]);

    const toggle = (id: string) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleAllVisible = () => {
        setSelected((prev) =>
            allVisibleSelected
                ? prev.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...prev, ...visibleIds]))
        );
    };

    // Guardar cambios (título, participantes, notas)
    const handleSave = async () => {
        try {
            if (!exam) return;
            const rowsPayload = Object.entries(scores)
                .filter(([personKey, v]) => selected.includes(personKey) && !!v?.detailId)
                .map(([_, v]) => ({
                    detailId: v!.detailId as string,
                    score: v!.score ?? null,
                }));

            if (rowsPayload.length) {
                await ExamService.updateScores(examId, rowsPayload); // 👈 envía rows, no items
            }
            // 1) título
            if (title.trim() && title.trim() !== exam.title) {
                await ExamService.updateTitle(examId, title.trim());
            }

            // 2) participantes
            const studentIds = selected.filter((k) => !k.startsWith("ext-"));
            const interestedIds = selected
                .filter((k) => k.startsWith("ext-"))
                .map((k) => k.replace("ext-", ""));
            await ExamService.syncParticipants(examId, { studentIds, interestedIds });

            // 3) notas: sólo para los que ya tenían ExamDetail (tenemos detailId)
            const items = Object.entries(scores)
                .filter(([personKey, v]) => selected.includes(personKey) && !!v?.detailId)
                .map(([_, v]) => ({ detailId: v.detailId as string, score: v.score }));

            if (items.length) {
                await ExamService.updateScores(examId, items);
            }

            await Swal.fire({
                icon: "success",
                title: "Cambios guardados",
                confirmButtonText: "OK",
            });
            router.replace("/list/exam");
        } catch (err: any) {
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.message ?? "No se pudo guardar",
            });
        }
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
                    <input
                        className="border rounded px-2 py-1 w-full"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Área</label>
                    <select
                        className="border rounded px-2 py-1 w-full"
                        value={areaId}
                        onChange={(e) => setAreaId(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Carrera</label>
                    <select
                        className="border rounded px-2 py-1 w-full"
                        value={careerId}
                        onChange={(e) => setCareerId(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {careers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
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
                                title="Seleccionar / deseleccionar visibles"
                            />
                        </th>
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Carrera</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Nota</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRows.map((r) => (
                        <tr key={r.key} className="border-t">
                            <td className="p-2">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(r.key)}
                                    onChange={() => toggle(r.key)}
                                />
                            </td>
                            <td className="p-2">
                                {r.firstName} {r.lastName}
                            </td>
                            <td className="p-2">{r.careerName ?? "-"}</td>
                            <td className="p-2">{r.type}</td>
                            <td className="p-2">
                                {/* Nota editable SOLO si ya estaba asignado (tenemos detailId) */}
                                {scores[r.key]?.detailId ? (
                                    <input
                                        type="number"
                                        min={0}
                                        max={20}
                                        className="w-20 border rounded px-2 py-1 text-center"
                                        value={scores[r.key]?.score ?? ""}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const val =
                                                raw === ""
                                                    ? null
                                                    : Math.max(0, Math.min(20, Number(raw)));
                                            setScores((prev) => ({
                                                ...prev,
                                                [r.key]: { ...(prev[r.key] || {}), score: val },
                                            }));
                                        }}
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredRows.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-4 text-sm text-gray-500">
                                Sin resultados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex gap-3 mt-6">
                <Button variant="destructive" onClick={() => router.back()}>
                    Cancelar
                </Button>
                <Button className="bg-blue-600" onClick={handleSave}>
                    Guardar cambios
                </Button>
            </div>
        </section>
    );
}
