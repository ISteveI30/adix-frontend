import TableView, { ColumnDefinition } from '@/components/customs/TableView'
import React, { use } from 'react'

import { InterestedService } from '@/api/models/interested/interested.api'
import Pagination from '@/components/customs/Pagination'
import { EyeIcon } from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/api/services/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InterestedColumns, InterestedListResponse } from '@/api/interfaces/interested.interface'

const interestedColumns: ColumnDefinition<InterestedColumns>[] = [
  { header: "Datos", accessor: "info" },
  { header: "Email", accessor: "email" },
  { header: "Teléfono 2", accessor: "phone2", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
]

const InterestedTable = (
  props: {
    query: string;
    currentPage?: number;
  }
) => {

  let { query, currentPage } = props
  currentPage = currentPage || 1

  const responseAll: InterestedListResponse = use(InterestedService.getAll())
  const responseByPage: InterestedListResponse = use(InterestedService.getByPage(currentPage, ITEMS_PER_PAGE))

  const filteredData = query.length > 0
    ? responseAll.data.filter((interested) => `${interested.firstName} ${interested.lastName} ${interested.email}`.toLowerCase().includes(query.toLowerCase()))
    : []

  const filteredLastPage = query.length > 0 ? Math.ceil(filteredData.length / ITEMS_PER_PAGE) : responseAll.meta.lastPage
  const dataRender = !query ? responseByPage.data : filteredData

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
        <td className="p-2">
          <Link href={`/list/interested/edit/${item.id}?page=${currentPage}`} className="flex items-center justify-center">
            <Button className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 cursor-pointer">
              <EyeIcon size={16} />
            </Button>
          </Link>
        </td>
      </tr>
    )
  }

  return (
    <>
      <TableView
        columns={interestedColumns}
        renderRow={renderRow}
        data={dataRender}
      />
      {responseByPage.meta.total > ITEMS_PER_PAGE && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            totalPages={filteredLastPage}
          />
        </div>
      )}
    </>
  )
}

export default InterestedTable