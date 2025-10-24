"use client";

import { useEffect } from "react";
import { useDomsStore } from "@/stores/doms-store";
import { useStatisticsStore } from "@/stores/statistics-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/loader";

export function DomSelector() {
  const { doms, loading: domsLoading, fetchDoms } = useDomsStore();
  const { selectedDomId, setSelectedDom } = useStatisticsStore();

  useEffect(() => {
    // Fetch all DOMs on component mount
    fetchDoms({ limit: 100 }); // Get up to 100 DOMs
  }, [fetchDoms]);

  const handleValueChange = (value: string) => {
    setSelectedDom(value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="dom-selector" className="text-sm font-medium">
        Select DOM:
      </label>
      <Select
        value={selectedDomId}
        onValueChange={handleValueChange}
        disabled={domsLoading}
      >
        <SelectTrigger className="w-[240px]" id="dom-selector">
          <SelectValue placeholder="Select a DOM" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>DOMs</SelectLabel>
            <SelectItem value="all">All DOMs</SelectItem>
            {domsLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader size={16} />
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              doms.map((dom) => (
                <SelectItem key={dom.id} value={dom.id.toString()}>
                  {dom.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
