import Link from "next/link";

const cards = [
  {
    title: "Reporte de Pagos",
    description: "Consulta deuda, abonos, pendientes y exporta a Excel.",
    href: "/list/reports/payments",
  },
  {
    title: "Reporte de Asistencias",
    description: "Consulta asistencias, tardanzas, faltas y justificaciones.",
    href: "/list/reports/attendance",
  },
  {
    title: "Reporte de Exámenes",
    description: "Consulta notas, pagos de examen y rendimiento por evaluación.",
    href: "/list/reports/exams",
  },
];

export default function ReportsHomePage() {
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-2xl font-bold mb-6">Centro de Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-xl border p-6 hover:shadow-md transition bg-white cursor-pointer"
          >
            <div className="text-xl font-semibold mb-2">{card.title}</div>
            <div className="text-sm text-gray-600">{card.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}