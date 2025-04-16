"use client"

import { PaymentDto } from "@/api/interfaces/payment.interface";
import { PaymentService } from "@/api/models/pament/payment.api";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Calendar1Icon, PencilIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const columns: ColumnDefinition<PaymentDto>[] = [
  { header: "Estado de Pago", accessor: "status" },
  { header: "Número de Recibo", accessor: "invoiceNumber", className: "hidden md:table-cell" },
  { header: "Monto Pagado", accessor: "amountPaid", className: "hidden md:table-cell" },
  { header: "Fecha de Vencimiento", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Fecha de Pago", accessor: "paymentDate", className: "hidden md:table-cell" },
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
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-400">
        <td className="p-3">{item.status}</td>

        <td className="p-3 hidden md:table-cell">{item.invoiceNumber}</td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.amountPaid)}</td>
        <td className="p-3 hidden md:table-cell">{item.dueDate}</td>
        <td className="p-3 hidden md:table-cell">{item.paymentDate}</td>
        <td className="p-3 hidden md:table-cell">{item.notes}</td>
        <td className="p-3 hidden md:table-cell">{item.paymentMethod}</td>

        <td>
          <button
            title="Editar"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 text-white cursor-pointer"
          >
            <PencilIcon size={16} />
          </button>
        </td>
        <td>
          <button
            title="Imprimir"
            onClick={() => console.log("Imprimir", item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white cursor-pointer"
          >
            <PrinterIcon size={16} />
          </button>
        </td>
        <td>
          {ROLE === "admin" && (
            <button
              title="Eliminar"
              // onClick={() => handleDelete(item.enrollmentId!)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500 text-white cursor-pointer"
            >
              <Calendar1Icon size={16} />
            </button>
          )}
        </td>
      </tr>
    )
  };

  if (loading) {
    return <div>Cargando...</div>;
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