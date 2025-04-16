"use client";

import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
const WAIT_BETWEEN_CHANGE = 300; // milliseconds



const Search = ({ placeholder }: { placeholder: string }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
  
    const handleSearch = useDebouncedCallback((value: string) => {
      const params = new URLSearchParams(searchParams);
      !value ? params.delete("query") : params.set("query", value);
      params.set("page", "1");
      replace(`${pathname}?${params.toString()}`);
  
    }, WAIT_BETWEEN_CHANGE)
  
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value);
    };

  return (
    <div className="relative w-full md:w-64">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <Input
        type="text"
        placeholder={ placeholder }
        className="pl-9 pr-3 py-2 text-sm rounded-md border-gray-300 focus:border-primary focus:ring-0"
        onChange={handleInputChange}
        defaultValue={searchParams.get("query")?.toString()}
        autoComplete="off"
      />
    </div>
  );
};

export default Search;
