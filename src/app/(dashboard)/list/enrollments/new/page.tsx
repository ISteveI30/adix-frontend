"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import TutorStudentForm from "@/components/forms/TutorStudentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EnrollmentService } from "@/api/models/enrollment/enrollment.api";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { MasterService } from "@/api/models/masters/masters";
import { TutorService } from "@/api/models/tutor/tutor.api";
import { StudentService } from "@/api/models/student/students.api";

import {
  CreateEnrollmentDto,
  Modality,
  Shift,
  TutorType,
} from "@/api/interfaces/enrollment.interface";
import { Area } from "@/api/interfaces/area.interface";
import { Career } from "@/api/interfaces/career.interface";
import { Cycle } from "@/api/interfaces/cycle.interface";
import { Admission } from "@/api/interfaces/admission.interface";
import { Tutor } from "@/api/interfaces/tutor.interface";
import { Student } from "@/api/interfaces/student.interface";
import { useTutorStudentStore } from "@/store/tutorStudentStore";
import { useForm } from "react-hook-form";

type AcademicForm = {
  areaId: string;
  careerId: string;
  cycleId: string;
  admissionId: string;
  startDate: string;
  endDate: string;
  modality: Modality;
  shift: Shift;
  credit: boolean;
  numInstallments: number;
  paymentCarnet: boolean;
  carnetCost: number;
  totalCost: number;
  initialPayment: number;
  discounts: number;
  notes?: string;
};

function getErrorMessage(error: any) {
  if (!error) return "No se pudo crear la matrícula";

  if (typeof error === "string") return error;

  if (Array.isArray(error?.message)) return error.message.join(", ");
  if (typeof error?.message === "string") return error.message;

  if (typeof error?.error === "string") return error.error;

  if (typeof error?.response?.data?.message === "string") {
    return error.response.data.message;
  }

  if (Array.isArray(error?.response?.data?.message)) {
    return error.response.data.message.join(", ");
  }

  return "No se pudo crear la matrícula";
}

