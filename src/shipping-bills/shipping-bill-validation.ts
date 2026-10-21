import { s } from 'core/form'
import { ShippingBillFormValues } from './model'

/**
 * Validation schema for the Shipping Bill form (built with the existing fe-zen-arch
 * schema builder — no extra validation library).
 *
 * IMPORTANT: leaf names are deliberate — fe-zen-arch resolves nested RHF field rules
 * by their final path segment (e.g. `invoices.0.items.2.quantity` uses `quantity`).
 *
 * Cross-field rules (validate receives the full form values as second argument):
 * - Net weight must not exceed gross weight.
 * - Packing range start number must not exceed the packing range end number.
 * - Invoice date must not be later than the job date (domain assumption: the job
 *   date is the CHA job opening date, which is on or before any invoice date).
 */

function toNumber(value: string | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function packingRangeError(
  value: string | undefined,
  formData: ShippingBillFormValues | undefined,
  side: 'from' | 'to'
): string | undefined {
  const text = value ?? ''
  const target = toNumber(text)
  if (target == null || !formData?.packingRanges) return undefined
  const rowViolates = formData.packingRanges.some((row) => {
    const from = toNumber(row.packingNumberFrom)
    const to = toNumber(row.packingNumberTo)
    if (from == null || to == null || from <= to) return false
    return side === 'from' ? row.packingNumberFrom === text : row.packingNumberTo === text
  })
  return rowViolates ? 'Packing start number must not exceed packing end number' : undefined
}

const positive = s.string().refine((value) => (Number(value) > 0 ? undefined : 'Enter a number above zero'))

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
  netWeight: s
    .string()
    .optional()
    .refine((value, formData: ShippingBillFormValues | undefined) => {
      const net = toNumber(value)
      const gross = toNumber(formData?.grossWeight)
      if (net == null || gross == null) return undefined
      return net > gross ? 'Net weight cannot exceed gross weight' : undefined
    }),
  measurementUnit: s.string().optional(),
  totalPackages: s.string().optional(),
  marksAndNumbers: s.string().optional(),
  loosePackets: s.string().optional(),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),
  invoiceNumber: s.string(),
  invoiceDate: s.string().refine((value, formData: ShippingBillFormValues | undefined) => {
    const jobDate = formData?.jobDate
    if (!value || !jobDate) return undefined
    return new Date(value) > new Date(jobDate) ? 'Invoice date cannot be later than the job date' : undefined
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
  packingNumberFrom: s
    .string()
    .optional()
    .refine((value, formData: ShippingBillFormValues | undefined) => packingRangeError(value, formData, 'from')),
  packingNumberTo: s
    .string()
    .optional()
    .refine((value, formData: ShippingBillFormValues | undefined) => packingRangeError(value, formData, 'to')),
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})
