import ExcelJS from "exceljs";

export interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
}

/**
 * Builds an .xlsx workbook (one sheet) from rows keyed by `columns[].key`
 * and triggers a browser download. Client-side only, via exceljs.
 */
export async function exportToExcel(
  filename: string,
  sheetName: string,
  rows: Record<string, string | number>[],
  columns: ExcelColumn[],
) {
  if (rows.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
