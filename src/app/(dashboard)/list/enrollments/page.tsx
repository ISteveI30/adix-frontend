
// import { listEnrollments } from "@/api/enrollment/enrollment.api";
// import FormModal from "@/components/customs/FormModal";
// import Pagination from "@/components/customs/Pagination";
// import TableSearch from "@/components/customs/TableSearch";
// import TableView from "@/components/customs/TableView";
// import {  role } from "@/lib/data";
// import { formateaFecha, formatearMoneda } from "@/lib/utils";

// type Enrollment = {
//   id: string;
//   startDate: string;
//   endDate: string;
//   student: {
//     firstName: string;
//     lastName: string;
//   };
//   modality: string;
//   shift: string;
//   cycle: {
//     name:string
//   };
//   career: {
//     name:string
//   };
//   totalCost: number;
//   initialPayment: number;
//   discount: number;
// };

// const dataEnrollments: Enrollment[] = await listEnrollments();

// const columns = [
//   {
//     header: "Fecha de Matricula",
//     accessor: "startDate",
//   },
//   {
//     header: "Fecha de Fin",
//     accessor: "endDate",
//   },
//   {
//     header: "Estudiante",
//     accessor: "student",
//   },
//   {
//     header: "Modalidad",
//     accessor: "modality",
//   },
//   {
//     header: "Turno",
//     accessor: "shift",
//   },
//   {
//     header: "Ciclo",
//     accessor: "cycle",
//   },
//   {
//     header: "Carrera",
//     accessor: "career",
//   },
//   {
//     header: "Costo Total",
//     accessor: "totalCost",    
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Pago Inicial",
//     accessor: "initialPayment",
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Descuento",
//     accessor: "discount",
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Acciones",
//     accessor: "action",
//   }
// ];

// const EnrollmentListPage = () => {
//   const renderRow = (item: Enrollment) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-userPurpleLight"
//     >
//       <td className="hidden md:table-cell">{formateaFecha(item.startDate)}</td>
//       <td className="hidden md:table-cell">{formateaFecha(item.endDate)}</td>
//       <td className="hidden md:table-cell">{item.student.firstName}, {item.student.lastName}</td>
//       <td className="hidden md:table-cell">{item.modality }</td>
//       <td className="hidden md:table-cell">{item.shift ==="MANANA" ? "Mañana" : "Tarde"}</td>
//       <td className="hidden md:table-cell">{item.cycle.name}</td>
//       <td className="hidden md:table-cell">{item.career.name}</td>
//       <td className="hidden md:table-cell">{formatearMoneda(item.totalCost)}</td>
//       <td className="hidden md:table-cell">{formatearMoneda(item.initialPayment)}</td>
//       <td className="hidden md:table-cell">{formatearMoneda(item.discount)}</td>

//       <td>
//         <div className="flex items-center gap-2">
//           {role === "admin" && (
//             <>
//               <FormModal table="enrollment" type="update" data={item} />
//               <FormModal table="enrollment" type="delete" id={item.id} />
//             </>
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">Lista de Matriculas</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-userYellow">
//               <img src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-userYellow">
//               <img src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             {role === "admin" && (
//               <FormModal table="enrollment" type="create"/>
//             )}
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       <TableView columns={columns} renderRow={renderRow} data={dataEnrollments} />
//       {/* PAGINATION */}
//       <Pagination />
//     </div>
//   );
// };

// export default EnrollmentListPage;

"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "@/components/customs/InputField";
import { createEnrollment } from "@/api/enrollment/enrollment.api";
import { getAreas, getCareersByArea } from "@/api/areas/areas.api";
import StudentSearchDialog from "@/components/forms/StudentSearchDialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  data?: any;
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
      className="flex flex-col gap-2 p-2 max-w-6xl mx-auto" // Más ancho
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {/* {type === "create" ? "Registrar Matrícula" : "Actualizar Matrícula"} */}
        Registrar Matrícula
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
        {/* {type === "create" ? "Crear Matrícula" : "Actualizar Matrícula"} */}
        Crear Matrícula
      </button>
    </form>
  );
};

export default EnrollmentForm;