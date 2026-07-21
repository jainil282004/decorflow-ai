import ExcelJS from 'exceljs';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import type {
  DocumentCompany,
  DocumentCustomer,
  DocumentLineItem,
  DocumentType,
} from '../features/finance/components/FinanceDocumentView';

export interface FinanceExportPayload {
  docType: DocumentType;
  number: string;
  status: string;
  date: string | Date;
  validUntil?: string | Date | null;
  dueDate?: string | Date | null;
  notes?: string | null;
  subTotal: number;
  taxTotal: number;
  discountTotal?: number;
  totalAmount: number;
  company?: DocumentCompany | null;
  customer?: DocumentCustomer | null;
  items: DocumentLineItem[];
}

const sanitizeFilenamePart = (value: string) =>
  value
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

export const buildDocumentFilename = (
  docType: DocumentType,
  number: string,
  customerName?: string | null
) => {
  const label = docType === 'QUOTATION' ? 'Quotation' : 'Invoice';
  const customer = sanitizeFilenamePart(customerName || 'Customer') || 'Customer';
  const docNumber = sanitizeFilenamePart(number) || 'Draft';
  return `${label}_${docNumber}_${customer}`;
};

const formatDisplayDate = (value?: string | Date | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Export a DOM element to PDF using html2pdf.js
 */
export const exportToPdf = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: [8, 8, 8, 8] as [number, number, number, number],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fffdf9' },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Open the browser print dialog for a document element
 */
export const printDocument = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  document.body.classList.add('printing-finance-document');
  element.classList.add('is-printing');

  const cleanup = () => {
    document.body.classList.remove('printing-finance-document');
    element.classList.remove('is-printing');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  window.print();
  // Fallback cleanup for browsers that don't fire afterprint reliably
  setTimeout(cleanup, 1000);
};

/**
 * Legacy raw-rows Excel helper
 */
export const exportToExcel = async (data: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  if (!data?.length) {
    sheet.addRow(['No data']);
  } else {
    const keys = Object.keys(data[0]);
    sheet.addRow(keys);
    sheet.getRow(1).font = { bold: true };
    data.forEach((row) => sheet.addRow(keys.map((key) => row[key])));
    sheet.columns.forEach((col) => {
      col.width = 18;
    });
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Professional formatted Excel export for quotations / invoices
 */
export const exportFinanceDocumentToExcel = async (
  data: FinanceExportPayload,
  filename: string
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = data.company?.name || 'DecorFlow';
  workbook.created = new Date();

  const sheetName = data.docType === 'QUOTATION' ? 'Quotation' : 'Invoice';
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { key: 'a', width: 36 },
    { key: 'b', width: 14 },
    { key: 'c', width: 16 },
    { key: 'd', width: 16 },
  ];

  const brandFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2C241B' },
  };
  const softFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFAF6F0' },
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: 'FFF7F1E8' },
    size: 11,
  };
  const titleFont: Partial<ExcelJS.Font> = {
    bold: true,
    size: 18,
    color: { argb: 'FF2C241B' },
  };
  const inrFormat = '₹#,##0.00';

  let row = 1;
  sheet.mergeCells(row, 1, row, 4);
  sheet.getCell(row, 1).value = data.company?.name || 'Company Name';
  sheet.getCell(row, 1).font = titleFont;
  row += 1;

  if (data.company?.address) {
    sheet.mergeCells(row, 1, row, 4);
    sheet.getCell(row, 1).value = data.company.address;
    sheet.getCell(row, 1).font = { size: 10, color: { argb: 'FF6B5E52' } };
    row += 1;
  }

  const contact = [data.company?.phone, data.company?.email].filter(Boolean).join(' · ');
  if (contact) {
    sheet.mergeCells(row, 1, row, 4);
    sheet.getCell(row, 1).value = contact;
    sheet.getCell(row, 1).font = { size: 10, color: { argb: 'FF6B5E52' } };
    row += 1;
  }

  if (data.company?.taxId) {
    sheet.mergeCells(row, 1, row, 4);
    sheet.getCell(row, 1).value = `GSTIN / Tax ID: ${data.company.taxId}`;
    sheet.getCell(row, 1).font = { size: 10, color: { argb: 'FF6B5E52' } };
    row += 1;
  }

  row += 1;
  sheet.mergeCells(row, 1, row, 4);
  sheet.getCell(row, 1).value = data.docType;
  sheet.getCell(row, 1).font = {
    bold: true,
    size: 14,
    color: { argb: 'FF9A7B4F' },
  };
  row += 1;

  sheet.getCell(row, 1).value = 'Document No.';
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = `#${data.number}`;
  row += 1;

  sheet.getCell(row, 1).value = 'Date';
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = formatDisplayDate(data.date);
  row += 1;

  sheet.getCell(row, 1).value = data.docType === 'QUOTATION' ? 'Valid Until' : 'Due Date';
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = formatDisplayDate(
    data.docType === 'QUOTATION' ? data.validUntil : data.dueDate
  );
  row += 1;

  sheet.getCell(row, 1).value = 'Status';
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = data.status;
  row += 2;

  sheet.getCell(row, 1).value = 'Bill To';
  sheet.getCell(row, 1).font = { bold: true, size: 12 };
  sheet.getCell(row, 1).fill = softFill;
  sheet.mergeCells(row, 1, row, 4);
  row += 1;

  sheet.getCell(row, 1).value = data.customer?.name || 'N/A';
  sheet.getCell(row, 1).font = { bold: true };
  row += 1;
  if (data.customer?.email) {
    sheet.getCell(row, 1).value = data.customer.email;
    row += 1;
  }
  if (data.customer?.phone) {
    sheet.getCell(row, 1).value = data.customer.phone;
    row += 1;
  }

  row += 1;
  const headerRowIndex = row;
  const headers = ['Description', 'Quantity', 'Unit Price', 'Total'];
  headers.forEach((label, index) => {
    const cell = sheet.getCell(row, index + 1);
    cell.value = label;
    cell.font = headerFont;
    cell.fill = brandFill;
    cell.alignment = {
      vertical: 'middle',
      horizontal: index === 0 ? 'left' : 'right',
    };
  });
  sheet.getRow(row).height = 22;
  row += 1;

  (data.items || []).forEach((item, index) => {
    const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    sheet.getCell(row, 1).value = item.description;
    sheet.getCell(row, 2).value = Number(item.quantity || 0);
    sheet.getCell(row, 2).alignment = { horizontal: 'right' };
    sheet.getCell(row, 3).value = Number(item.unitPrice || 0);
    sheet.getCell(row, 3).numFmt = inrFormat;
    sheet.getCell(row, 3).alignment = { horizontal: 'right' };
    sheet.getCell(row, 4).value = lineTotal;
    sheet.getCell(row, 4).numFmt = inrFormat;
    sheet.getCell(row, 4).alignment = { horizontal: 'right' };

    if (index % 2 === 1) {
      for (let col = 1; col <= 4; col += 1) {
        sheet.getCell(row, col).fill = softFill;
      }
    }
    row += 1;
  });

  row += 1;
  const writeTotalRow = (label: string, amount: number, emphasize = false) => {
    sheet.getCell(row, 3).value = label;
    sheet.getCell(row, 3).font = { bold: emphasize, size: emphasize ? 12 : 11 };
    sheet.getCell(row, 3).alignment = { horizontal: 'right' };
    sheet.getCell(row, 4).value = amount;
    sheet.getCell(row, 4).numFmt = inrFormat;
    sheet.getCell(row, 4).font = { bold: emphasize, size: emphasize ? 12 : 11 };
    sheet.getCell(row, 4).alignment = { horizontal: 'right' };
    if (emphasize) {
      sheet.getCell(row, 3).fill = softFill;
      sheet.getCell(row, 4).fill = softFill;
    }
    row += 1;
  };

  writeTotalRow('Subtotal', Number(data.subTotal || 0));
  if ((data.discountTotal || 0) > 0) {
    writeTotalRow('Discount', Number(data.discountTotal || 0));
  }
  writeTotalRow('Tax', Number(data.taxTotal || 0));
  writeTotalRow('Grand Total', Number(data.totalAmount || 0), true);

  if (data.notes) {
    row += 1;
    sheet.getCell(row, 1).value = 'Notes';
    sheet.getCell(row, 1).font = { bold: true };
    row += 1;
    sheet.mergeCells(row, 1, row, 4);
    sheet.getCell(row, 1).value = data.notes;
    sheet.getCell(row, 1).alignment = { wrapText: true };
  }

  // Freeze below document meta so line-item headers stay visible while scrolling
  sheet.views = [
    { state: 'frozen', ySplit: Math.max(headerRowIndex - 1, 0), showGridLines: false },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export a basic invoice/quotation to Word using docx
 */
export const exportToWord = async (
  docType: 'Invoice' | 'Quotation',
  data: any,
  company: DocumentCompany | null | undefined,
  filename: string
) => {
  const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: 'D6CBBE' };
  const borders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };

  const headerCell = (text: string) =>
    new TableCell({
      borders,
      shading: { fill: '2C241B' },
      children: [
        new Paragraph({
          text,
          alignment: AlignmentType.CENTER,
        }),
      ],
    });

  const bodyCell = (
    text: string,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT
  ) =>
    new TableCell({
      borders,
      children: [new Paragraph({ text, alignment: align })],
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: company?.name || 'Company Name',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: `${docType.toUpperCase()} #${data.number}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: `Date: ${formatDisplayDate(data.date)}` }),
          new Paragraph({
            text:
              docType === 'Quotation'
                ? `Valid Until: ${formatDisplayDate(data.validUntil)}`
                : `Due Date: ${formatDisplayDate(data.dueDate)}`,
          }),
          new Paragraph({ text: `Status: ${data.status}` }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Bill To',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({ text: data.customer?.name || 'N/A' }),
          new Paragraph({ text: data.customer?.email || '' }),
          new Paragraph({ text: data.customer?.phone || '' }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  headerCell('Description'),
                  headerCell('Qty'),
                  headerCell('Unit Price'),
                  headerCell('Total'),
                ],
              }),
              ...((data.items || []) as DocumentLineItem[]).map(
                (item) =>
                  new TableRow({
                    children: [
                      bodyCell(item.description),
                      bodyCell(String(item.quantity), AlignmentType.RIGHT),
                      bodyCell(`₹${Number(item.unitPrice).toFixed(2)}`, AlignmentType.RIGHT),
                      bodyCell(
                        `₹${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`,
                        AlignmentType.RIGHT
                      ),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: `Subtotal: ₹${Number(data.subTotal || 0).toFixed(2)}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: `Tax: ₹${Number(data.taxTotal || 0).toFixed(2)}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: `Grand Total: ₹${Number(data.totalAmount || 0).toFixed(2)}`,
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Terms & Conditions',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: 'Prices are valid until the stated validity date. Advance may be required to confirm booking.',
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '__________________________' }),
          new Paragraph({ text: 'Authorized Signature' }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
