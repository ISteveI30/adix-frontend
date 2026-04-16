"use client";

import { InterestedSchema } from "./validate.interested";
import {
  InterestedService,
  InterestedListResponse,
} from "@/api/models/interested/interested.api";
import { ITEMS_PER_PAGE } from "@/api/services/api";
import Pagination from "@/components/customs/Pagination";
import TableView, { ColumnDefinition } from "@/components/customs/TableView";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

type InterestedRow = InterestedSchema & {
  id: string;
  data: string;
  actions: string;
};

const columns: ColumnDefinition<InterestedRow>[] = [
  { header: "Datos", accessor: "data" },
  { header: "Email", accessor: "email", className: "hidden md:table-cell" },
  { header: "Teléfono", accessor: "phone1", className: "hidden md:table-cell" },
  { header: "Acciones", accessor: "actions" },
];

export default function InterestedTable({
  query,
  currentPage = 1,
}: {
  query: string;
  currentPage?: number;
}) {
  const [rows, setRows] = useState<InterestedRow[]>([]);
  const [meta, setMeta] = useState({
    lastPage: 1,
    page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const deferredRows = useDeferredValue(rows);

  const fetchData = async (page?: number, searchData?: boolean) => {
    try {
      setLoading(true);

      page = page || currentPage;
      let response: InterestedListResponse;

      if (searchData && query.trim()) {
        response = await InterestedService.listInterested();
      } else {
        response = await InterestedService.listInterestedByPage(page, ITEMS_PER_PAGE);
      }

      const { data, meta } = Array.isArray(response) ? response[0] : response;

      const filtered: InterestedRow[] = (data || [])
        .filter((item: InterestedSchema) => {
          if (!query.trim()) return true;

          const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
          const email = `${item.email || ""}`.toLowerCase();
          const phone1 = `${item.phone1 || ""}`.toLowerCase();
          const search = query.toLowerCase();

          return (
            fullName.includes(search) ||
            email.includes(search) ||
            phone1.includes(search)
          );
        })
        .map((item: InterestedSchema) => ({
          ...item,
          id: item.id || "",
          data: `${item.firstName} ${item.lastName}`,
          actions: "actions",
        }));

      setRows(filtered);

      if (searchData && query.trim()) {
        setMeta({
          lastPage: 1,
          page: 1,
          total: filtered.length,
        });
      } else {
        setMeta(meta);
      }
    } catch (error) {
      console.error("Error cargando interesados:", error);
      setRows([]);
      setMeta({
        lastPage: 1,
        page: 1,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      fetchData(1, true);
    } else {
      fetchData(currentPage, false);
    }
  }, [query, currentPage]);

  const renderRow = (item: InterestedRow) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-semibold">
            {item.firstName} {item.lastName}
          </span>
          <span className="text-xs text-gray-500">{item.phone1 || "-"}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.email || "-"}</td>
      <td className="hidden md:table-cell">{item.phone1 || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/interested/edit/${item.id}?page=${currentPage}`}>
            <Button size="icon" className="w-7 h-7 rounded-full bg-blue-600 text-white">
              <Pencil size={16} />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <div>Cargando interesados...</div>;
  }

  return (
    <>
      <TableView columns={columns} renderRow={renderRow} data={deferredRows} />

      {meta.total > ITEMS_PER_PAGE && !query.trim() && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={meta.lastPage} />
        </div>
      )}
    </>
  );
}