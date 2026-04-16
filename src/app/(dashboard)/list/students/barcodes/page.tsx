"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { MasterService } from "@/api/models/masters/masters";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type BarcodeCardRow = {
  id: string;
  fullName: string;
  barcodeValue: string;
  barcodeImage: string;
  admissionName?: string;
  cycleName: string;
  careerName: string;
  codeStudent: string;
};

export default function StudentBarcodesPage() {
  const [rows, setRows] = useState<BarcodeCardRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [admissions, setAdmissions] = useState<Array<{ id: string; name: string }>>([]);
  const [cycles, setCycles] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [careers, setCareers] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState({
    admissionId: "",
    cycleId: "",
    areaId: "",
    careerId: "",
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "carnets-alumnos-adix",
  });

  const loadRows = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.admissionId) query.set("admissionId", filters.admissionId);
      if (filters.cycleId) query.set("cycleId", filters.cycleId);
      if (filters.careerId) query.set("careerId", filters.careerId);

      const response = await fetch(
        `${API_URL}/students/barcode-cards${query.toString() ? `?${query.toString()}` : ""}`,
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar los carnets");
      }

      const raw = await response.json();

      const normalized: BarcodeCardRow[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      setRows(normalized);
      setSelectedIds([]);
    } catch (error: any) {
      console.error("Error cargando carnets:", error);
      setRows([]);
      setSelectedIds([]);
      toast.error(error?.message || "No se pudieron cargar los carnets");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [admissionsData, cyclesData, areasData] = await Promise.all([
          MasterService.getAdmissions(),
          MasterService.getCycles(),
          getAreas(),
        ]);
        setAdmissions(admissionsData);
        setCycles(cyclesData);
        setAreas(areasData);
      } catch {
        toast.error("No se pudieron cargar los filtros");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadCareers = async () => {
      if (!filters.areaId) {
        setCareers([]);
        setFilters((prev) => ({ ...prev, careerId: "" }));
        return;
      }

      try {
        const data = await getCareersByArea(filters.areaId);
        setCareers(data);
      } catch {
        toast.error("No se pudieron cargar las carreras");
      }
    };

    loadCareers();
  }, [filters.areaId]);

  useEffect(() => {
    loadRows();
  }, [filters.admissionId, filters.cycleId, filters.careerId]);

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts.slice(0, -1).join(" ") || fullName,
      lastName: parts.slice(-1).join(" ") || "",
    };
  };

  const toggleCard = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const visibleCards = useMemo(() => {
    if (selectedIds.length === 0) return rows;
    return rows.filter((row) => selectedIds.includes(row.id));
  }, [rows, selectedIds]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Carnets con código de barras</h1>
        <div className="flex gap-2">
          <Link href="/list/attendance">
            <Button variant="outline">Retroceder</Button>
          </Link>
          <Button className="bg-blue-600" onClick={() => handlePrint()}>
            Imprimir {selectedIds.length > 0 ? "seleccionados" : "todos"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Admisión</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.admissionId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, admissionId: e.target.value }))
            }
          >
            <option value="">Todas</option>
            {admissions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ciclo</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.cycleId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, cycleId: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {cycles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Área</label>
          <select
            className="w-full h-10 rounded-md border px-3"
            value={filters.areaId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, areaId: e.target.value }))
            }
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
            value={filters.careerId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, careerId: e.target.value }))
            }
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

      <div className="mb-4 text-sm text-gray-600">
        Haz clic sobre un carnet para seleccionarlo. Si no seleccionas ninguno, se imprimirán todos los visibles.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {rows.map((row) => {
          const name = splitName(row.fullName);
          const selected = selectedIds.includes(row.id);

          return (
            <button
              type="button"
              key={row.id}
              onClick={() => toggleCard(row.id)}
              className={`text-left rounded-[24px] border p-5 flex gap-4 min-h-[250px] transition ${
                selected ? "border-blue-600 ring-2 ring-blue-300" : "border-black"
              }`}
            >
              <div className="w-[110px] h-[110px] rounded-[20px] border border-black flex items-center justify-center text-center text-sm">
                
              </div>

              <div className="flex-1 flex flex-col">
                <div className="space-y-3 mb-4">
                  <div className="text-base">
                    <span className="font-semibold">Nombre:</span> {name.firstName}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Apellido:</span> {name.lastName}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Admisión:</span> {row.admissionName || "-"}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Ciclo:</span> {row.cycleName}
                  </div>
                </div>

                <div className="mt-auto">
                  <img
                    src={row.barcodeImage}
                    alt={row.barcodeValue}
                    className="w-full max-h-[90px] object-contain"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        ref={printRef}
        className="hidden print:grid print:grid-cols-2 print:gap-6"
      >
        {visibleCards.map((row) => {
          const name = splitName(row.fullName);

          return (
            <div
              key={row.id}
              className="rounded-[24px] border border-black bg-white p-5 flex gap-4 min-h-[250px]"
            >
              <div className="w-[110px] h-[110px] rounded-[20px] border border-black flex items-center justify-center text-center text-sm">
                
              </div>

              <div className="flex-1 flex flex-col">
                <div className="space-y-3 mb-4">
                  <div className="text-base">
                    <span className="font-semibold">Nombre:</span> {name.firstName}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Apellido:</span> {name.lastName}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Admisión:</span> {row.admissionName || "-"}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">Ciclo:</span> {row.cycleName}
                  </div>
                </div>

                <div className="mt-auto">
                  <img
                    src={row.barcodeImage}
                    alt={row.barcodeValue}
                    className="w-full max-h-[90px] object-contain"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}