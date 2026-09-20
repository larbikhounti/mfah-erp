/**
 * Maps each GenerateInvoicePdfDto field to its cell address on
 * "FACTURE model.xlsx" (verified against the template's own sheet1.xml —
 * each address is the top-left anchor of that field's merged range). Pure
 * data, no logic: ClientInvoicePdfService writes `allFields[dtoKey]` into
 * `sheet.getCell(cellRef)` for every entry here and nothing else.
 */
export const INVOICE_TEMPLATE_CELLS: Record<string, string> = {
  client_name: 'B9',
  invoice_number: 'H9',
  invoice_date: 'K9',
  client_city: 'B11',
  loading_date: 'H12',
  delivery_date: 'K12',
  client_ice: 'C13',
  matricule: 'B17',
  remorque: 'D17',
  operation: 'F17',
  cmr: 'I17',
  commande: 'K17',
  tmsa: 'B20',
  immobilisation: 'D20',
  double_equipage: 'F20',
  gazoil: 'I20',
  extras_total: 'K20',
  designation: 'B23',
  quantity: 'F23',
  unit_price: 'I23',
  line_total: 'K23',
  tva: 'I31',
  total_ht: 'K31',
  total_ttc: 'I36',
  amount_in_words: 'B36',
};

/** TMSA/Immobilisation/Double Équipage/Transitair header row + its values
 *  row — hidden together when no surcharge applies (see
 *  ClientInvoicePdfService), the same way the old PDF template whited out
 *  that section. The footer logo below is anchored "move with cells", so
 *  hiding these closes the gap instead of leaving it blank. */
export const SURCHARGE_ROWS = [19, 20];

export const SURCHARGE_FIELD_NAMES = ['tmsa', 'immobilisation', 'double_equipage', 'gazoil'] as const;
