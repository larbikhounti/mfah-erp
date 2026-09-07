/**
 * Suggested default values for the "Generate PDF" dialog's fields that we
 * actually have a source of truth for. Everything else on the template
 * (remorque, cmr, commande, tmsa, immobilisation, double_equipage, gazoil,
 * client_city) has no backing data in our schema — the dialog starts those
 * blank/off and the frontend fills them in only if the user turns them on.
 */
export interface InvoicePdfPrefill {
  client_name: string;
  client_ice: string;
  invoice_number: string;
  invoice_date: string;
  loading_date: string;
  delivery_date: string;
  matricule: string;
  operation: string;
  designation: string;
  quantity: string;
  unit_price: string;
  line_total: string;
  total_ht: string;
  tva: string;
  total_ttc: string;
  amount_in_words: string;
  /** Whether this mission has a truck assigned (IN_HOUSE) — the frontend
   *  uses this to decide whether "Matricule" defaults on or off. */
  hasTruck: boolean;
  /** The invoice's own currency — the dialog uses this to keep its live
   *  recalculations (and the "EUR" suffix on amounts) consistent as the
   *  user edits totals. */
  currency: 'MAD' | 'EUR';
}