export default function EnrollmentFormPage() {
  const {
    tutorStudentData,
    setTutorStudentData,
    setStudentId,
    reset: resetStore,
  } = useTutorStudentStore();

  const [step, setStep] = useState<"student" | "academic">("student");
  const [areas, setAreas] = useState<Area[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<AcademicForm>({
    defaultValues: {
      modality: Modality.PRESENCIAL,
      shift: Shift.MANANA,
      credit: false,
      numInstallments: 1,
      paymentCarnet: false,
      carnetCost: 0,
      totalCost: 0,
      initialPayment: 0,
      discounts: 0,
    },
  });

  const areaId = watch("areaId");
  const credit = watch("credit");
  const totalCost = Number(watch("totalCost") || 0);
  const discounts = Number(watch("discounts") || 0);
  const initialPayment = Number(watch("initialPayment") || 0);
  const paymentCarnet = watch("paymentCarnet");

  useEffect(() => {
    const load = async () => {
      try {
        const [areasData, cyclesData, admissionsData] = await Promise.all([
          getAreas(),
          MasterService.getCycles(),
          MasterService.getAdmissions(),
        ]);

        setAreas(areasData);
        setCycles(cyclesData);
        setAdmissions(admissionsData);
      } catch {
        toast.error("No se pudieron cargar los datos base");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadCareers = async () => {
      if (!areaId) {
        setCareers([]);
        setValue("careerId", "");
        return;
      }

      try {
        const data = await getCareersByArea(areaId);
        setCareers(data);
      } catch {
        toast.error("No se pudieron cargar las carreras");
      }
    };

    loadCareers();
  }, [areaId, setValue]);

  const resetAll = () => {
    reset();
    resetStore();
    setStep("student");
  };

  const handleTutorStudentSave = async (data: { tutor: Tutor; student: Student }) => {
    setTutorStudentData(data);
    setStudentId(data.student.id || "");
    setStep("academic");
  };

  const ensureStudentExists = async (): Promise<string> => {
    if (!tutorStudentData) {
      throw new Error("Primero debes registrar tutor y estudiante");
    }

    let savedTutor = tutorStudentData.tutor;

    if (!savedTutor.id) {
      savedTutor = await TutorService.saveTutor({
        dni: savedTutor.dni,
        firstName: savedTutor.firstName,
        lastName: savedTutor.lastName,
        email: savedTutor.email,
        phone1: savedTutor.phone1,
        phone2: savedTutor.phone2,
        type: savedTutor.type as TutorType,
        observation: savedTutor.observation,
        otherFirstName: savedTutor.otherFirstName,
        otherLastName: savedTutor.otherLastName,
        otherPhone: savedTutor.otherPhone,
      });
    } else {
      savedTutor = await TutorService.updateTutor(savedTutor);
    }

    let savedStudent = tutorStudentData.student;

    if (!savedStudent.id) {
      savedStudent = await StudentService.saveStudent({
        ...savedStudent,
        tutorId: savedTutor.id!,
      });
    } else {
      savedStudent = await StudentService.updateStudent({
        ...savedStudent,
        tutorId: savedTutor.id!,
      });
    }

    setTutorStudentData({
      tutor: savedTutor,
      student: savedStudent,
    });
    setStudentId(savedStudent.id!);

    return savedStudent.id!;
  };

  const onSubmitAcademic = async (data: AcademicForm) => {
    try {
      const tuitionNet = totalCost - discounts;

      if (!data.areaId || !data.careerId || !data.cycleId || !data.admissionId) {
        toast.error("Completa área, carrera, ciclo y admisión");
        return;
      }

      if (!data.startDate || !data.endDate) {
        toast.error("Completa las fechas");
        return;
      }

      if (new Date(data.endDate) < new Date(data.startDate)) {
        toast.error("La fecha fin no puede ser menor a la fecha inicio");
        return;
      }

      if (tuitionNet <= 0) {
        toast.error("El costo neto de matrícula debe ser mayor a 0");
        return;
      }

      if (initialPayment > tuitionNet) {
        toast.error("El pago inicial no puede ser mayor al neto de matrícula");
        return;
      }

      if (credit && Number(data.numInstallments) < 1) {
        toast.error("Si es a crédito debes indicar al menos una cuota");
        return;
      }

      const currentStudentId = await ensureStudentExists();

      const payload: CreateEnrollmentDto = {
        studentId: currentStudentId,
        admissionId: data.admissionId,
        cycleId: data.cycleId,
        careerId: data.careerId,
        startDate: data.startDate,
        endDate: data.endDate,
        modality: data.modality,
        shift: data.shift,
        credit: data.credit,
        numInstallments: data.credit ? Number(data.numInstallments) : 1,
        paymentCarnet: data.paymentCarnet,
        carnetCost: Number(data.carnetCost || 0),
        totalCost: Number(data.totalCost),
        initialPayment: Number(data.initialPayment || 0),
        discounts: Number(data.discounts || 0),
        notes: data.notes || "",
      };

      await EnrollmentService.createEnrollment(payload);
      toast.success("Matrícula registrada correctamente");
      resetAll();
    } catch (error: any) {
      console.error("Error creando matrícula:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const saldo = Math.max(0, totalCost - discounts - initialPayment);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">Registro de Matrícula</h1>
        </div>

        <div className="px-6 pt-6">
          <div className="mb-6 flex">
            <button
              type="button"
              className={`flex-1 py-2 font-medium ${
                step === "student"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setStep("student")}
            >
              Datos del Estudiante
            </button>
            <button
              type="button"
              className={`flex-1 py-2 font-medium ${
                step === "academic"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              disabled={!tutorStudentData}
              onClick={() => tutorStudentData && setStep("academic")}
            >
              Información Académica
            </button>
          </div>

          {step === "student" ? (
            <TutorStudentForm
              onSave={handleTutorStudentSave}
              initialData={
                tutorStudentData
                  ? {
                      tutorId: tutorStudentData.tutor.id,
                      dni: tutorStudentData.tutor.dni,
                      firstName: tutorStudentData.tutor.firstName,
                      lastName: tutorStudentData.tutor.lastName,
                      email: tutorStudentData.tutor.email,
                      phone1: tutorStudentData.tutor.phone1,
                      phone2: tutorStudentData.tutor.phone2,
                      type: tutorStudentData.tutor.type as TutorType,
                      observation: tutorStudentData.tutor.observation,
                      otherFirstName: tutorStudentData.tutor.otherFirstName,
                      otherLastName: tutorStudentData.tutor.otherLastName,
                      otherPhone: tutorStudentData.tutor.otherPhone,
                      studentId: tutorStudentData.student.id,
                      studentFirstName: tutorStudentData.student.firstName,
                      studentLastName: tutorStudentData.student.lastName,
                      studentEmail: tutorStudentData.student.email,
                      studentPhone: tutorStudentData.student.phone,
                      studentDni: tutorStudentData.student.dni,
                      studentAddress: tutorStudentData.student.address,
                      studentSchool: tutorStudentData.student.school,
                      studentBirthday: tutorStudentData.student.birthday
                        ? new Date(tutorStudentData.student.birthday).toISOString().slice(0, 10)
                        : "",
                    }
                  : undefined
              }
              onCancel={resetAll}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmitAcademic)} className="space-y-8 pb-6">
              {tutorStudentData && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p>
                      <b>Estudiante:</b> {tutorStudentData.student.firstName}{" "}
                      {tutorStudentData.student.lastName}
                    </p>
                    <p>
                      <b>Email:</b> {tutorStudentData.student.email || "No registrado"}
                    </p>
                    <p>
                      <b>Tutor:</b> {tutorStudentData.tutor.firstName}{" "}
                      {tutorStudentData.tutor.lastName}
                    </p>
                    <p>
                      <b>Teléfono Tutor:</b> {tutorStudentData.tutor.phone1 || "No registrado"}
                    </p>
                  </div>
                </div>
              )}

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Programa Académico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Área *</label>
                    <select {...register("areaId")} className="w-full h-10 rounded-md border px-3">
                      <option value="">Seleccione área</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Carrera *</label>
                    <select {...register("careerId")} className="w-full h-10 rounded-md border px-3">
                      <option value="">Seleccione carrera</option>
                      {careers.map((career) => (
                        <option key={career.id} value={career.id}>
                          {career.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ciclo *</label>
                    <select {...register("cycleId")} className="w-full h-10 rounded-md border px-3">
                      <option value="">Seleccione ciclo</option>
                      {cycles.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Admisión *</label>
                    <select {...register("admissionId")} className="w-full h-10 rounded-md border px-3">
                      <option value="">Seleccione admisión</option>
                      {admissions.map((admission) => (
                        <option key={admission.id} value={admission.id}>
                          {admission.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Período Académico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fecha de Inicio *</label>
                    <Input type="date" {...register("startDate")} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha de Fin *</label>
                    <Input type="date" {...register("endDate")} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Modalidad y Turno</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Modalidad *</label>
                    <select {...register("modality")} className="w-full h-10 rounded-md border px-3">
                      {Object.values(Modality).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Turno *</label>
                    <select {...register("shift")} className="w-full h-10 rounded-md border px-3">
                      {Object.values(Shift).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Información de Pagos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("paymentCarnet")} />
                    Incluye pago de carnet
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("credit")} />
                    Pago en cuotas
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium">Costo Carnet</label>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={!paymentCarnet}
                      {...register("carnetCost", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Costo Total *</label>
                    <Input type="number" step="0.01" {...register("totalCost", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pago Inicial</label>
                    <Input type="number" step="0.01" {...register("initialPayment", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descuentos</label>
                    <Input type="number" step="0.01" {...register("discounts", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">N° de Cuotas</label>
                    <Input
                      type="number"
                      min={1}
                      disabled={!credit}
                      {...register("numInstallments", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between font-medium">
                    <span>Saldo Pendiente:</span>
                    <span>S/ {saldo.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Observaciones</h2>
                <div>
                  <label className="text-sm font-medium">Notas Adicionales</label>
                  <Input {...register("notes")} />
                </div>
              </section>

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep("student")}>
                  Volver a Datos del Estudiante
                </Button>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetAll}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Matrícula"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}