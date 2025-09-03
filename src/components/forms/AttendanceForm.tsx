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

import { useDebouncedCallback } from "use-debounce";
import { Loader2, Search as SearchIcon, XCircle } from "lucide-react";

const formSchema = z.object({
  dni: z.string().length(8, "El DNI debe tener exactamente 8 caracteres"),
});
type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormProps {
  onSave: (attendance: Attendance) => Promise<Attendance>;
}

const WAIT_BETWEEN_CHANGE = 300;

const AttendanceForm: FC<AttendanceFormProps> = ({ onSave }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { dni: "" },
  });

  // ---- estados
  const dni = watch("dni");
  const [student, setStudent] = useState<StudentAttendance | null>(null);
  const [entryTime, setEntryTime] = useState<string>("");

  // búsqueda por nombre
  const [nameQuery, setNameQuery] = useState<string>("");
  const [nameLoading, setNameLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<StudentAttendance[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const lastEnroll = student?.enrollments?.[0];

  // ---- BUSCAR POR DNI (auto al tener 8 dígitos)
  const fetchStudentByDni = useCallback(async () => {
    if (!dni || dni.length !== 8) return;
    try {
      const stu = await StudentService.getStudentByDni(dni);
      if (!stu || !stu.id) {
        toast.error("Alumno no encontrado");
        setStudent(null);
        setEntryTime("");
      } else {
        setStudent(stu);
        setEntryTime(
          new Date().toLocaleTimeString("es-PE", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        );
        // Limpia búsqueda por nombre si llega por DNI
        setNameQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Alumno no encontrado");
      setStudent(null);
      setEntryTime("");
    }
  }, [dni]);

  useEffect(() => {
    if (dni.length === 8) {
      fetchStudentByDni();
    } else {
      // si borra el DNI, no borramos lo elegido por nombre a menos que también borre nameQuery
      if (!nameQuery) {
        setStudent(null);
        setEntryTime("");
      }
    }
  }, [dni, fetchStudentByDni, nameQuery]);

  // ---- BUSCAR POR NOMBRE (debounce + sugerencias)
  const debouncedSearchByName = useDebouncedCallback(async (value: string) => {
    const v = value?.trim();
    if (!v || v.length < 3) {
      setSuggestions([]);
      setNameLoading(false);
      setShowSuggestions(false);
      return;
    }
    try {
      setNameLoading(true);
      const results = await StudentService.getStudentByNameFull(v); // <- ahora siempre []
      // Autoselecciona si hay 1 resultado
      if (results.length === 1) {
        handlePickSuggestion(results[0]);
        return;
      }
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setNameLoading(false);
    }
  }, WAIT_BETWEEN_CHANGE);

  const handleNameChange = (value: string) => {
    setNameQuery(value);
    setShowSuggestions(true);
    setNameLoading(true);
    debouncedSearchByName(value);

    // si escribe nombre, limpiamos el DNI (para que la validación no moleste)
    if (dni) setValue("dni", "");
  };

  // seleccionar una sugerencia -> rellena todo
  const handlePickSuggestion = (s: StudentAttendance) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setNameQuery(`${s.firstName} ${s.lastName}`);
    setValue("dni", s.dni ?? ""); // para pasar zod y mantener tu submit intacto
    setStudent(s);
    setEntryTime(
      new Date().toLocaleTimeString("es-PE", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    );
  };

  // ---- REGISTRAR (SIN CAMBIOS)
  const onSubmit = useCallback(async () => {
    if (!student || !student.id) {
      toast.error("Busca primero al alumno");
      return;
    }
    const now = new Date();
    const peruDateStr = now.toLocaleString("en-US", { timeZone: "America/Lima" });
    const peruDate = new Date(peruDateStr);
    const hour = peruDate.getHours();

    const offsetMs = now.getTimezoneOffset() * 60_000;
    const localIso = new Date(now.getTime() - offsetMs).toISOString();

    let status: StatusAttendance;
    if (hour >= 7 && hour < 9) status = StatusAttendance.ASISTIO;
    else if (hour < 13) status = StatusAttendance.TARDANZA;
    else if (hour >= 13 && hour < 15) status = StatusAttendance.ASISTIO;
    else if (hour <= 20) status = StatusAttendance.TARDANZA;
    else status = StatusAttendance.FALTA;

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

      reset({ dni: "" });
      setStudent(null);
      setEntryTime("");
      setNameQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al registrar la asistencia." });
    }
  }, [onSave, student, reset]);

  // limpiar
  const handleClear = () => {
    reset({ dni: "" });
    setStudent(null);
    setEntryTime("");
    setNameQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Título + acciones de cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline">Editar horarios</Button>
          <Button type="button" variant="outline">Justificar tardanzas</Button>
        </div>
      </div>
      {/*<div className="h-px w-full bg-gray-200" />*/}

      {/* Buscadores y limpiar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        {/* Buscar por DNI */}
        <div className="relative">
          <Label htmlFor="dni">Buscar por DNI</Label>
          <Input
            id="dni"
            {...register("dni")}
            maxLength={8}
            className="mt-1"
            autoComplete="off"
            placeholder="Ej. 70123456"
          />
          {errors.dni && dni.length > 0 && (
            <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>
          )}
        </div>

        {/* Buscar por nombre */}
        <div className="relative">
          <Label>Buscar por nombre</Label>
          <div className="mt-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={nameQuery}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="pl-9"
              autoComplete="off"
              onFocus={() => nameQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) {
                  e.preventDefault();
                  handlePickSuggestion(suggestions[0]);
                }
              }}
            />
            {nameLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-white shadow">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => handlePickSuggestion(s)}
                  >
                    <span className="font-medium">{s.firstName} {s.lastName}</span>
                    <span className="text-gray-500"> · DNI: {s.dni ?? "—"}</span>
                    {s.enrollments?.[0] && (
                      <span className="text-gray-500"> · {s.enrollments[0].cycle?.name} - {s.enrollments[0].admission?.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón Limpiar */}
        <div className="flex md:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="gap-2"
            disabled={isSubmitting}
            title="Limpiar campos y resultados"
          >
            <XCircle className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Datos del alumno */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del alumno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nombre completo</Label>
            <Input
              value={student ? `${student.firstName} ${student.lastName}` : ""}
              readOnly
              className="mt-1 bg-gray-100"
            />
          </div>
          <div>
            <Label>Hora de entrada</Label>
            <Input value={entryTime} readOnly className="mt-1 bg-gray-100" />
          </div>
          <div className="md:col-span-2">
            <Label>Ciclo</Label>
            <Input
              value={
                lastEnroll ? `${lastEnroll.cycle?.name ?? ""} - ${lastEnroll.admission?.name ?? ""}` : ""
              }
              readOnly
              className="mt-1 bg-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-center md:justify-end">
        <Button type="submit" disabled={!student || isSubmitting}>
          {isSubmitting ? "Registrando…" : "Registrar asistencia"}
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
