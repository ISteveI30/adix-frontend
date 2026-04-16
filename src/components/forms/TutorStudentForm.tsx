"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { TutorType } from "@/api/interfaces/enrollment.interface";
import { Tutor } from "@/api/interfaces/tutor.interface";
import { Student } from "@/api/interfaces/student.interface";
import { TutorService } from "@/api/models/tutor/tutor.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type FormValues = {
  tutorId?: string;
  dni?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  type: TutorType;
  observation?: string;
  otherFirstName?: string;
  otherLastName?: string;
  otherPhone?: string;

  studentId?: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentDni?: string;
  studentAddress?: string;
  studentSchool?: string;
  studentBirthday: string;
};

interface TutorStudentFormProps {
  onSave: (data: { tutor: Tutor; student: Student }) => Promise<void> | void;
  initialData?: Partial<FormValues>;
  onCancel?: () => void;
}

export default function TutorStudentForm({
  onSave,
  initialData,
  onCancel,
}: TutorStudentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      type: TutorType.PADRE,
      ...initialData,
    },
  });

  const [students, setStudents] = useState<Student[]>([]);
  const tutorDni = watch("dni");
  const selectedStudentId = watch("studentId");

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!tutorDni || tutorDni.trim().length < 8) return;

      try {
        const response = await TutorService.checkDni(tutorDni.trim());
        if (!response.available && response.tutor) {
          const tutor = response.tutor;
          toast.success("Tutor encontrado. Se autocompletaron sus datos.");

          setValue("tutorId", tutor.id);
          setValue("firstName", tutor.firstName);
          setValue("lastName", tutor.lastName);
          setValue("email", tutor.email || "");
          setValue("phone1", tutor.phone1 || "");
          setValue("phone2", tutor.phone2 || "");
          setValue("type", tutor.type as TutorType);
          setValue("observation", tutor.observation || "");
          setValue("otherFirstName", tutor.otherFirstName || "");
          setValue("otherLastName", tutor.otherLastName || "");
          setValue("otherPhone", tutor.otherPhone || "");

          setStudents(tutor.students || []);
        } else {
          setValue("tutorId", undefined);
          setStudents([]);
        }
      } catch {
        setStudents([]);
      }
    };

    fetchTutor();
  }, [tutorDni, setValue]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setValue("studentFirstName", student.firstName);
    setValue("studentLastName", student.lastName);
    setValue("studentEmail", student.email || "");
    setValue("studentPhone", student.phone || "");
    setValue("studentDni", student.dni || "");
    setValue("studentAddress", student.address || "");
    setValue("studentSchool", student.school || "");
    setValue(
      "studentBirthday",
      student.birthday ? new Date(student.birthday).toISOString().slice(0, 10) : "",
    );
  }, [selectedStudentId, students, setValue]);

  const hasExistingStudents = useMemo(() => students.length > 0, [students]);

  const submit = async (values: FormValues) => {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      toast.error("Los nombres y apellidos del tutor son obligatorios");
      return;
    }

    if (!values.type) {
      toast.error("Debes seleccionar el tipo de tutor");
      return;
    }

    if (!values.studentFirstName.trim() || !values.studentLastName.trim()) {
      toast.error("Los nombres y apellidos del estudiante son obligatorios");
      return;
    }

    if (!values.studentBirthday) {
      toast.error("La fecha de nacimiento del estudiante es obligatoria");
      return;
    }

    const tutor = {
      ...(values.tutorId ? { id: values.tutorId } : {}),
      dni: values.dni?.trim() || undefined,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email?.trim() || undefined,
      phone1: values.phone1?.trim() || undefined,
      phone2: values.phone2?.trim() || undefined,
      type: values.type,
      observation: values.observation?.trim() || undefined,
      otherFirstName: values.otherFirstName?.trim() || undefined,
      otherLastName: values.otherLastName?.trim() || undefined,
      otherPhone: values.otherPhone?.trim() || undefined,
    } as Tutor;

    const student: Student = {
      id: values.studentId,
      firstName: values.studentFirstName.trim(),
      lastName: values.studentLastName.trim(),
      dni: values.studentDni?.trim() || undefined,
      email: values.studentEmail?.trim() || undefined,
      phone: values.studentPhone?.trim() || undefined,
      address: values.studentAddress?.trim() || undefined,
      school: values.studentSchool?.trim() || undefined,
      birthday: values.studentBirthday,
      tutorId: values.tutorId || "",
    };

    await onSave({ tutor, student });
  };

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="text-lg font-semibold">Información del Tutor</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">DNI</label>
                <Input {...register("dni")} maxLength={12} />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Tutor *</label>
                <select
                  {...register("type")}
                  className="w-full h-10 rounded-md border px-3"
                >
                  <option value={TutorType.PADRE}>PADRE</option>
                  <option value={TutorType.MADRE}>MADRE</option>
                  <option value={TutorType.TUTOR}>TUTOR</option>
                  <option value={TutorType.PADREMADRE}>PADRE/MADRE</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <Input {...register("firstName")} />
              </div>
              <div>
                <label className="text-sm font-medium">Apellido *</label>
                <Input {...register("lastName")} />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono 1</label>
                <Input {...register("phone1")} />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono 2</label>
                <Input {...register("phone2")} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Correo</label>
                <Input {...register("email")} type="email" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Observaciones</label>
                <Input {...register("observation")} />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre Familiar Encargado</label>
                <Input {...register("otherFirstName")} />
              </div>
              <div>
                <label className="text-sm font-medium">Apellido Familiar Encargado</label>
                <Input {...register("otherLastName")} />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono Familiar Encargado</label>
                <Input {...register("otherPhone")} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="text-lg font-semibold">Información del Estudiante</h3>

            {hasExistingStudents && (
              <div>
                <label className="text-sm font-medium">Seleccionar estudiante existente</label>
                <select
                  {...register("studentId")}
                  className="w-full h-10 rounded-md border px-3"
                >
                  <option value="">-- Crear / editar manualmente --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <Input {...register("studentFirstName")} />
              </div>
              <div>
                <label className="text-sm font-medium">Apellido *</label>
                <Input {...register("studentLastName")} />
              </div>
              <div>
                <label className="text-sm font-medium">DNI</label>
                <Input {...register("studentDni")} maxLength={12} />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input {...register("studentPhone")} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Correo</label>
                <Input {...register("studentEmail")} type="email" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input {...register("studentAddress")} />
              </div>
              <div>
                <label className="text-sm font-medium">Escuela</label>
                <Input {...register("studentSchool")} />
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Nacimiento *</label>
                <Input {...register("studentBirthday")} type="date" />
              </div>
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-4 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="px-6" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Ir a datos Académicos"}
          </Button>
        </footer>
      </form>
    </section>
  );
}