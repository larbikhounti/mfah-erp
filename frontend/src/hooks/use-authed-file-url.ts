"use client";

import { useEffect, useState } from "react";
import type { AxiosInstance } from "axios";

/**
 * Object URL for a file behind an authenticated endpoint (an <img> can't
 * send the bearer header). `client` is the staff `axiosInstance` or the
 * driver portal's `driverApi`; pass `null` as the path to skip fetching.
 */
export function useAuthedFileUrl(client: AxiosInstance, path: string | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    client
      .get(path, { responseType: "blob" })
      .then(({ data }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setUrl(objectUrl);
      })
      .catch(() => setUrl(null));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, path]);

  return url;
}
