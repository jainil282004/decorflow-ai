/**
 * Default GST / tax rate (%) applied on quotation & invoice create forms.
 *
 * No backend settings field or endpoint exists for a company tax rate yet
 * (organization settings only store taxId / GSTIN). Wire this to settings
 * when that is added as a separate future step.
 */
export const DEFAULT_TAX_RATE_PERCENT = 18;

/** Decimal multiplier for amount math (e.g. 0.18 for 18%). */
export const DEFAULT_TAX_RATE = DEFAULT_TAX_RATE_PERCENT / 100;
