"use client"

import { AccountReceivable } from "@/api/interfaces/account-receivable.interface";
import { AccountReceivableService } from "@/api/models/accountReceivable/account-receivable.api";
import PaymentStatus from "@/components/customs/status";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { BanknoteIcon, EuroIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const columns: ColumnDefinition<AccountReceivable>[] = [
  { header: "Estado de Pago", accessor: "status" },
  { header: "Monto total", accessor: "totalAmount", className: "hidden md:table-cell" },
  { header: "Balance", accessor: "pendingBalance", className: "hidden md:table-cell" },
  { header: "Concepto", accessor: "concept", className: "hidden lg:table-cell" },
  { header: "Fecha de Vencimiento", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];


export default function ScheduleTable({
  id
}: {
  id: string;
}) {
  const [dataAccount, setDataAccount] = useState<AccountReceivable[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await AccountReceivableService.listAccountReceivablesByStudent(id);

        if (!data || data.length === 0) {
          setDataAccount([]);
          console.info("No se encontraron datos de matrícula.");
          return;
        }

        const transformed = data.map((item): AccountReceivable => ({
          id: item.id,
          status: item.status,
          totalAmount: item.totalAmount,
          pendingBalance: item.pendingBalance,
          concept: item.concept,
          dueDate: new Date(item.dueDate).toLocaleDateString(),
        }));
        setDataAccount(transformed);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderRow = (item: AccountReceivable) => {

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-200  cursor-pointer">
        <td className="p-3"><PaymentStatus status={item.status} /></td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.totalAmount)}</td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.pendingBalance)}</td>
        <td className="p-3 hidden lg:table-cell">{item.concept}</td>
        <td className="p-3 hidden md:table-cell">{item.dueDate}</td>

        <td className="p-3 flex items-center justify-center gap-2">
          {
            item.status === "PENDIENTE" && (
              <Link href={`/list/payments/new/${item.id}`} title="Pagar Cuenta">
                <Button
                  title="Pagar"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-green-400 text-white cursor-pointer"
                >
                  <BanknoteIcon size={16} />
                </Button>
              </Link>
            )
          }
        </td>
{/* 
        <td className="p-3 flex items-center justify-center gap-2">
          {ROLE === "admin" && (
            <Button
              title="Eliminar"
              // onClick={() => handleDelete(item.enrollmentId!)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
            >
              <TrashIcon size={16} />
            </Button>
          )}
        </td> */}

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
      <div className="overflow-x-auto mb-4">
        <p className="text-sm text-gray-500">Total de cuentas por cobrar: {dataAccount.length}</p>
      </div>
      <TableView
        columns={columns}
        renderRow={renderRow}
        data={dataAccount}
      />
    </>
  );
}