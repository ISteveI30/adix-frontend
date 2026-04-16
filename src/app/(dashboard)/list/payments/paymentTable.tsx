"use client";

import { PaymentAnulateDto, PaymentDto } from "@/api/interfaces/payment.interface";
import { PaymentService } from "@/api/models/payment/payment.api";
import PaymentStatus from "@/components/customs/status";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { PencilIcon, PrinterIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const columns: ColumnDefinition<PaymentDto & { concept?: string }>[] = [
  { header: "Estado de Pago", accessor: "status" },
  { header: "Concepto", accessor: "concept", className: "hidden md:table-cell" },
  { header: "Número de Recibo", accessor: "invoiceNumber", className: "hidden md:table-cell" },
  { header: "Monto Pagado", accessor: "amountPaid", className: "hidden md:table-cell" },
  { header: "Fecha de Pago", accessor: "paymentDate", className: "hidden md:table-cell" },
  { header: "Método de Pago", accessor: "paymentMethod", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function PaymentTable({ enrollmentId }: { enrollmentId: string }) {
  const [dataPayment, setDataPayment] = useState<(PaymentDto & { concept?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PaymentService.getPaymentsByEnrollmentId(enrollmentId);
      setDataPayment(
        data.map((item) => ({
          ...item,
          concept: item.accountReceivable?.concept || "-",
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [enrollmentId]);

  async function handleDelete(idPayment: string) {
    const payment = await PaymentService.getPaymentById(idPayment);

    if (payment.status === "ANULADO") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El pago ya ha sido anulado.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "Se anulará el pago y se devolverá el saldo a la cuenta por cobrar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
    });

    if (!result.isConfirmed) return;

    const response: PaymentAnulateDto = await PaymentService.cancelPayment(idPayment);

    if (response.success === false) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al anular el pago.",
      });
      return;
    }

    Swal.fire("¡Anulado!", `${response.message}`, "success");
    await loadData();
    router.refresh();
  }

  const renderRow = (item: PaymentDto & { concept?: string }) => {
    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50">
        <td className="p-3">
          <PaymentStatus status={item.status} />
        </td>
        <td className="p-3 hidden md:table-cell">{item.concept}</td>
        <td className="p-3 hidden md:table-cell">{item.invoiceNumber}</td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.amountPaid)}</td>
        <td className="p-3 hidden md:table-cell">
          {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : "-"}
        </td>
        <td className="p-3 hidden md:table-cell">{item.paymentMethod}</td>

        <td className="p-3">
          <div className="flex items-center justify-center gap-2">
            {item.status !== "ANULADO" && (
              <>
                <Link href={`/list/payments/edit/${item.id}`} title="Editar Pago">
                  <button className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 text-white">
                    <PencilIcon size={16} />
                  </button>
                </Link>

                <button
                  title="Imprimir"
                  onClick={() => window.print()}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white"
                >
                  <PrinterIcon size={16} />
                </button>
              </>
            )}

            {ROLE === "admin" && item.status !== "ANULADO" && (
              <button
                title="Anular"
                onClick={() => handleDelete(item.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white"
              >
                <Trash2Icon size={16} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div>Cargando pagos...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-around mb-4">
        <Link href="/list/enrollments" title="Regresar a matrículas">
          <Button className="w-auto p-2 rounded-full bg-blue-500 text-white">
            Regresar a matrículas
          </Button>
        </Link>
      </div>
      <TableView columns={columns} renderRow={renderRow} data={dataPayment} />
    </>
  );
}