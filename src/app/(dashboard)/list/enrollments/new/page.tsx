"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import TutorStudentForm from "@/components/forms/TutorStudentForm"

// Services and types
import { EnrollmentService } from "@/api/models/enrollment/enrollment.api"
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api"
import { MasterService } from "@/api/models/masters/masters"
import { CreateEnrollmentDto, Modality, Shift } from "@/api/interfaces/enrollment.interface"
import { Area } from "@/api/interfaces/area.interface"
import { Career } from "@/api/interfaces/career.interface"
import { Cycle } from "@/api/interfaces/cycle.interface"
import { Admission } from "@/api/interfaces/admission.interface"
import { Tutor } from "@/api/interfaces/tutor.interface"
import { Student } from "@/api/interfaces/student.interface"
import { TutorService } from "@/api/models/tutor/tutor.api"
import { StudentService } from "@/api/models/student/students.api"
import { formatCurrency } from "@/lib/utils"
import { useTutorStudentStore } from "@/store/tutorStudentStore"

// Validation schema with improved error messages
const enrollmentSchema = z.object({
  areaId: z.string().min(1, "Seleccione un área"),
  careerId: z.string().min(1, "Seleccione una carrera"),
  admissionId: z.string().min(1, "Seleccione una admisión"),
  cycleId: z.string().min(1, "Seleccione un ciclo"),
  startDate: z.string().min(1, "Ingrese fecha de inicio"),
  endDate: z.string().min(1, "Ingrese fecha de fin"),
  modality: z.nativeEnum(Modality),
  shift: z.nativeEnum(Shift),
  credit: z.boolean().default(false),
  numInstallments: z.coerce
    .number()
    .min(1, "Mínimo 1 cuota")
    .max(12, "Máximo 12 cuotas")
    .default(1),
  paymentCarnet: z.boolean().default(false),
  carnetCost: z.coerce
    .number()
    .min(0, "El costo no puede ser negativo")
    .default(0),
  totalCost: z.coerce
    .number()
    .min(1, "El costo total es requerido")
    .default(0),
  initialPayment: z.coerce
    .number()
    .min(0, "El pago no puede ser negativo")
    .default(0),
  discounts: z.coerce
    .number()
    .min(0, "El descuento no puede ser negativo")
    .default(0),
  notes: z.string().max(500, "Máximo 500 caracteres").optional(),
}).refine(data => {
  // Validate that end date is after start date
  if (!data.startDate || !data.endDate) return true
  return new Date(data.endDate) >= new Date(data.startDate)
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"]
}).refine(data => {
  // Validate that initial payment + discounts doesn't exceed total cost
  return (data.initialPayment + data.discounts) <= data.totalCost
}, {
  message: "La suma del pago inicial y descuentos no puede exceder el costo total",
  path: ["initialPayment"]
})

type EnrollmentFormInputs = z.infer<typeof enrollmentSchema>

interface EnrollmentFormData {
  tutor?: Tutor | null
  student?: Student | null
  academic?: Partial<EnrollmentFormInputs> | null
}

