"use client";

import { AccountReceivable } from "@/api/interfaces/account-receivable.interface";
import { AccountReceivableService } from "@/api/models/accountReceivable/account-receivable.api";
import PaymentStatus from "@/components/customs/status";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BanknoteIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AccountReceivableRow = AccountReceivable & {
  amountPaid: number;
};

const columns: ColumnDefinition<AccountReceivableRow>[] = [
  { header: "Estado de Pago", accessor: "status" },
  { header: "Monto total", accessor: "totalAmount", className: "hidden md:table-cell" },
  { header: "Monto abonado", accessor: "amountPaid", className: "hidden md:table-cell" },
  { header: "Balance", accessor: "pendingBalance", className: "hidden md:table-cell" },
  { header: "Concepto", accessor: "concept", className: "hidden lg:table-cell" },
  { header: "Fecha de Vencimiento", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function ScheduleTable({ id }: { id: string }) {
  const [dataAccount, setDataAccount] = useState<AccountReceivableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await AccountReceivableService.listAccountReceivablesByCodeStudent(id);

        const normalized: AccountReceivableRow[] = data.map((item) => {
          const totalAmount = Number(item.totalAmount || 0);
          const pendingBalance = Number(item.pendingBalance || 0);
          const amountPaid = Number((totalAmount - pendingBalance).toFixed(2));

          return {
            ...item,
            totalAmount,
            pendingBalance,
            amountPaid,
            dueDate: new Date(item.dueDate).toLocaleDateString(),
          };
        });

        setDataAccount(normalized);
      } catch (error) {
        console.error("Error al cargar cronograma:", error);
        setDataAccount([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderRow = (item: AccountReceivableRow) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50"
      >
        <td className="p-3">
          <PaymentStatus status={item.status} />
        </td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.totalAmount)}</td>
        <td className="p-3 hidden md:table-cell font-medium text-emerald-700">
          {formatCurrency(item.amountPaid)}
        </td>
        <td className="p-3 hidden md:table-cell">{formatCurrency(item.pendingBalance)}</td>
        <td className="p-3 hidden lg:table-cell">{item.concept}</td>
        <td className="p-3 hidden md:table-cell">{item.dueDate}</td>
        <td className="p-3">
          <div className="flex items-center justify-center gap-2">
            {item.status !== "PAGADO" && item.status !== "ANULADO" && (
              <Link href={`/list/payments/new/${item.id}`} title="Pagar cuenta">
                <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-red-400 text-white">
                  <BanknoteIcon size={16} />
                </Button>
              </Link>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div>Cargando cronograma...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-around mb-4">
        <Link href="/list/enrollments" title="Regresar a la lista de matrículas">
          <Button className="w-auto p-2 flex items-center justify-center rounded-full bg-blue-500 text-white cursor-pointer">
            Regresar a la lista de matrículas
          </Button>
        </Link>
      </div>

      <div className="mb-4 rounded-lg bg-slate-50 border p-4 text-sm text-slate-700">
        <p>
          <span className="font-semibold">Monto total:</span> valor original de la cuota o concepto.
        </p>
        <p>
          <span className="font-semibold">Monto abonado:</span> todo lo que ya fue pagado sobre esa cuenta.
        </p>
        <p>
          <span className="font-semibold">Balance:</span> saldo restante por cobrar.
        </p>
      </div>

      <TableView columns={columns} renderRow={renderRow} data={dataAccount} />
    </>
  );
}