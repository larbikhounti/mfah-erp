import { useCallback, useRef, useState } from "react";
import { axiosInstance } from "@/lib/utils";
import type { ComboboxOption } from "@/components/ui/combobox";

interface RemoteListResponse<T> {
  data: T[];
  total: number;
}

interface UseRemoteComboboxOptionsConfig<T> {
  endpoint: string;
  mapItem: (item: T) => ComboboxOption;
  limit?: number;
  extraParams?: Record<string, unknown>;
}

// Backs a Combobox's `onSearchChange` with a live backend query instead of
// filtering a pre-fetched batch — for entity lists that can outgrow the
// small `limit` used everywhere else (Clients, Subcontractors). Keeps its
// own local state rather than the shared Zustand stores: those are also
// used to render table columns (name lookups, etc.) and would be clobbered
// by a live search query overwriting the store's array mid-render.
export function useRemoteComboboxOptions<T>({
  endpoint,
  mapItem,
  limit = 20,
  extraParams,
}: UseRemoteComboboxOptionsConfig<T>) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  // Guards against an older, slower request resolving after a newer one.
  const requestId = useRef(0);

  const search = useCallback(
    async (query: string) => {
      const thisRequest = ++requestId.current;
      setLoading(true);
      try {
        const response = await axiosInstance.get<RemoteListResponse<T>>(endpoint, {
          params: { limit, search: query.trim() || undefined, ...extraParams },
        });
        if (thisRequest === requestId.current) {
          setOptions(response.data.data.map(mapItem));
        }
      } catch {
        // Leave whatever results are already showing in place.
      } finally {
        if (thisRequest === requestId.current) setLoading(false);
      }
    },
    [endpoint, mapItem, limit, extraParams]
  );

  return { options, loading, search };
}
