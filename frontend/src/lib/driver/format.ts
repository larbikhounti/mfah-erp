import { format } from "date-fns";

/** 18/09/2026 */
export const formatDate = (value: string | Date) => format(new Date(value), "dd/MM/yyyy");

/** 18/09/2026 - 08:00 */
export const formatDateTime = (value: string | Date) =>
  format(new Date(value), "dd/MM/yyyy - HH:mm");

/** 125 430 */
export const formatNumber = (value: number | string, fractionDigits = 0) =>
  Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/** 358.40 EUR */
export const formatMoney = (value: number | string, currency: string) =>
  `${Number(value).toFixed(2)} ${currency}`;

/** "1 entry", "3 entries" */
export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
