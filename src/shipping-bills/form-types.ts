import { FormContextData, Path } from 'ui/form'
import { ShippingBillFormValues } from './model'

/** React Hook Form context of the shipping bill form, shared by the tab/editor components. */
export type BillFormContext = FormContextData<ShippingBillFormValues>

/** Any registered field path of the shipping bill form. */
export type BillFieldPath = Path<ShippingBillFormValues>

/** Owner field paths that can be paired with a branch field path. */
export type OwnerPath =
  | 'exporterId'
  | 'consigneeId'
  | `invoices.${number}.buyerId`
  | `invoices.${number}.thirdPartyId`
  | `invoices.${number}.items.${number}.itemThirdPartyId`

export type BranchPath =
  | 'exporterBranchId'
  | 'consigneeBranchId'
  | `invoices.${number}.buyerBranchId`
  | `invoices.${number}.thirdPartyBranchId`
  | `invoices.${number}.items.${number}.itemThirdPartyBranchId`

export interface QuickAdd {
  kind: 'exporter' | 'business'
  role?: 'consignee' | 'buyer' | 'thirdParty' | 'itemThirdParty'
  invoiceIndex?: number
  itemIndex?: number
}

export interface QuickBranch {
  kind: 'exporter' | 'business'
  ownerId: number
  branchName: BranchPath
}

/**
 * The plain <Input> types do not include 'date'; this keeps the original runtime
 * behaviour (native date pickers) without unsafe casts at every call site.
 */
export const dateType = 'date' as 'text'

/** Stringifies RHF field values for display without unsafe object stringification. */
export function toFieldString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}
