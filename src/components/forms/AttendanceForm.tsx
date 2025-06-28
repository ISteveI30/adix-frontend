"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Attendance, StatusAttendance } from "@/api/interfaces/attendance.interface";
import { StudentAttendance } from "@/api/interfaces/student.interface";
import { StudentService } from "@/api/models/student/students.api";
import { toast } from "sonner";
import Swal from "sweetalert2";


const formSchema = z.object({
  dni: z
    .string()
    .length(8, "El DNI debe tener exactamente 8 caracteres"),
});
type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormProps {
  onSave: (attendance: Attendance) => Promise<Attendance>;
}

const AttendanceForm: FC<AttendanceFormProps> = ({ onSave }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { dni: "" },
  });

  const dni = watch("dni");
  const [student, setStudent] = useState<StudentAttendance | null>(null);
  const [entryTime, setEntryTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const lastEnroll = student?.enrollments?.[0];


  const fetchStudentByDni = useCallback(async () => {
    setLoading(true);
    try {
      const stu = await StudentService.getStudentByDni(dni);
      if (!stu || !stu.id) {
        toast.error("Alumno no encontrado");
        setStudent(null);
      } else {
        setStudent(stu);
        setEntryTime(
          new Date().toLocaleTimeString("es-PE", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Alumno no encontrado");//el toast es para los mensaje de alerta en la pantalla
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [dni]);

  //busqueda cuando el DNI tenga 8 dígitos
  useEffect(() => {
    if (dni.length === 8) {
      fetchStudentByDni();
    } else {
      setStudent(null);
      setEntryTime("");
    }
  }, [dni, fetchStudentByDni]);

  //guardar el formulario
  const onSubmit = useCallback(async () => {
    if (!student || !student.id) {
      toast.error("Busca primero al alumno");
      return;
    }
    const now = new Date();
    const peruDateStr = now.toLocaleString('en-US', { timeZone: 'America/Lima' });
    const peruDate = new Date(peruDateStr);
    const hour = peruDate.getHours();

    const offsetMs = now.getTimezoneOffset() * 60_000;
    const localIso = new Date(now.getTime() - offsetMs).toISOString();


    let status: StatusAttendance;
    if (hour >= 7 && hour < 9) {
      status = StatusAttendance.ASISTIO;
    } else if (hour < 13) {
      status = StatusAttendance.TARDANZA;
    } else if (hour >= 13 && hour < 15) {
      status = StatusAttendance.ASISTIO;
    } else if (hour <= 20) {
      status = StatusAttendance.TARDANZA;
    } else {
      status = StatusAttendance.FALTA;
    }
    //console.log(hour)
    const attendance: Attendance = {
      studentId: student.id,
      date: localIso.toString(),
      present: status !== StatusAttendance.FALTA,
      status,
    };
    try {
      await onSave(attendance);
      Swal.fire({
        icon: "success",
        title: "Asistencia registrada",
        text: "La asistencia del alumno fue registrada correctamente.",
        confirmButtonColor: "#2563EB",
      });

      reset();
      setStudent(null);
      setEntryTime("");
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al registrar la asistencia.",
      });
    }
  }, [onSave, student, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* DNI y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dni">Ingrese DNI del alumno</Label>
          <Input
            id="dni"
            {...register("dni")}
            maxLength={8}
            disabled={loading || isSubmitting}
            className="mt-1"
          />
          {errors.dni && (
            <p className="text-red-500 text-sm">{errors.dni.message}</p>
          )}
        </div>
        <div>
          <Label>Hora de entrada</Label>
          <Input value={entryTime} readOnly className="mt-1 bg-gray-100" />
        </div>
      </div>

      {/* Nombre completo */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Alumno</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Nombre completo</Label>
          <Input
            value={student ? `${student.firstName} ${student.lastName}` : ""}
            readOnly
            className="mt-1 bg-gray-100"
          />
          <br></br>
          <Label>Ciclo</Label>
          <Input
            value={lastEnroll ? `${lastEnroll.cycle.name} - ${lastEnroll.admission.name}` : ""}
            readOnly
            className="mt-1 bg-gray-100"
          />
        </CardContent>
      </Card>

      {/* Botón Registrar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!student || isSubmitting}>
          {isSubmitting ? "Registrando…" : "Registrar Asistencia"}
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
 