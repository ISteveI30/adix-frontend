"use client"

import { PaymentAnulateDto, PaymentDto } from "@/api/interfaces/payment.interface";
import { PaymentService } from "@/api/models/payment/payment.api";
import PaymentStatus from "@/components/customs/status";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { PencilIcon, PrinterIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const columns: ColumnDefinition<PaymentDto>[] = [
  { header: "Estado de Pago", accessor: "status" },
  { header: "Número de Recibo", accessor: "invoiceNumber", className: "hidden  md:table-cell" },
  { header: "Monto Pagado", accessor: "amountPaid", className: "hidden md:table-cell" },
  { header: "Fecha de Vencimiento", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Fecha de Pago", accessor: "paymentDate", className: "hidden md:table-cell" },
  { header: "Método de Pago", accessor: "paymentMethod", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];


export default function PaymentTable({
  id
}: {
  id: string;
}) {
  const [dataPayment, setDataPayment] = useState<PaymentDto[]>([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data: PaymentDto[] = await PaymentService.getPaymentsByStudentId(id);
        setDataPayment(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const renderRow = (item: PaymentDto) => {

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-200">
        <td className="p-3"><PaymentStatus status={item.status} /></td>

        <td className="p-3 hidden md:table-cell">{item.invoiceNumber}</td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.amountPaid)}</td>
        <td className="p-3 hidden md:table-cell">{new Date(item.dueDate).toLocaleDateString()}</td>
        <td className="p-3 hidden md:table-cell">{new Date(item.paymentDate!).toLocaleDateString()}</td>
        <td className="p-3 hidden md:table-cell">{item.paymentMethod}</td>

        <td className="p-3 flex items-center justify-center gap-2">
          <button
            title="Editar"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 text-white cursor-pointer"
          >
            <PencilIcon size={16} />
          </button>

          <button
            title="Imprimir"
            onClick={() => console.log("Imprimir", item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white cursor-pointer"
          >
            <PrinterIcon size={16} />
          </button>

          {ROLE === "admin" && (
            <button
              title="Eliminar"
              onClick={() => handleDelete(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </td>
      </tr>
    )
  };

  async function handleDelete(idPayment: string) {

    const paymet = await PaymentService.getPaymentById(idPayment);
    if (paymet.status === "ANULADO") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El pago ya ha sido anulado.",
      });
      return
    }

    Swal.fire({
      title: "¿Está seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response: PaymentAnulateDto = await PaymentService.cancelPayment(idPayment);
        if (response.success === false) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al eliminar el pago.",
          });
          return
        }
        Swal.fire("¡Anulado!",` ${response.message}`, "success");
        redirect(`/list/schedule/${id}`)
      }
    });
  }

  if (loading) {
    return <div>Cargando Pagos...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-around mb-4 ">
        <Link href={`/list/enrollments`} title="Regresar a la lista de matrículas">
          <Button className="w-auto p-2 flex items-center justify-center rounded-full bg-blue-500 text-white cursor-pointer">
            Regresar a la lista de matrículas
          </Button>
        </Link>
      </div>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={dataPayment}
      />
    </>
  );
}