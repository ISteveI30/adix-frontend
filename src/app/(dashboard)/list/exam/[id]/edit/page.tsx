"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { ExamService } from "@/api/models/exam/exam.api";

type ScoreRow = {
  detailId: string;
  firstName: string;
  lastName: string;
  careerName: string;
  goodAnswers: number | null;
  wrongAnswers: number | null;
  totalScore: number | null;
};

function clamp(value: number, max: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(value, max));
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

export default function EditScoresPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const roster = await ExamService.roster(id);

        setRows(
          roster.map((r: any) => ({
            detailId: r.detailId,
            firstName: r.firstName,
            lastName: r.lastName,
            careerName: r.careerName,
            goodAnswers: r.goodAnswers ?? null,
            wrongAnswers: r.wrongAnswers ?? null,
            totalScore: r.totalScore ?? null,
          })),
        );
      } catch (error) {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: getErrorMessage(error, "No se pudieron cargar las notas"),
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = rows.map((r) => ({
        detailId: r.detailId,
        goodAnswers: r.goodAnswers === null ? null : Number(r.goodAnswers),
        wrongAnswers: r.wrongAnswers === null ? null : Number(r.wrongAnswers),
        totalScore: r.totalScore === null ? null : Number(r.totalScore),
      }));

      const invalid = payload.find(
        (r) =>
          (r.goodAnswers !== null && (Number.isNaN(r.goodAnswers) || r.goodAnswers < 0)) ||
          (r.wrongAnswers !== null && (Number.isNaN(r.wrongAnswers) || r.wrongAnswers < 0)) ||
          (r.totalScore !== null && (Number.isNaN(r.totalScore) || r.totalScore < 0)),
      );

      if (invalid) {
        await Swal.fire({
          icon: "warning",
          title: "Datos inválidos",
          text: "Las notas deben ser números válidos y no negativos.",
        });
        return;
      }

      await ExamService.saveScores(id, payload);

      await Swal.fire({
        icon: "success",
        title: "Correcto",
        text: "Notas guardadas",
      });

      router.replace("/list/exam");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudieron guardar las notas"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="p-4">Cargando notas...</div>
      </section>
    );
  }

  return (
    <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-2xl font-bold mb-6">Registrar / Editar Notas</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">Carrera</th>
              <th className="p-3 text-left">Buenas</th>
              <th className="p-3 text-left">Malas</th>
              <th className="p-3 text-left">Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.detailId} className="border-b">
                <td className="p-3">
                  {r.firstName} {r.lastName}
                </td>
                <td className="p-3">{r.careerName}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24 border rounded px-2 py-1 text-center"
                    value={r.goodAnswers ?? ""}
                    onChange={(e) => {
                      const v =
                        e.target.value === "" ? null : clamp(Number(e.target.value), 100);
                      setRows((prev) =>
                        prev.map((x) =>
                          x.detailId === r.detailId ? { ...x, goodAnswers: v } : x,
                        ),
                      );
                    }}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24 border rounded px-2 py-1 text-center"
                    value={r.wrongAnswers ?? ""}
                    onChange={(e) => {
                      const v =
                        e.target.value === "" ? null : clamp(Number(e.target.value), 100);
                      setRows((prev) =>
                        prev.map((x) =>
                          x.detailId === r.detailId ? { ...x, wrongAnswers: v } : x,
                        ),
                      );
                    }}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    max={400}
                    className="w-24 border rounded px-2 py-1 text-center"
                    value={r.totalScore ?? ""}
                    onChange={(e) => {
                      const v =
                        e.target.value === "" ? null : clamp(Number(e.target.value), 400);
                      setRows((prev) =>
                        prev.map((x) =>
                          x.detailId === r.detailId ? { ...x, totalScore: v } : x,
                        ),
                      );
                    }}
                  />
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-gray-500 text-center">
                  No hay asignados en este examen
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => router.replace("/list/exam")}>
          Cancelar
        </Button>
        <Button
          className="bg-blue-600"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar notas"}
        </Button>
      </div>
    </section>
  );
}