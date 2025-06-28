"use client"
import TableView, { ColumnDefinition } from '@/components/customs/TableView'
import React, { use, useEffect, useState } from 'react'
import { ROLE } from "@/lib/data";
import { InterestedService } from '@/api/models/interested/interested.api'
import Pagination from '@/components/customs/Pagination'
import { Pencil, Trash2Icon } from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/api/services/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InterestedColumns, InterestedListResponse } from '@/api/interfaces/interested.interface'
import Swal from 'sweetalert2';

const interestedColumns: ColumnDefinition<InterestedColumns>[] = [
  { header: "Datos", accessor: "info" },
  { header: "Email", accessor: "email" },
  { header: "Teléfono 2", accessor: "phone2", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
]


interface Props {
  query: string;
  currentPage?: number;
}

const InterestedTable = ({ query, currentPage = 1 }: Props) => {
  const [all, setAll] = useState<InterestedListResponse | null>(null);
  const [page, setPage] = useState<InterestedListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Traer todos 
  useEffect(() => {
    InterestedService.getAll()
      .then(res => setAll(res))
      .catch(console.error);
  }, []);

  // Traer página actual
  useEffect(() => {
    setLoading(true);
    InterestedService.getByPage(currentPage, ITEMS_PER_PAGE)
      .then(res => {
        setPage(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentPage]);

  if (loading || !all || !page) {
    return <div>Cargando interesados…</div>;
  }

  // Lógica de búsqueda / paginación
  const filteredData = query
    ? all.data.filter(i =>
      `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(query.toLowerCase())
    )
    : [];
  const totalPages = query
    ? Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    : page.meta.lastPage;
  const dataToRender = query ? filteredData : page.data;

  // Eliminar
  async function handleDelete(id: string) {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;

    await InterestedService.delete(id);
    setPage(prev => ({
      ...prev!,
      data: prev!.data.filter(item => item.id !== id),
      meta: { ...prev!.meta, total: prev!.meta.total - 1 }
    }));
    Swal.fire("¡Eliminado!", "Se ha borrado el interesado.", "success");
  }

  const renderRow = (item: InterestedColumns) => {
    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-green-50 ">
        <td className="flex items-center gap-4 p-4">
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
            <p className="text-xs text-gray-500">{item.phone1}</p>
          </div>
        </td>
        <td className="p-2">{item.email}</td>
        <td className="p-2">{item.phone2}</td>
        <td className="apx-6 py-4 align-middle text-left">
          <div className="inline-flex items-end space-x-2 mt-1">
            <Link href={`/list/interested/edit/${item.id}?page=${currentPage}`}>
              <Button 
                title='Editar Interesado'
                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 cursor-pointer">
                <Pencil  size={16} />
              </Button>
            </Link>
            {ROLE === "admin" && (
              <Button
                title="Eliminar"
                onClick={() => handleDelete(item.id!)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-800 cursor-pointer"
              >
                <Trash2Icon size={16} />
              </Button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <TableView
        columns={interestedColumns}
        renderRow={renderRow}
        data={dataToRender}
      />
      {page.meta.total > ITEMS_PER_PAGE && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}

export default InterestedTable