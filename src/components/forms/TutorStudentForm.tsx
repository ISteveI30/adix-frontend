"use client";

import { useState, useEffect, useCallback, FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner";

import { TutorService } from "@/api/models/tutor/tutor.api";
import { TutorType } from "@/api/interfaces/enrollment.interface";
import { Tutor } from "@/api/interfaces/tutor.interface";
import { Student } from "@/api/interfaces/student.interface";
import { toast } from "sonner";

const empty = z.literal("");
// Esquema del formulario
const formSchema = z.object({
  tutorId: z.string().optional(),
  dni: z.z.union([empty, z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos")]).optional(),
  firstName: z.string().min(2, "El nombre es obligatorio"),
  lastName: z.string().min(2, "El apellido es obligatorio"),
  email: z.union([empty, z.string().email("Correo inválido")]).optional(),
  phone1: z.union([empty, z.string().min(6, "Teléfono inválido").max(15, "Teléfono inválido")]).optional(),
  phone2: z.string().optional(),
  type: z.nativeEnum(TutorType, { errorMap: () => ({ message: "Tipo de tutor inválido" }) }),
  observation: z.string().optional(),
  studentId: z.string().optional(),
  studentFirstName: z.string().min(2, "El nombre es obligatorio"),
  studentLastName: z.string().min(2, "El apellido es obligatorio"),
  studentEmail: z.union([empty, z.string().email("Correo inválido")]).optional(),
  studentDni: z.union([empty, z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos")]).optional(),
  studentPhone: z.string().optional(),
  studentAddress: z.string().optional(),
  studentSchool: z.string().optional(),
  studentBirthday: z.string().optional(),
});

interface TutorStudentFormProps {
  onSave: (data: { tutor: Tutor; student: Student }) => Promise<void>;
  onCancel?: () => void;
  initialData?: z.infer<typeof formSchema>;
}

interface StudentOption {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  dni?: string;
  phone?: string;
  address?: string;
  school?: string;
  birthday?: string;
}

type FormField = {
  label: string;
  name: string;
  maxlength?: number;
  minLength?: number;
  required?: boolean;
  type?: string;
};

const TutorStudentForm: FC<TutorStudentFormProps> = ({ onSave, initialData, onCancel }: TutorStudentFormProps) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const dni = watch("dni");
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewTutor, setIsNewTutor] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isNewStudent, setIsNewStudent] = useState(false);

  // Campos del formulario organizados para reutilización
  const tutorFields: FormField[] = [
    { label: "DNI", name: "dni", maxlength: 8, required: true },
    { label: "Nombre", name: "firstName", required: true },
    { label: "Apellido", name: "lastName", required: true },
    { label: "Email", name: "email", type: "email" },
    { label: "Teléfono 1", name: "phone1" },
    { label: "Teléfono 2", name: "phone2" },
    { label: "Tipo de Tutor", name: "type" },
    { label: "Observaciones", name: "observation", type: "textarea" },
  ];

  const studentFields: FormField[] = [
    { label: "Nombre", name: "studentFirstName", required: true },
    { label: "Apellido", name: "studentLastName", required: true },
    { label: "Correo", name: "studentEmail" },
    { label: "Dirección", name: "studentAddress" },
    { label: "Teléfono", name: "studentPhone" },
    { label: "DNI Alumno", name: "studentDni", maxlength: 8 },
    { label: "Escuela", name: "studentSchool" },
    { label: "Fecha de Nacimiento", name: "studentBirthday", type: "date" },
  ];

  // Funciones de reset
  const resetTutorData = () => {
    reset({
      ...initialData,
      tutorId: "",
      dni,
      firstName: "",
      lastName: "",
      email: "",
      phone1: "",
      phone2: "",
      observation: "",
    });
  };

  const resetStudentData = () => {
    setValue("studentId", undefined);
    setValue("studentFirstName", "");
    setValue("studentLastName", "");
    setValue("studentEmail", "");
    setValue("studentPhone", "");
    setValue("studentDni", "");
    setValue("studentAddress", "");
    setValue("studentSchool", undefined);
    setValue("studentBirthday", undefined);
  };

  async function fetchTutor() {
    try {
      if (initialData) return
      const { dni } = watch();
      const { available, tutor } = await TutorService.checkDni(dni);

      if (available && !initialData) {
        toast.info("No se encontró el tutor, se puede crear uno nuevo.");

        handleTutorNotFound();
      } else {
        if (!tutor) {
          handleTutorNotFound();
          return;
        }
        setIsNewTutor(false);
        updateTutorForm(tutor!);
        updateStudentOptions(tutor?.students || []);
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      if (!initialData) handleTutorNotFound();
    } finally {
      setLoading(false);
    }
  };

  // Efecto para resetear el formulario cuando cambian los initialData
  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  useEffect(() => {
    if (dni?.length === 8) {
      setLoading(true);
      fetchTutor();
    }
    else {
      resetTutorData();
      setStudents([]);
    }

  }, [dni, initialData, reset]);

  const updateTutorForm = (tutor: Tutor) => {
    setValue("tutorId", tutor.id!);
    setValue("firstName", tutor.firstName);
    setValue("lastName", tutor.lastName);
    setValue("email", tutor.email ?? undefined);
    setValue("phone1", tutor.phone1);
    setValue("phone2", tutor.phone2 ?? "");
    setValue("type", tutor.type as TutorType);
    setValue("observation", tutor.observation ?? "");
  };

  const updateStudentOptions = (studentsList: Student[]) => {
    const studentOptions = studentsList.map((student) => ({
      id: student.id!,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email!,
      phone: student.phone!,
      address: student.address!,
      dni: student.dni!,
      school: student.school!,
      birthday: student.birthday!,
    }));
    setStudents(studentOptions);
  };

  function handleTutorNotFound() {
    resetTutorData();
    setStudents([]);
    setIsNewTutor(true);
  };

  const opt = (v?: string) => (v && v.trim() !== "" ? v.trim() : undefined);
  const nilIfEmpty = (v?: string | null) => {
    const s = (v ?? '').trim();
    return s.length ? s : undefined;
  };

  const handleSave = useCallback(async (formData: z.infer<typeof formSchema>) => {
    const tutor: Tutor = {
      id: formData.tutorId,
      dni: formData.dni,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone1: nilIfEmpty(formData.phone1),
      type: formData.type,
      email: nilIfEmpty(formData.email),
      phone2: formData.phone2,
      observation: formData.observation,
    };

    const student: Student = {
      id: formData.studentId!,
      firstName: formData.studentFirstName,
      lastName: formData.studentLastName,
      email: nilIfEmpty(formData.studentEmail),
      dni: nilIfEmpty(formData.studentDni),
      phone: nilIfEmpty(formData.studentPhone),
      address: nilIfEmpty(formData.studentAddress),
      school: nilIfEmpty(formData.studentSchool),
      tutorId: tutor.id!,
    };

    if (formData.studentBirthday) {
      const date = new Date(formData.studentBirthday);
      student.birthday = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    } else {
      student.birthday = undefined;
    }

    onSave({ tutor, student });
  }, [onSave]);

  const handleStudentChange = (value: string) => {
    if (value === "new-student") {
      setIsNewStudent(true);
      resetStudentData();
    } else {
      setIsNewStudent(false);
      const selectedStudent = students.find(s => s.id === value);
      if (selectedStudent) {
        updateStudentForm(selectedStudent);
      }
    }
  };

  const updateStudentForm = (student: StudentOption) => {
    setValue("studentId", student.id);
    // const [firstName, lastName] = student.name.split(' ');
    setValue("studentFirstName", student.firstName || "");
    setValue("studentLastName", student.lastName || "");
    setValue("studentDni", student.dni || "");
    setValue("studentEmail", student.email || "");
    setValue("studentPhone", student.phone || "");
    setValue("studentSchool", student.school || undefined);
    setValue("studentAddress", student.address || undefined);
    if (student.birthday) {
      const date = new Date(student.birthday);
      student.birthday = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      setValue("studentBirthday", student.birthday || undefined);
    }
  };

  const renderInputField = ({ label, name, required, type = "text" }: FormField) => {
    const isTypeField = name === "type";

    return (
      <div key={name} className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1"></span>}
        </Label>
        {isTypeField ? (
          <Select
            onValueChange={(value: string) => setValue("type", value as TutorType)}
            value={watch("type") ?? ""}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TutorType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={name}
            type={type}
            {...register(name as keyof z.infer<typeof formSchema>)}
            disabled={loading}
            aria-invalid={errors[name as keyof z.infer<typeof formSchema>] ? "true" : "false"}
          />
        )}
        {errors[name as keyof z.infer<typeof formSchema>] && (
          <p className="text-red-500 text-sm" role="alert">
            {errors[name as keyof z.infer<typeof formSchema>]?.message}
          </p>
        )}
      </div>
    );
  };

  const renderStudentSelection = () => {
    if (students.length > 0) {
      return (
        <>
          <div className="space-y-2">
            <Label>Selecciona Estudiante</Label>
            <Select
              onValueChange={handleStudentChange}
              value={isNewStudent ? "new-student" : watch("studentId") || ""}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
                <SelectItem key={"new-student"} value="new-student">
                  + Agregar nuevo estudiante
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(isNewStudent || watch("studentId")) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentFields.map(renderInputField)}
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <Button
            type="button"
            onClick={() => setIsNewStudent(true)}
            variant="outline"
            className="mb-4"
          >
            Agregar Estudiante
          </Button>
          {isNewStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentFields.map(renderInputField)}
            </div>
          )}
        </>
      );
    }
  };

  return (
    <section className="max-w-7xl mx-auto p-4 md:p-6 w-full bg-white rounded-lg">
      <header className="mb-6">
        <h1 className="text-xl font-bold">
          {initialData ? "Editar Información" : "Registrar Tutor y Estudiante"}
        </h1>
      </header>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna 1 - Información del Tutor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isNewTutor ? "Registrar Nuevo Tutor" : "Información del Tutor"}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorFields.map(renderInputField)}
              </CardContent>
            </Card>
          </div>

          {/* Columna 2 - Información del Estudiante */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Estudiante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderStudentSelection()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones */}
        <footer className="flex justify-end gap-4 pt-4 border-t">
          {/* {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )} */}
          <Button
            type="submit"
            className="px-6"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Guardando..." : initialData ? "Ir a datos Academicos" : "Ir a datos Academicos"}
          </Button>
        </footer>
      </form>
    </section>
  );
};

export default TutorStudentForm;