"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../customs/InputField";
import { createEnrollment } from "@/api/enrollment/enrollment.api";
import { getAreas, getCareersByArea } from "@/api/areas/areas.api";
import StudentSearchDialog from "./StudentSearchDialog";
import { Checkbox } from "../ui/checkbox";

const schema = z.object({
  areaId: z.string().min(1, { message: "Se requiere un área" }),
  studentId: z.string().min(1, { message: "Se requiere un estudiante" }),
  cycleId: z.string().min(1, { message: "Se requiere un ciclo" }),
  careerId: z.string().min(1, { message: "Se requiere una carrera" }),
  startDate: z.string().min(1, { message: "Se requiere una fecha de inicio" }),
  endDate: z.string().min(1, { message: "Se requiere una fecha de fin" }),
  modality: z.enum(["PRESENCIAL", "VIRTUAL"], {
    message: "Se requiere una modalidad",
  }),
  shift: z.enum(["MAÑANA", "TARDE", "NOCHE"], {
    message: "Se requiere un turno",
  }),
  credit: z.boolean(),
  paymentCarnet: z.boolean(),
  carnetCost: z.string().min(1, { message: "Se requiere el costo del carnet" }),
  totalCost: z.string().min(1, { message: "Se requiere el costo total" }),
  initialPayment: z.string().min(1, { message: "Se requiere el pago inicial" }),
  discounts: z.string().min(1, { message: "Se requiere el descuento" }),
  notes: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const EnrollmentForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: Inputs;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const [areas, setAreas] = useState([]);
  const [careers, setCareers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const selectedArea = watch("areaId");

  useEffect(() => {
    const fetchAreas = async () => {
      const data = await getAreas();
      setAreas(data);
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const fetchCareers = async () => {
        const data = await getCareersByArea(selectedArea);
        setCareers(data);
      };
      fetchCareers();
    } else {
      setCareers([]);
    }
  }, [selectedArea]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await createEnrollment(data);

      if (response) {
        console.log("Matrícula creada exitosamente");
      } else {
        console.error("Error al crear la matrícula");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  return (
    <form
      className="flex flex-col gap-4 p-4 max-w-6xl mx-auto" // Más ancho
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Registrar Matrícula" : "Actualizar Matrícula"}
      </h1>

      {/* Buscar estudiante */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Estudiante</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Seleccionar estudiante"
            value={
              selectedStudent
                ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                : ""
            }
            readOnly
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm flex-1"
          />
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Buscar
          </button>
        </div>
        {errors.studentId?.message && (
          <p className="text-xs text-red-400">{errors.studentId.message}</p>
        )}
      </div>

      {/* Diálogo para buscar estudiantes */}
      <StudentSearchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setValue("studentId", student.id);
        }}
      />

      {/* Área y Carrera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Área</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("areaId")}
            onChange={(e) => {
              setValue("areaId", e.target.value);
              setValue("careerId", "");
            }}
          >
            <option value="">Seleccionar área</option>
            {areas.map((area:{
              id: string;
              name: string;
              description: string;
            }) => (
              <option key={area.id} value={area.id}>
                {area.name} - {area.description}
              </option>
            ))}
          </select>
          {errors.areaId?.message && (
            <p className="text-xs text-red-400">{errors.areaId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Carrera</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("careerId")}
            disabled={!selectedArea}
          >
            <option value="">Seleccionar carrera</option>
            {careers.map((career:{
              id: string;
              name: string;
            }) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
          {errors.careerId?.message && (
            <p className="text-xs text-red-400">{errors.careerId.message}</p>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Fecha de Inicio"
          name="startDate"
          type="date"
          register={register}
          error={errors.startDate}
        />
        <InputField
          label="Fecha de Fin"
          name="endDate"
          type="date"
          register={register}
          error={errors.endDate}
        />
      </div>

      {/* Modalidad y Turno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Modalidad</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("modality")}
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="VIRTUAL">Virtual</option>
          </select>
          {errors.modality?.message && (
            <p className="text-xs text-red-400">{errors.modality.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Turno</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("shift")}
          >
            <option value="MAÑANA">Mañana</option>
            <option value="TARDE">Tarde</option>
            <option value="NOCHE">Noche</option>
          </select>
          {errors.shift?.message && (
            <p className="text-xs text-red-400">{errors.shift.message}</p>
          )}
        </div>
      </div>

      {/* Checkbox para pagar el carnet */}
      <div className="flex items-center gap-2">
        <Checkbox id="paymentCarnet" {...register("paymentCarnet")} />
        <label htmlFor="paymentCarnet" className="text-sm">
          ¿Pagó el carnet?
        </label>
      </div>

      {/* Costos y Pagos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Costo del Carnet"
          name="carnetCost"
          type="number"
          register={register}
          error={errors.carnetCost}
        />
        <InputField
          label="Costo Total"
          name="totalCost"
          type="number"
          register={register}
          error={errors.totalCost}
        />
        <InputField
          label="Pago Inicial"
          name="initialPayment"
          type="number"
          register={register}
          error={errors.initialPayment}
        />
        <InputField
          label="Descuento"
          name="discounts"
          type="number"
          register={register}
          error={errors.discounts}
        />
      </div>

      {/* Notas */}
      <InputField
        label="Notas"
        name="notes"
        type="text"
        register={register}
        error={errors.notes}
      />

      {/* Botón de envío */}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Crear Matrícula" : "Actualizar Matrícula"}
      </button>
    </form>
  );
};

export default EnrollmentForm;