import * as XLSX from 'xlsx';
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
} from 'docx';
// @ts-ignore
import html2pdf from 'html2pdf.js';

/**
 * Export a DOM element to PDF using html2pdf.js
 */
export const exportToPdf = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export a basic invoice/quotation to Word using docx
 */
export const exportToWord = async (
  docType: 'Invoice' | 'Quotation',
  data: any,
  company: any,
  filename: string
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: company?.name || 'Company Name',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${docType} #: ${data.number}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: `Date: ${new Date(data.date).toLocaleDateString()}` }),
          new Paragraph({ text: `Customer: ${data.customer?.name || 'N/A'}` }),
          new Paragraph({ text: '' }), // Spacing
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: 'Description', alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Qty', alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: 'Unit Price', alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })],
                  }),
                ],
              }),
              ...data.items.map(
                (item: any) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.description)] }),
                      new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                      new TableCell({ children: [new Paragraph(`₹${item.unitPrice.toFixed(2)}`)] }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${(item.quantity * item.unitPrice).toFixed(2)}`),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: `Subtotal: ₹${data.subTotal?.toFixed(2) || 0}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: `Tax: ₹${data.taxTotal?.toFixed(2) || 0}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: `Total: ₹${data.totalAmount?.toFixed(2) || 0}`,
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
          }),
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
