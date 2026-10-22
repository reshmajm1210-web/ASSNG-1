/**
 * Validation rules for the shipping bill.
 *
 * The form uses the framework's schema builder (`s` from `core/form`), not a
 * separate validation library. Rules are declared per *leaf* field name because
 * fe-zen-arch resolves nested React Hook Form rules by the last path segment
 * (for example `invoices.3.items.7.quantity` uses the `quantity` rule below).
 *
 * `refine` receives `(value, formData)`, which is how cross-field rules are
 * expressed — see the weight, packing-range and invoice-date rules.
 */

import { s } from 'core/form'

const positive = s.string().refine((value) => (Number(value) > 0 ? undefined : 'Enter a number above zero'))

/** Parse a form value that may be empty; returns undefined when it is not usable. */
function toNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const parsed = Number(value)
  if (value === '') return undefined
  return Number.isNaN(parsed) ? undefined : parsed
}

export const billSchema = s.object({
  jobNumber: s.string().optional(),
  jobDate: s.string(),
  exporterId: s.string(),
  exporterBranchId: s.string(),
  consigneeId: s.string(),
  consigneeBranchId: s.string(),
  loadingPort: s.string(),
  finalDestinationPort: s.string(),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: s.string().optional(),
  sealType: s.string().optional(),
  numberOfContainers: s.string().optional(),
  natureOfCargo: s.string().optional(),
  grossWeight: s.string().optional(),
  // Net weight is the goods only; it can never be heavier than the gross weight.
  netWeight: s
    .string()
    .refine((value, formData) => {
      const net = toNumber(value)
      const gross = toNumber(formData?.grossWeight)
      if (net === undefined || gross === undefined) return undefined
      return net > gross ? 'Net weight cannot be greater than the gross weight' : undefined
    })
    .optional(),
  measurementUnit: s.string().optional(),
  totalPackages: s.string().optional(),
  marksAndNumbers: s.string().optional(),
  loosePackets: s.string().optional(),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),
  invoiceNumber: s.string(),
  // The job is booked first, so an invoice can never be dated after the job date.
  invoiceDate: s.string().refine((value, formData) => {
    const invoiceDate = typeof value === 'string' ? value : ''
    const jobDate = typeof formData?.jobDate === 'string' ? formData.jobDate : ''
    if (invoiceDate === '' || jobDate === '') return undefined
    // Both dates come from <input type="date"> and are `YYYY-MM-DD`, so a string
    // comparison is the same as comparing the dates.
    return invoiceDate > jobDate ? 'Invoice date cannot be later than the job date' : undefined
  }),
  currency: s.string(),
  invoiceTotal: s
    .string()
    .refine((value) => (!value || Number(value) >= 0 ? undefined : 'Total cannot be negative'))
    .optional(),
  contractType: s.string(),
  buyerId: s.string().optional(),
  buyerBranchId: s.string().optional(),
  thirdPartyId: s.string().optional(),
  thirdPartyBranchId: s.string().optional(),
  ritcCode: s.string(),
  goodsDescription1: s.string(),
  quantity: positive,
  unitOfMeasurement: s.string(),
  unitPrice: positive,
  containerNumber: s.string().optional(),
  packingNumberFrom: s.string().optional(),
  // A package range is (from … to), so "to" can never be below "from".
  packingNumberTo: s
    .string()
    .refine((value, formData) => {
      const to = toNumber(value)
      const from = toNumber(formData?.packingNumberFrom)
      if (to === undefined || from === undefined) return undefined
      return to < from ? 'Packing end number cannot be smaller than the packing start number' : undefined
    })
    .optional(),
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})
