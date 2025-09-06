"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { CycleService } from "@/api/models/cycle/cycle.api";

const examSchema = z.object({
  title: z.string().min(1, "El nombre del examen es obligatorio"),
  modality: z.string().min(1, "La modalidad es obligatoria"),
  examType: z.string().min(1, "El tipo de examen es obligatorio"),
  cycleId: z.string().min(1, "Debe seleccionar un ciclo"),
  cycleName: z.string().optional()
});

export type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  type: "regular" | "simulacro";
  onSubmit: (data: ExamFormData) => void; 
}

const ExamForm = ({ type, onSubmit }: ExamFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      modality: "",
      examType: "",
      cycleId: "",
      cycleName: "",
    },
  });

  const router = useRouter();
  const [modalities] = useState(["PRESENCIAL", "VIRTUAL", "HIBRIDO"]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [cycles, setCycles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setExamTypes(type === "regular" ? ["DIARIO", "SEMANAL"] : ["SIMULACRO"]);

    CycleService.list()
      .then((data) => setCycles(data))
      .catch((err) => console.error("Error cargando ciclos", err));
  }, [type]);

  return (
    <section className="w-full flex justify-center py-10">
      <form
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Registro de Examen {type === "simulacro" ? "(Simulacro)" : ""}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nombre */}
          <div>
            <Label htmlFor="title">Nombre del examen</Label>
            <Input
              id="title"
              placeholder="Ingrese nombre"
              {...register("title")}
              className="mt-1 bg-gray-50 border border-gray-300"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Modalidad */}
          <div>
            <Label>Modalidad</Label>
            <Select onValueChange={(val) => setValue("modality", val)}>
              <SelectTrigger className="mt-1 bg-gray-50 border border-gray-300">
                {watch("modality") || "Seleccione modalidad"}
              </SelectTrigger>
              <SelectContent>
                {modalities.map((mod) => (
                  <SelectItem key={mod} value={mod}>
                    {mod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modality && <p className="text-red-500 text-sm">{errors.modality.message}</p>}
          </div>

          {/* Tipo */}
          <div>
            <Label>Tipo de examen</Label>
            <Select onValueChange={(val) => setValue("examType", val)}>
              <SelectTrigger className="mt-1 bg-gray-50 border border-gray-300">
                {watch("examType") || "Seleccione tipo"}
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examType && <p className="text-red-500 text-sm">{errors.examType.message}</p>}
          </div>

          {/* Ciclo */}
          <div>
            <Label>Ciclo</Label>
            <Select onValueChange={(val) => {
                setValue("cycleId", val, { shouldValidate: true });
                const name = cycles.find((c) => c.id === val)?.name || "";
                setValue("cycleName", name);          
              }}>
              <SelectTrigger className="mt-1 bg-gray-50 border border-gray-300">
                {cycles.find((c) => c.id === watch("cycleId"))?.name || "Seleccione ciclo"}
              </SelectTrigger>
              <SelectContent>
                {cycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>  
                ))}
              </SelectContent>
            </Select>
            {errors.cycleId && <p className="text-red-500 text-sm">{errors.cycleId.message}</p>}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-center gap-6 mt-10">
          <Button
            type="button"
            className="px-8 py-2 text-base bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="px-8 py-2 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            Asignar estudiantes
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ExamForm;
