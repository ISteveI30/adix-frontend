"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { CareerApi } from "@/api/models/career/career.api";
import { CycleService } from "@/api/models/cycle/cycle.api";
import { AdmissionApi } from "@/api/models/admission/admission.api";

type Row = { id?: string; name: string; [k: string]: any };

function CrudSection({
  title, rows, setRows, columns, api
}: {
  title: string;
  rows: Row[]; setRows: (r: Row[]) => void;
  columns: { key: string; label: string; type?: 'text' | 'number' | 'date' }[];
  api: { list: () => Promise<any[]>, create: (b: any) => Promise<any>, update: (id: string, b: any) => Promise<any>, remove: (id: string) => Promise<any> }
}) {
  const [editing, setEditing] = useState<Record<string, Row>>({});

  const cancel = () => { setEditing({}); api.list().then(setRows); };

  const save = async () => {
    try {
      for (const row of Object.values(editing)) {
        if (row.id) await api.update(row.id, row);
        else await api.create(row);
      }
      setEditing({});
      await Swal.fire({ icon: "success", title: "Cambios guardados" });
      const fresh = await api.list(); setRows(fresh);
    } catch (e:any) {
      await Swal.fire({ icon: "error", title: "Error", text: e?.message || "No se pudo guardar" });
    }
  };

  const remove = async (id: string) => {
    await api.remove(id);
    const fresh = await api.list(); setRows(fresh);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-3">
          <Button variant="outline" onClick={() => setEditing({ ...editing, [`__new_${Date.now()}`]: { name: "" } })}>+ Nuevo</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                {columns.map(c => <th key={c.key} className="py-2 px-3">{c.label}</th>)}
                <th className="py-2 px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...rows, ...Object.values(editing).filter(r => !r.id)].map((r, idx) => {
                const rid = r.id ?? `__new_${idx}`;
                const isEd = !!editing[rid] || !r.id;
                const current = isEd ? (editing[rid] ?? r) : r;
                return (
                  <tr key={rid} className="border-b">
                    {columns.map(col => (
                      <td key={col.key} className="py-2 px-3">
                        {isEd ? (
                          <Input
                            type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                            value={current[col.key] ?? ""}
                            onChange={(e) => setEditing({ ...editing, [rid]: { ...current, [col.key]: e.target.value } })}
                          />
                        ) : (r[col.key] ?? "—")}
                      </td>
                    ))}
                    <td className="py-2 px-3">
                      {isEd ? (
                        <Button size="sm" onClick={() => setEditing({ ...editing, [rid]: current })}>Editando</Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing({ ...editing, [rid]: r })}>Editar</Button>
                          {r.id && <Button size="sm" variant="destructive" onClick={() => remove(r.id!)}>Eliminar</Button>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && Object.keys(editing).length === 0 && (
                <tr><td className="py-6 px-3 text-gray-500" colSpan={columns.length+1}>Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={cancel}>Cancelar</Button>
          <Button onClick={save}>Guardar cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetadataPage() {
  const [careers, setCareers] = useState<Row[]>([]);
  const [cycles, setCycles] = useState<Row[]>([]);
  const [admissions, setAdmissions] = useState<Row[]>([]);

  useEffect(() => {
    CareerApi.list().then(setCareers);
    CycleService.list().then(setCycles);
    AdmissionApi.list().then(setAdmissions);
  }, []);

  return (
    <div className="bg-white p-4 rounded-md m-4 border space-y-6">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h1 className="text-lg font-semibold">Metadata (Carrera, Ciclo, Admisión)</h1>
      </div>

      <CrudSection
        title="Carreras"
        rows={careers}
        setRows={setCareers}
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'scoreMin', label: 'Score Min' },
          { key: 'scoreMax', label: 'Score Max' },
          { key: 'vacants',  label: 'Vacantes' },
          //{ key: 'areaId',   label: 'AreaId' },
        ]}
        api={CareerApi}
      />

      <CrudSection
        title="Ciclos"
        rows={cycles}
        setRows={setCycles}
        columns={[{ key: 'name', label: 'Nombre' }]}
        api={CycleService}
      />

      <CrudSection
        title="Admisiones"
        rows={admissions}
        setRows={setAdmissions}
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'startAt', label: 'Inicio', type: 'date' },
          { key: 'endAt', label: 'Fin', type: 'date' },
        ]}
        api={AdmissionApi}
      />
    </div>
  );
}
