/**
 * Shared types and constants for the shipping bill form.
 *
 * Keeping these in one small module lets every extracted component depend on
 * types only, which keeps the import graph acyclic.
 */

import type { useForm } from 'core/form'
import type { RegisterOptions } from 'ui/form'
import type { ShippingBillFormValues } from './model'

/** The form context created by `useForm(billSchema, ...)` in the page component. */
export type BillFormContext = ReturnType<typeof useForm<ShippingBillFormValues>>

/** Path to a party id inside the bill (top level, invoice level or item level). */
export type OwnerPath =
  | 'exporterId'
  | 'consigneeId'
  | `invoices.${number}.buyerId`
  | `invoices.${number}.thirdPartyId`
  | `invoices.${number}.items.${number}.itemThirdPartyId`

/** Path to the matching branch/address id. */
export type BranchPath =
  | 'exporterBranchId'
  | 'consigneeBranchId'
  | `invoices.${number}.buyerBranchId`
  | `invoices.${number}.thirdPartyBranchId`
  | `invoices.${number}.items.${number}.itemThirdPartyBranchId`

/** Which quick-add dialog to open, and where to write the result. */
export interface QuickAdd {
  kind: 'exporter' | 'business'
  role?: 'consignee' | 'buyer' | 'thirdParty' | 'itemThirdParty'
  invoiceIndex?: number
  itemIndex?: number
}

/** Which branch dialog to open, and which field receives the new branch id. */
export interface QuickBranch {
  kind: 'exporter' | 'business'
  ownerId: number
  branchName: BranchPath
}

/** One option of an asynchronously searched dropdown. */
export interface AsyncOption {
  value: string
  label: string
  sublabel?: string
}

export interface AsyncPartySelectProps {
  name: string
  placeholder?: string
  disabled?: boolean
  className?: string
  rules?: RegisterOptions
  deps?: React.DependencyList
  fetchOptions: (query: string) => Promise<AsyncOption[]>
  getInitialLabel?: (id: string) => Promise<string>
}

/** The date input type used across the form. */
export const dateType = 'date' as 'text'