export default function EnrollmentForm() {
  const {
    tutorStudentData,
    studentId,
    setTutorStudentData,
    setStudentId,
    reset: resetStore
  } = useTutorStudentStore();

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<EnrollmentFormInputs>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      modality: Modality.PRESENCIAL,
      shift: Shift.MANANA,
      credit: false,
      paymentCarnet: false,
      numInstallments: 1,
      carnetCost: 0,
      totalCost: 0,
      initialPayment: 0,
      discounts: 0
    },
    mode: "onChange"
  })

  // Component state
  const [areas, setAreas] = useState<Area[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [formStep, setFormStep] = useState<"student" | "academic">("student")
  const [initialData, setInitialData] = useState<EnrollmentFormData | null>(null)

  // Watched values
  const selectedArea = watch("areaId")
  const creditEnabled = watch("credit")
  const carnetPaid = watch("paymentCarnet")
  const totalCost = watch("totalCost")
  const initialPayment = watch("initialPayment")
  const discounts = watch("discounts")

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [areasData, cyclesData, admissionsData] = await Promise.all([
          getAreas(),
          MasterService.getCycles(),
          MasterService.getAdmissions()
        ])

        setAreas(areasData)
        setCycles(cyclesData)
        setAdmissions(admissionsData)

        // Load careers if area is preselected
        if (initialData?.academic?.areaId) {
          const careersData = await getCareersByArea(initialData.academic.areaId)
          setCareers(careersData)
        }

        // Set student if exists
        if (initialData?.student?.id) {
          setStudentId(initialData.student.id)
          setFormStep("academic")
          setTutorStudentData({
            tutor: initialData.tutor!,
            student: initialData.student!
          })
        }
        // Set initial values if provided
        if (initialData?.academic) {
          reset({
            ...initialData.academic,
            areaId: initialData.academic.areaId || "",
            careerId: initialData.academic.careerId || "",
            admissionId: initialData.academic.admissionId || "",
            cycleId: initialData.academic.cycleId || "",
          })
        }
        setInitialData(initialData)
      } catch (error) {
        toast.error("Error al cargar datos iniciales")
        console.error("Error loading initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [initialData])

  // Load careers when area changes
  useEffect(() => {
    if (!selectedArea) {
      setCareers([])
      setValue("careerId", "")
      return
    }

    const loadCareers = async () => {
      try {
        const careersData = await getCareersByArea(selectedArea)
        setCareers(careersData)
      } catch (error) {
        toast.error("Error al cargar carreras")
        console.error("Error loading careers:", error)
      }
    }

    loadCareers()
  }, [selectedArea, setValue])

  const ensureStudentExists = async (): Promise<string | undefined> => {
    if (studentId && tutorStudentData) {
      return studentId;
    }

    if (!tutorStudentData) {
      toast.error("No hay datos del tutor/estudiante para guardar");
      return undefined;
    }

    try {
      let savedTutor = tutorStudentData.tutor;
      if (!savedTutor.id) {
        // console.log("Guardando nuevo tutor:", savedTutor);
        const { id, ...tutorData} = savedTutor;
        // console.log("Datos del tutor a guardar:", tutorData);
        // Guardar el tutor y obtener el ID
        savedTutor = await TutorService.saveTutor(tutorData);
        if (!savedTutor.id) throw new Error("No se pudo obtener el ID del tutor");
      } else {
        await TutorService.updateTutor(savedTutor);
      }

      const savedStudent = await StudentService.saveStudent({
        ...tutorStudentData.student,
        tutorId: savedTutor.id
      });

      if (!savedStudent.id) throw new Error("No se pudo obtener el ID del estudiante");

      setStudentId(savedStudent.id);
      return savedStudent.id;
    } catch (error) {
      console.error("Error al guardar tutor/estudiante:", error);
      throw error;
    }
  };

  const prepareEnrollmentData = (
    formData: EnrollmentFormInputs,
    studentId: string
  ): CreateEnrollmentDto => {
    const { areaId, ...dataEnrollment } = formData;
    return {
      ...dataEnrollment,
      studentId
    };
  };

  const handleSubmissionError = (error: unknown) => {
    console.error("Error en el proceso completo:", error);

    let errorMessage = "Error al procesar la solicitud";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toast.error(errorMessage);
  };

  // Reset form
  const resetForm = () => {
    reset();
    resetStore();
    setFormStep("student");
  };

  // Handle tutor/student data save
  const handleTutorStudentSave = async (data: { tutor: Tutor; student: Student }) => {
    try {
      setTutorStudentData(data)
      setStudentId(data.student.id!)

      if (data.tutor.id) await TutorService.updateTutor(data.tutor)
      if (data.student.id) await StudentService.updateStudent(data.student);

      setFormStep("academic")
    } catch (error) {
      toast.error("Error al guardar datos del estudiante")
      console.error("Error saving student data:", error)
    }
  }

  // Calculate balance
  const calculateBalance = () => {
    return totalCost - initialPayment - discounts
  }

  const showData = (data: { tutor: Tutor; student: Student }) => {
    return {
      tutorId: data.tutor.id!,
      dni: data.tutor.dni,
      firstName: data.tutor.firstName,
      lastName: data.tutor.lastName,
      email: data.tutor.email,
      phone1: data.tutor.phone1,
      phone2: data.tutor.phone2,
      type: data.tutor.type,
      observation: data.tutor.observation,

      studentId: data.student.id!,
      studentFirstName: data.student.firstName,
      studentLastName: data.student.lastName,
      studentEmail: data.student.email,
      studentPhone: data.student.phone,
      studentAddress: data.student.address,
      studentSchool: data.student.school,
      studentBirthday: data.student.birthday,
    }
  }

  const onSubmit = async (formData: EnrollmentFormInputs) => {
    try {
      const studentIdToUse = await ensureStudentExists();
      if (!studentIdToUse) {
        throw new Error("ID de estudiante no disponible");
      }

      const enrollmentData = prepareEnrollmentData(formData, studentIdToUse);
      await EnrollmentService.createEnrollment(enrollmentData);
      toast.success("Matrícula registrada exitosamente");

      resetForm();
    } catch (error: unknown) {
      handleSubmissionError(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-primary">
            Registro de Matrícula
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Form steps indicator */}
          <div className="flex mb-6">
            <button
              type="button"
              className={`flex-1 py-2 font-medium ${formStep === "student" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              onClick={() => setFormStep("student")}
            >
              Datos del Estudiante
            </button>
            <button
              type="button"
              className={`flex-1 py-2 font-medium ${formStep === "academic" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              onClick={() => studentId && setFormStep("academic")}
              disabled={!studentId}
            >
              Información Académica
            </button>
          </div>
          {formStep === "student" ? (
            <div className="space-y-2">
              <TutorStudentForm
                onSave={handleTutorStudentSave}
                initialData={tutorStudentData ? showData(tutorStudentData) : undefined}
                onCancel={() => resetForm()}
              />
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetForm()} // O cualquier otra acción de cancelación
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Mostrar resumen de datos del estudiante */}
              {tutorStudentData && (
                <section className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Datos del Estudiante</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><span className="font-medium">Estudiante:</span> {tutorStudentData.student.firstName} {tutorStudentData.student.lastName}</p>
                    <p><span className="font-medium">Email:</span> {tutorStudentData.student.email! || 'No registrado'}</p>
                    <p><span className="font-medium">Tutor:</span> {tutorStudentData.tutor.dni} - {tutorStudentData.tutor.firstName} {tutorStudentData.tutor.lastName}</p>
                    <p><span className="font-medium">Teléfono Tutor:</span> {tutorStudentData.tutor.phone1}</p>
                  </div>
                </section>
              )}

              {/* Academic Program Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Programa Académico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Area */}
                  <div className="space-y-2">
                    <Label>Área*</Label>
                    <Select
                      value={watch("areaId")}
                      onValueChange={(value) => {
                        setValue("areaId", value)
                        setValue("careerId", "")
                        trigger("areaId")
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.areaId && (
                      <p className="text-sm text-destructive">{errors.areaId.message}</p>
                    )}
                  </div>

                  {/* Career */}
                  <div className="space-y-2">
                    <Label>Carrera*</Label>
                    <Select
                      value={watch("careerId")}
                      onValueChange={(value) => {
                        setValue("careerId", value)
                        trigger("careerId")
                      }}
                      disabled={!selectedArea || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        {careers.map((career) => (
                          <SelectItem key={career.id} value={career.id}>
                            {career.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.careerId && (
                      <p className="text-sm text-destructive">{errors.careerId.message}</p>
                    )}
                  </div>

                  {/* Cycle */}
                  <div className="space-y-2">
                    <Label>Ciclo*</Label>
                    <Select
                      value={watch("cycleId")}
                      onValueChange={(value) => {
                        setValue("cycleId", value)
                        trigger("cycleId")
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles.map((cycle) => (
                          <SelectItem key={cycle.id} value={cycle.id}>
                            {cycle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cycleId && (
                      <p className="text-sm text-destructive">{errors.cycleId.message}</p>
                    )}
                  </div>

                  {/* Admission */}
                  <div className="space-y-2">
                    <Label>Admisión*</Label>
                    <Select
                      value={watch("admissionId")}
                      onValueChange={(value) => {
                        setValue("admissionId", value)
                        trigger("admissionId")
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione admisión" />
                      </SelectTrigger>
                      <SelectContent>
                        {admissions.map((admission) => (
                          <SelectItem key={admission.id} value={admission.id}>
                            {admission.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.admissionId && (
                      <p className="text-sm text-destructive">{errors.admissionId.message}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Academic Period Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Período Académico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio*</Label>
                    <Input
                      type="date"
                      {...register("startDate", {
                        onChange: () => trigger("endDate")
                      })}
                      className={errors.startDate ? "border-destructive" : ""}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-destructive">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Fin*</Label>
                    <Input
                      type="date"
                      {...register("endDate")}
                      className={errors.endDate ? "border-destructive" : ""}
                      min={watch("startDate")}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Modality Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Modalidad y Turno</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modalidad*</Label>
                    <Select
                      value={watch("modality")}
                      onValueChange={(value) => setValue("modality", value as Modality)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Modality).map((mod) => (
                          <SelectItem key={mod} value={mod}>
                            {mod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Turno*</Label>
                    <Select
                      value={watch("shift")}
                      onValueChange={(value) => setValue("shift", value as Shift)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione turno" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Shift).map((shift) => (
                          <SelectItem key={shift} value={shift}>
                            {shift}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Información de Pagos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paymentCarnet"
                      checked={carnetPaid}
                      onCheckedChange={(checked) => {
                        setValue("paymentCarnet", !!checked)
                        if (!checked) setValue("carnetCost", 0)
                      }}
                    />
                    <Label htmlFor="paymentCarnet">Incluye pago de carnet</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="credit"
                      checked={creditEnabled}
                      onCheckedChange={(checked) => {
                        setValue("credit", !!checked)
                        if (!checked) setValue("numInstallments", 1)
                      }}
                    />
                    <Label htmlFor="credit">Pago en cuotas</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {carnetPaid && (
                    <div className="space-y-2">
                      <Label>Costo Carnet</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("carnetCost", {
                          valueAsNumber: true,
                          onChange: () => trigger()
                        })}
                        className={errors.carnetCost ? "border-destructive" : ""}
                      />
                      {errors.carnetCost && (
                        <p className="text-sm text-destructive">{errors.carnetCost.message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Costo Total*</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("totalCost", {
                        valueAsNumber: true,
                        onChange: () => trigger()
                      })}
                      className={errors.totalCost ? "border-destructive" : ""}
                    />
                    {errors.totalCost && (
                      <p className="text-sm text-destructive">{errors.totalCost.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Pago Inicial</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("initialPayment", {
                        valueAsNumber: true,
                        onChange: () => trigger()
                      })}
                      className={errors.initialPayment ? "border-destructive" : ""}
                    />
                    {errors.initialPayment && (
                      <p className="text-sm text-destructive">{errors.initialPayment.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Descuentos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("discounts", {
                        valueAsNumber: true,
                        onChange: () => trigger()
                      })}
                      className={errors.discounts ? "border-destructive" : ""}
                    />
                    {errors.discounts && (
                      <p className="text-sm text-destructive">{errors.discounts.message}</p>
                    )}
                  </div>
                </div>

                {creditEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>N° de Cuotas*</Label>
                      <Input
                        type="number"
                        {...register("numInstallments", {
                          valueAsNumber: true,
                          onChange: () => trigger()
                        })}
                        className={errors.numInstallments ? "border-destructive" : ""}
                      />
                      {errors.numInstallments && (
                        <p className="text-sm text-destructive">{errors.numInstallments.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between font-medium">
                    <span>Saldo Pendiente:</span>
                    <span>{formatCurrency(calculateBalance())}</span>
                  </div>
                </div>
              </section>

              {/* Notes Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Observaciones</h2>
                <div className="space-y-2">
                  <Label>Notas Adicionales</Label>
                  <Input
                    {...register("notes")}
                    placeholder="Ingrese observaciones adicionales"
                    className={errors.notes ? "border-destructive" : ""}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">{errors.notes.message}</p>
                  )}
                </div>

              </section>
              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormStep("student")}
                >
                  Volver a Datos del Estudiante
                </Button>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Guardar Matrícula"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>

      </Card>
    </div >
  )
}