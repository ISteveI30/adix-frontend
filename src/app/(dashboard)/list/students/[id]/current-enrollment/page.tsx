import { StudentService } from "@/api/models/student/students.api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CurrentEnrollmentPage({ params }: PageProps) {
  const { id } = await params;
  const student = await StudentService.getStudentById(id);
  const latestEnrollment = student.enrollments?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Matrícula actual del alumno</h1>
          <Link href="/list/students">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>

        <div className="p-6 space-y-6">
          <section className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Datos del alumno</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p>
                <b>Alumno:</b> {student.firstName} {student.lastName}
              </p>
              <p>
                <b>DNI:</b> {student.dni || "No registrado"}
              </p>
              <p>
                <b>Tutor:</b> {student.tutor?.firstName || ""} {student.tutor?.lastName || ""}
              </p>
              <p>
                <b>Teléfono:</b> {student.phone || "No registrado"}
              </p>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Última matrícula</h2>

            {latestEnrollment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p>
                  <b>Código de alumno:</b> {latestEnrollment.codeStudent || "No registrado"}
                </p>
                <p>
                  <b>Ciclo:</b> {latestEnrollment.cycle?.name || "No registrado"}
                </p>
                <p>
                  <b>Carrera:</b> {latestEnrollment.career?.name || "No registrado"}
                </p>
                <p>
                  <b>Admisión:</b> {latestEnrollment.admission?.name || "No registrado"}
                </p>
                <p>
                  <b>Fecha de inicio:</b>{" "}
                  {latestEnrollment.startDate
                    ? new Date(latestEnrollment.startDate).toLocaleDateString()
                    : "No registrado"}
                </p>
                <p>
                  <b>Fecha de fin:</b>{" "}
                  {latestEnrollment.endDate
                    ? new Date(latestEnrollment.endDate).toLocaleDateString()
                    : "No registrado"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Este alumno no tiene matrícula registrada.</p>
            )}
          </section>

          {latestEnrollment?.accountReceivables?.length ? (
            <section className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-3">Estado financiero de la última matrícula</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-2">Concepto</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Pendiente</th>
                      <th className="text-left p-2">Vencimiento</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestEnrollment.accountReceivables.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="p-2">{row.concept || "-"}</td>
                        <td className="p-2">S/ {Number(row.totalAmount).toFixed(2)}</td>
                        <td className="p-2">S/ {Number(row.pendingBalance).toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(row.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}