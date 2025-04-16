"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { ChangeEvent } from "react";

type TableSearchProps = {
  onSearch: (value: string) => void;
};

const TableSearch: React.FC<TableSearchProps> = ({ onSearch }) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full md:w-64">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <Input
        type="text"
        placeholder="Buscar alumno..."
        className="pl-9 pr-3 py-2 text-sm rounded-md border-gray-300 focus:border-primary focus:ring-0"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default TableSearch;

