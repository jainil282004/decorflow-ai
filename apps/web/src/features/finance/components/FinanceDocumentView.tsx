export type DocumentType = 'QUOTATION' | 'INVOICE';

export interface DocumentCompany {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  logoUrl?: string | null;
  website?: string | null;
}

export interface DocumentCustomer {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface DocumentLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface FinanceDocumentProps {
  documentId: string;
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
  terms?: string;
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatInr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const DEFAULT_TERMS =
  'Prices are valid until the stated validity date. 50% advance may be required to confirm booking. Balance due before delivery/installation. Damages or losses to rented items will be charged at replacement cost.';

export const FinanceDocumentView = ({
  documentId,
  docType,
  number,
  status,
  date,
  validUntil,
  dueDate,
  notes,
  subTotal,
  taxTotal,
  discountTotal = 0,
  totalAmount,
  company,
  customer,
  items,
  terms = DEFAULT_TERMS,
}: FinanceDocumentProps) => {
  const secondaryDateLabel = docType === 'QUOTATION' ? 'Valid Until' : 'Due Date';
  const secondaryDate = docType === 'QUOTATION' ? validUntil : dueDate;

  return (
    <article
      id={documentId}
      className="finance-document mx-auto w-full max-w-[820px] overflow-hidden rounded-xl border border-[#e7e0d6] bg-[#fffdf9] text-[#1c1917] shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
    >
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-[#e7e0d6] bg-gradient-to-br from-[#f7f1e8] to-[#fffdf9] px-8 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#ddd2c4] bg-white">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company?.name || 'Company'} logo`}
                className="h-full w-full object-contain p-1"
                crossOrigin="anonymous"
              />
            ) : (
              <span className="px-1 text-center text-[10px] font-medium uppercase tracking-wide text-[#8a7a68]">
                Logo
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2c241b]">
              {company?.name || 'Company Name'}
            </h2>
            <div className="mt-1 space-y-0.5 text-sm text-[#6b5e52]">
              {company?.address && <p className="whitespace-pre-line">{company.address}</p>}
              {(company?.phone || company?.email) && (
                <p>{[company.phone, company.email].filter(Boolean).join(' · ')}</p>
              )}
              {company?.taxId && <p>GSTIN / Tax ID: {company.taxId}</p>}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7b4f]">
            {docType}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#2c241b]">
            #{number}
          </h1>
          <div className="mt-3 space-y-1 text-sm text-[#5c5248]">
            <p>
              <span className="text-[#8a7a68]">Date: </span>
              {formatDate(date)}
            </p>
            <p>
              <span className="text-[#8a7a68]">{secondaryDateLabel}: </span>
              {formatDate(secondaryDate)}
            </p>
            <p>
              <span className="text-[#8a7a68]">Status: </span>
              <span className="font-medium uppercase tracking-wide">{status}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Bill To */}
      <section className="grid gap-4 px-8 py-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe3d8] bg-[#faf6f0] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7b4f]">
            Bill To
          </p>
          {customer ? (
            <div className="mt-2 space-y-1">
              <p className="text-base font-semibold text-[#2c241b]">{customer.name}</p>
              {customer.email && <p className="text-sm text-[#6b5e52]">{customer.email}</p>}
              {customer.phone && <p className="text-sm text-[#6b5e52]">{customer.phone}</p>}
            </div>
          ) : (
            <p className="mt-2 text-sm italic text-[#8a7a68]">No customer linked</p>
          )}
        </div>
        <div className="rounded-lg border border-dashed border-[#ddd2c4] bg-white/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7b4f]">
            Document Summary
          </p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#8a7a68]">Status</dt>
              <dd className="font-medium uppercase">{status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#8a7a68]">{secondaryDateLabel}</dt>
              <dd className="font-medium">{formatDate(secondaryDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#8a7a68]">Grand Total</dt>
              <dd className="font-semibold text-[#2c241b]">{formatInr(totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Line items */}
      <section className="px-8 pb-2">
        <div className="overflow-hidden rounded-lg border border-[#e7e0d6]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#2c241b] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f7f1e8]">
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="w-20 px-4 py-3 text-right font-medium">Qty</th>
                <th className="w-28 px-4 py-3 text-right font-medium">Unit Price</th>
                <th className="w-28 px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.length ? (
                items.map((item, index) => (
                  <tr
                    key={item.id || `${item.description}-${index}`}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#faf6f0]'}
                  >
                    <td className="px-4 py-3 align-top text-[#2c241b]">{item.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#5c5248]">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#5c5248]">
                      {formatInr(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-[#2c241b]">
                      {formatInr(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#8a7a68]">
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financials */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-8 text-[#5c5248]">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatInr(subTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between gap-8 text-[#5c5248]">
                <span>Discount</span>
                <span className="tabular-nums">−{formatInr(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-8 text-[#5c5248]">
              <span>Tax</span>
              <span className="tabular-nums">{formatInr(taxTotal)}</span>
            </div>
            <div className="flex justify-between gap-8 border-t border-[#ddd2c4] pt-3">
              <span className="text-base font-semibold text-[#2c241b]">Grand Total</span>
              <span className="text-lg font-bold tabular-nums text-[#2c241b]">
                {formatInr(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {notes && (
        <section className="px-8 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7b4f]">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-[#5c5248]">{notes}</p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 grid gap-8 border-t border-[#e7e0d6] px-8 py-8 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7b4f]">
            {'Terms & Conditions'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#6b5e52]">{terms}</p>
        </div>
        <div className="flex flex-col justify-end">
          <div className="ml-auto w-full max-w-[220px] text-center">
            <div className="mb-10 h-12 border-b border-[#2c241b]" />
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#5c5248]">
              Authorized Signature
            </p>
            <p className="mt-1 text-xs text-[#8a7a68]">{company?.name || 'Authorized Signatory'}</p>
          </div>
        </div>
      </footer>
    </article>
  );
};
