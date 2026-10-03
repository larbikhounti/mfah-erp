/**
 * Suggested default values for the "Generate PDF" dialog's fields that we
 * actually have a source of truth for. Everything else on the template
 * (remorque, cmr, commande, tmsa, immobilisation, double_equipage, gazoil)
 * has no backing data in our schema — the dialog starts those
 * blank/off and the frontend fills them in only if the user turns them on.
 */
export interface InvoicePdfPrefill {
  client_name: string;
  /** The client's address, or "" if none is on file. */
  client_address: string;
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
  /** The mission's EUR→MAD rate ("" if none — always "" for MAD), and the
   *  date shown next to it on the invoice. The dialog builds the rate line
   *  and the MAD-converted total from these. */
  exchange_rate: string;
  exchange_rate_date: string;
  /** Whether this mission has a truck assigned (IN_HOUSE) — the frontend
   *  uses this to decide whether "Matricule" defaults on or off. */
  hasTruck: boolean;
  /** The invoice's own currency — the dialog uses this to keep its live
   *  recalculations (and the "EUR" suffix on amounts) consistent as the
   *  user edits totals. */
  currency: 'MAD' | 'EUR';
}
