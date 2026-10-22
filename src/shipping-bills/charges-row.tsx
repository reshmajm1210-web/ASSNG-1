/**
 * One invoice money row: label, optional rate (%), amount and currency.
 *
 * The invoice has five of these (freight, insurance, commission, discount and
 * other deductions). They used to be five copies of the same ~28 lines of JSX;
 * this component keeps the behavior identical:
 *
 * - a rate and an amount cannot both be entered, so the other field is disabled;
 * - the currency select falls back to the invoice currency when left empty.
 */

import { Input } from 'ui/inputs/input'
import type { SelectOption } from 'ui/inputs/select'
import { Select } from 'ui/inputs/select'
import type { BillFormContext } from './form-types'
import type { ShippingBillFormValues } from './model'

/** The five charge groups that share this layout. */
export type ChargeKind = 'freight' | 'insurance' | 'commission' | 'discount' | 'otherDeductions'

interface ChargesRowProps {
  formCtx: BillFormContext
  /** Index of the invoice this row belongs to. */
  invoiceIndex: number
  kind: ChargeKind
  label: string
  /** Currency options for the row's currency select. */
  currencyOptions: SelectOption[]
  /** Shown in the currency select until the user picks one (the invoice currency). */
  invoiceCurrency: string
}

export function ChargesRow({ formCtx, invoiceIndex, kind, label, currencyOptions, invoiceCurrency }: ChargesRowProps) {
  const rateName = `invoices.${invoiceIndex}.${kind}Rate` as const
  const amountName = `invoices.${invoiceIndex}.${kind}Amount` as const
  const currencyName = `invoices.${invoiceIndex}.${kind}Currency` as const

  const rate = formCtx.hooks.watch(rateName)
  const amount = formCtx.hooks.watch(amountName)
  const hasAmount = amount !== undefined && amount !== ''
  const hasRate = rate !== undefined && rate !== ''

  return (
    <div className="p-2">
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <span className="w-28 shrink-0 font-medium text-gray-900">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            {...formCtx.hooks.register(rateName)}
            className="text-right"
            disabled={hasAmount}
            placeholder="Rate"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
        <Input
          type="number"
          {...formCtx.hooks.register(amountName)}
          className="py-1 text-right"
          disabled={hasRate}
          placeholder="Amount"
        />
        <Select<ShippingBillFormValues> name={currencyName} options={currencyOptions} placeholder={invoiceCurrency} />
      </div>
    </div>
  )
}
