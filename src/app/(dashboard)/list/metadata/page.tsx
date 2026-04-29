"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CareerApi } from "@/api/models/career/career.api";
import { CycleService } from "@/api/models/cycle/cycle.api";
import { AdmissionApi } from "@/api/models/admission/admission.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import {
  AttendanceScheduleService,
  AttendanceScheduleSetting,
} from "@/api/models/attendance-schedule/attendance-schedule.api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = { id?: string; name: string; [k: string]: any };

type ColumnDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
  render?: (args: {
    isEditing: boolean;
    value: any;
    onChange: (v: any) => void;
    row: Row;
  }) => React.ReactNode;
};

const onlyAllowed = <T extends object, K extends keyof T>(
  o: T,
  keys: K[],
): Pick<T, K> =>
  keys.reduce((acc, k) => {
    if (o[k] !== undefined) (acc as any)[k] = o[k];
    return acc;
  }, {} as Pick<T, K>);

const toISODateOrNull = (v: any) => (v ? new Date(v).toISOString() : null);
const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

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

function CrudSection({
  title,
  rows,
  setRows,
  columns,
  api,
  buildPayload,
  onAddNew,
}: {
  title: string;
  rows: Row[];
  setRows: (r: Row[]) => void;
  columns: ColumnDef[];
  api: {
    list: () => Promise<any[]>;
    create: (b: any) => Promise<any>;
    update: (id: string, b: any) => Promise<any>;
    remove: (id: string) => Promise<any>;
  };
  buildPayload: (row: Row, mode: "create" | "update") => any;
  onAddNew?: () => Partial<Row>;
}) {
  const [editing, setEditing] = useState<Record<string, Row>>({});

  const cancel = async () => {
    setEditing({});
    setRows(await api.list());
  };

  const save = async () => {
    try {
      const items = Object.values(editing);

      if (!items.length) {
        await Swal.fire({ icon: "info", title: "No hay cambios" });
        return;
      }

      for (const row of items) {
        if (row.id) {
          await api.update(row.id, buildPayload(row, "update"));
        } else {
          if (!row.name || String(row.name).trim() === "") continue;
          await api.create(buildPayload(row, "create"));
        }
      }

      setEditing({});
      await Swal.fire({ icon: "success", title: "Cambios guardados" });
      setRows(await api.list());
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || "No se pudo guardar",
      });
    }
  };

  const remove = async (id: string) => {
    await api.remove(id);
    setRows(await api.list());
  };

  const displayPairs = useMemo<[string, Row][]>(() => {
    const existing: [string, Row][] = rows.map((r) => [r.id!, r]);
    const news: [string, Row][] = Object.entries(editing).filter(
      ([, r]) => !r.id,
    );

    return [...existing, ...news];
  }, [rows, editing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-3">
          <Button
            variant="outline"
            onClick={() =>
              setEditing((prev) => ({
                ...prev,
                [`__new_${Date.now()}`]: {
                  name: "",
                  ...(onAddNew?.() ?? {}),
                },
              }))
            }
          >
            + Nuevo
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                {columns.map((c) => (
                  <th key={c.key} className="py-2 px-3">
                    {c.label}
                  </th>
                ))}
                <th className="py-2 px-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {displayPairs.map(([rid, base]) => {
                const isEd = !!editing[rid] || !base.id;
                const current = isEd ? editing[rid] ?? base : base;

                return (
                  <tr key={rid} className="border-b">
                    {columns.map((col) => {
                      const raw = current[col.key];
                      const valueForRead =
                        col.type === "date" ? toDateInput(raw) : raw ?? "—";

                      const onChange = (v: any) =>
                        setEditing((prev) => ({
                          ...prev,
                          [rid]: { ...current, [col.key]: v },
                        }));

                      return (
                        <td key={col.key} className="py-2 px-3">
                          {col.render ? (
                            col.render({
                              isEditing: isEd,
                              value: isEd
                                ? col.type === "date"
                                  ? toDateInput(raw)
                                  : raw ?? ""
                                : valueForRead,
                              onChange,
                              row: current,
                            })
                          ) : isEd ? (
                            <Input
                              type={
                                col.type === "number"
                                  ? "number"
                                  : col.type === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={
                                col.type === "date"
                                  ? toDateInput(raw)
                                  : (raw ?? "")
                              }
                              onChange={(e) => onChange(e.target.value)}
                            />
                          ) : (
                            <span>{String(valueForRead)}</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3">
                      {isEd ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setEditing((prev) => ({ ...prev, [rid]: current }))
                          }
                        >
                          Editando
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditing((prev) => ({ ...prev, [rid]: base }))
                            }
                          >
                            Editar
                          </Button>

                          {base.id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => remove(base.id!)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!rows.length && Object.keys(editing).length === 0 && (
                <tr>
                  <td
                    className="py-6 px-3 text-gray-500"
                    colSpan={columns.length + 1}
                  >
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={cancel}>
            Cancelar
          </Button>
          <Button onClick={save}>Guardar cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CareersSection() {
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [careers, setCareers] = useState<Row[]>([]);
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const _areas = await getAreas();
      setAreas(_areas || []);
      setAreaMap(
        (_areas || []).reduce((acc: any, a: any) => {
          acc[a.id] = a.name;
          return acc;
        }, {}),
      );

      if (_areas?.length) setSelectedArea(_areas[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedArea) return;
    getCareersByArea(selectedArea).then(setCareers);
  }, [selectedArea]);

  const columns: ColumnDef[] = [
    { key: "name", label: "Nombre" },
    { key: "scoreMin", label: "Score Min", type: "number" },
    { key: "scoreMax", label: "Score Max", type: "number" },
    { key: "vacants", label: "Vacantes", type: "number" },
    {
      key: "areaId",
      label: "Área",
      render: ({ isEditing, value, onChange }) =>
        isEditing ? (
          <Select value={value || selectedArea} onValueChange={onChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Seleccione un área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{areaMap[(value as string) ?? ""] ?? "—"}</span>
        ),
    },
  ];

  const buildPayload = (row: Row) => {
    const base = onlyAllowed(row, [
      "name",
      "scoreMin",
      "scoreMax",
      "vacants",
      "areaId",
    ]);

    if (!base.areaId) (base as any).areaId = selectedArea;

    if (!base.name || String(base.name).trim() === "") {
      throw new Error("El nombre es obligatorio.");
    }

    const toNum = (x: any) =>
      x === "" || x === undefined || x === null ? undefined : Number(x);

    (base as any).scoreMin = toNum(base.scoreMin);
    (base as any).scoreMax = toNum(base.scoreMax);
    (base as any).vacants = toNum(base.vacants);

    return base;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm">Filtrar por área:</span>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Seleccione un área" />
          </SelectTrigger>

          <SelectContent>
            {areas.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CrudSection
        title="Carreras"
        rows={careers}
        setRows={setCareers}
        columns={columns}
        api={{
          list: async () => getCareersByArea(selectedArea),
          create: CareerApi.create,
          update: CareerApi.update,
          remove: CareerApi.remove,
        }}
        buildPayload={buildPayload}
        onAddNew={() => ({ areaId: selectedArea })}
      />
    </div>
  );
}

function AttendanceScheduleSection() {
  const [rows, setRows] = useState<AttendanceScheduleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingShift, setSavingShift] = useState<string | null>(null);

  const loadRows = async () => {
    try {
      setLoading(true);
      const data = await AttendanceScheduleService.list();

      setRows(
        data
          .filter((item) => item.shift === "MANANA" || item.shift === "TARDE")
          .sort((a, b) => {
            const order = { MANANA: 1, TARDE: 2, NOCHE: 3 };
            return order[a.shift] - order[b.shift];
          }),
      );
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudieron cargar los horarios"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const updateRow = (
    shift: AttendanceScheduleSetting["shift"],
    field: "start" | "punctualLimit" | "absenceCutoff" | "end",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.shift === shift
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const saveRow = async (row: AttendanceScheduleSetting) => {
    try {
      setSavingShift(row.shift);

      await AttendanceScheduleService.update(row.shift, {
        start: row.start,
        punctualLimit: row.punctualLimit,
        absenceCutoff: row.absenceCutoff,
        end: row.end,
      });

      await Swal.fire({
        icon: "success",
        title: "Horario actualizado",
        text: `El horario del turno ${row.shift} se actualizó correctamente.`,
      });

      await loadRows();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudo actualizar el horario"),
      });
    } finally {
      setSavingShift(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Asistencia</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">Cargando horarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Turno</th>
                  <th className="py-2 px-3">Inicio asistencia</th>
                  <th className="py-2 px-3">Límite puntual</th>
                  <th className="py-2 px-3">Hora de falta</th>
                  <th className="py-2 px-3">Fin turno</th>
                  <th className="py-2 px-3">Acción</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.shift} className="border-b">
                    <td className="py-2 px-3 font-medium">
                      {row.shift === "MANANA" ? "Mañana" : "Tarde"}
                    </td>

                    <td className="py-2 px-3">
                      <Input
                        type="time"
                        value={row.start}
                        onChange={(e) =>
                          updateRow(row.shift, "start", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2 px-3">
                      <Input
                        type="time"
                        value={row.punctualLimit}
                        onChange={(e) =>
                          updateRow(row.shift, "punctualLimit", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2 px-3">
                      <Input
                        type="time"
                        value={row.absenceCutoff}
                        onChange={(e) =>
                          updateRow(row.shift, "absenceCutoff", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2 px-3">
                      <Input
                        type="time"
                        value={row.end}
                        onChange={(e) =>
                          updateRow(row.shift, "end", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2 px-3">
                      <Button
                        onClick={() => saveRow(row)}
                        disabled={savingShift === row.shift}
                      >
                        {savingShift === row.shift ? "Guardando..." : "Guardar"}
                      </Button>
                    </td>
                  </tr>
                ))}

                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="py-6 px-3 text-gray-500">
                      Sin horarios configurados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 rounded-md bg-slate-50 border p-4 text-sm text-gray-600">
          <p>
            Estos horarios se usan automáticamente en el módulo de asistencias
            para calcular si el alumno asistió puntualmente, llegó tarde o quedó
            como falta.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetadataPage() {
  const [cycles, setCycles] = useState<Row[]>([]);
  const [admissions, setAdmissions] = useState<Row[]>([]);

  useEffect(() => {
    CycleService.list().then(setCycles);

    AdmissionApi.list()
      .then((rows) =>
        rows.map((r: any) => ({
          ...r,
          startAt: toDateInput(r.startAt),
          endAt: toDateInput(r.endAt),
        })),
      )
      .then(setAdmissions);
  }, []);

  const buildCyclePayload = (row: Row) => {
    const base = onlyAllowed(row, ["name"]);

    if (!base.name || String(base.name).trim() === "") {
      throw new Error("El nombre es obligatorio.");
    }

    return base;
  };

  const buildAdmissionPayload = (row: Row) => {
    const base = onlyAllowed(row, ["name", "startAt", "endAt"]);

    if (!base.name || String(base.name).trim() === "") {
      throw new Error("El nombre es obligatorio.");
    }

    (base as any).startAt = toISODateOrNull(row.startAt);
    (base as any).endAt = toISODateOrNull(row.endAt);

    return base;
  };

  return (
    <div className="bg-white p-4 rounded-md m-4 border space-y-8">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <h1 className="text-lg font-semibold">
          Metadata (Carrera, Ciclo, Admisión)
        </h1>
      </div>

      <CareersSection />

      <CrudSection
        title="Ciclos"
        rows={cycles}
        setRows={setCycles}
        columns={[{ key: "name", label: "Nombre" }]}
        api={CycleService}
        buildPayload={buildCyclePayload}
      />

      <CrudSection
        title="Admisiones"
        rows={admissions}
        setRows={setAdmissions}
        columns={[
          { key: "name", label: "Nombre" },
          { key: "startAt", label: "Inicio", type: "date" },
          { key: "endAt", label: "Fin", type: "date" },
        ]}
        api={AdmissionApi}
        buildPayload={buildAdmissionPayload}
      />

      <AttendanceScheduleSection />
    </div>
  );
}