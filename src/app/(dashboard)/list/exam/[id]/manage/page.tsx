"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { ExamService } from "@/api/models/exam/exam.api";
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { InterestedService } from "@/api/models/interested/interested.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { TypeExam } from "@/api/interfaces/exam.interface";

type CandidateRow = {
  id: string;
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  careerId?: string;
  careerName?: string;
  areaId?: string;
};

type PaymentRow = {
  detailId: string;
  amountPaid: number | null;
  typePaid: string | null;
  statusPaid: string | null;
};

export default function ManageExamPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [exam, setExam] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [roster, setRoster] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [areaId, setAreaId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const headerChkRef = useRef<HTMLInputElement>(null);

  const loadExam = async () => {
    const [examData, rosterData] = await Promise.all([
      ExamService.getById(id),
      ExamService.roster(id),
    ]);

    setExam(examData);
    setTitle(examData.title);
    setRoster(rosterData);
    setPayments(
      rosterData.map((r) => ({
        detailId: r.detailId,
        amountPaid: r.amountPaid ?? null,
        typePaid: r.typePaid ?? null,
        statusPaid: r.statusPaid ?? null,
      })),
    );
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadExam();
        const areasData = await getAreas();
        setAreas(areasData);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo cargar el examen", "error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

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
    const loadCandidates = async () => {
      if (!exam) return;

      if (exam.type === TypeExam.SIMULACRO) {
        const response = await InterestedService.listInterested();
        const list = Array.isArray(response.data) ? response.data : [];

        setCandidates(
          list.map((item: any) => ({
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
        const response = await EnrollmentService.listEnrollments();
        const list = Array.isArray(response.data) ? response.data : [];
        const filtered = list.filter((item: any) => item.cycleId === exam.cycleId);

        const uniqueMap = new Map<string, CandidateRow>();

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

        setCandidates(Array.from(uniqueMap.values()));
      }
    };

    loadCandidates();
  }, [exam]);

  const currentAssignedIds = useMemo(() => {
    return roster.map((r) => {
      if (r.personKey.startsWith("ext-")) return r.personKey.replace("ext-", "");
      return r.personKey;
    });
  }, [roster]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => !currentAssignedIds.includes(c.id))
      .filter(
        (c) =>
          (!areaId || c.areaId === areaId) &&
          (!careerId || c.careerId === careerId),
      );
  }, [candidates, currentAssignedIds, areaId, careerId]);

  const visibleIds = useMemo(() => filteredCandidates.map((r) => r.id), [filteredCandidates]);

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

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleSaveTitle = async () => {
    try {
      await ExamService.update(id, { title: title.trim() });
      Swal.fire("Correcto", "Nombre actualizado", "success");
      await loadExam();
    } catch (error: any) {
      Swal.fire("Error", error?.message || "No se pudo actualizar el nombre", "error");
    }
  };

  const handleAddParticipants = async () => {
    if (selected.length === 0) {
      Swal.fire("Atención", "Selecciona participantes para agregar", "warning");
      return;
    }

    try {
      if (exam.type === TypeExam.SIMULACRO) {
        await ExamService.addParticipants(id, { interestedIds: selected });
      } else {
        await ExamService.addParticipants(id, { studentIds: selected });
      }

      setSelected([]);
      await loadExam();
      Swal.fire("Correcto", "Participantes agregados", "success");
    } catch (error: any) {
      Swal.fire("Error", error?.message || "No se pudieron agregar participantes", "error");
    }
  };

  const handleRemoveAssigned = async (personKey: string) => {
    const result = await Swal.fire({
      title: "¿Quitar participante?",
      text: "El participante será retirado del examen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
    });

    if (!result.isConfirmed) return;

    try {
      if (personKey.startsWith("ext-")) {
        await ExamService.removeParticipants(id, {
          interestedIds: [personKey.replace("ext-", "")],
        });
      } else {
        await ExamService.removeParticipants(id, {
          studentIds: [personKey],
        });
      }

      await loadExam();
      Swal.fire("Correcto", "Participante retirado", "success");
    } catch (error: any) {
      Swal.fire("Error", error?.message || "No se pudo quitar el participante", "error");
    }
  };

  const updatePaymentRow = (
    detailId: string,
    patch: Partial<PaymentRow>,
  ) => {
    setPayments((prev) =>
      prev.map((row) => (row.detailId === detailId ? { ...row, ...patch } : row)),
    );
  };

  const handleSavePayments = async () => {
    try {
      await ExamService.savePayments(id, payments);
      await loadExam();
      Swal.fire("Correcto", "Pagos actualizados", "success");
    } catch (error: any) {
      Swal.fire("Error", error?.message || "No se pudieron guardar los pagos", "error");
    }
  };

  if (loading || !exam) {
    return <div className="p-4">Cargando examen...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-3xl font-bold mb-2">Editar examen</h1>
      <p className="text-sm text-gray-600 mb-6">
        Tipo: {exam.type} &nbsp;|&nbsp; Modalidad: {exam.modality}
      </p>

      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 h-11 rounded-md border px-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button className="bg-blue-600" onClick={handleSaveTitle}>
          Guardar nombre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

      <div className="overflow-x-auto border rounded-lg mb-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">(Monto)</th>
              <th className="p-3 text-left">(Método de Pago)</th>
              <th className="p-3 text-left">(Estatus)</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((row) => {
              const currentPayment =
                payments.find((p) => p.detailId === row.detailId) || {
                  detailId: row.detailId,
                  amountPaid: null,
                  typePaid: null,
                  statusPaid: null,
                };

              return (
                <tr key={row.detailId} className="border-b">
                  <td className="p-3">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="p-3">{row.careerName}</td>
                  <td className="p-3">{row.type}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-24 border rounded px-2 py-1"
                      value={currentPayment.amountPaid ?? ""}
                      onChange={(e) =>
                        updatePaymentRow(row.detailId, {
                          amountPaid:
                            e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="p-3">
                    <select
                      className="border rounded px-2 py-1"
                      value={currentPayment.typePaid ?? ""}
                      onChange={(e) =>
                        updatePaymentRow(row.detailId, {
                          typePaid: e.target.value || null,
                        })
                      }
                    >
                      <option value="">-</option>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="YAPE">YAPE</option>
                      <option value="PLIN">PLIN</option>
                      <option value="TARJETA">TARJETA</option>
                      <option value="TRANSFERENCIA_BANCARIA">TRANSFERENCIA</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="border rounded px-2 py-1"
                      value={currentPayment.statusPaid ?? ""}
                      onChange={(e) =>
                        updatePaymentRow(row.detailId, {
                          statusPaid: e.target.value || null,
                        })
                      }
                    >
                      <option value="">-</option>
                      <option value="PAGO">PAGO</option>
                      <option value="DEBE">DEBE</option>
                      <option value="EXONERADO">EXONERADO</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAssigned(row.personKey)}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              );
            })}

            {roster.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-sm text-gray-500">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto border rounded-lg mb-6">
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
            {filteredCandidates.map((row) => (
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

            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-sm text-gray-500">
                  No hay alumnos disponibles para agregar con este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="destructive" onClick={() => router.replace("/list/exam")}>
          Regresar
        </Button>
        <Button variant="secondary" onClick={handleAddParticipants}>
          Agregar alumnos y guardar
        </Button>
        <Button className="bg-green-600" onClick={handleSavePayments}>
          Registrar pago
        </Button>
      </div>
    </div>
  );
}