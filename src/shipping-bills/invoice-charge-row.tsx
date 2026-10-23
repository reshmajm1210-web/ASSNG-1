import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import type { BillFormContext } from './form-types'
import type { LookupSelectOption } from './lookup-service'
import type { BillInvoiceForm, ShippingBillFormValues } from './model'

export type InvoiceChargeKey = 'freight' | 'insurance' | 'commission' | 'discount' | 'otherDeductions'

interface InvoiceChargeRowProps {
  formCtx: BillFormContext
  invoiceIndex: number
  chargeKey: InvoiceChargeKey
  label: string
  invoiceValues: BillInvoiceForm
  invoiceCurrency: string
  currencyOptions: LookupSelectOption[]
}

export function InvoiceChargeRow({
  formCtx,
  invoiceIndex,
  chargeKey,
  label,
  invoiceValues,
  invoiceCurrency,
  currencyOptions
}: InvoiceChargeRowProps) {
  const { register } = formCtx.hooks
  const rateField = `invoices.${invoiceIndex}.${chargeKey}Rate` as const
  const amountField = `invoices.${invoiceIndex}.${chargeKey}Amount` as const
  const currencyField = `invoices.${invoiceIndex}.${chargeKey}Currency` as const

  const rateValue = invoiceValues[`${chargeKey}Rate`]
  const amountValue = invoiceValues[`${chargeKey}Amount`]

  return (
    <div className="p-2">
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <span className="w-28 shrink-0 font-medium text-gray-900">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            {...register(rateField)}
            className="text-right"
            disabled={amountValue !== '' && amountValue != null}
            placeholder="Rate"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
        <Input
          type="number"
          {...register(amountField)}
          className="py-1 text-right"
          disabled={rateValue !== '' && rateValue != null}
          placeholder="Amount"
        />
        <Select<ShippingBillFormValues> name={currencyField} options={currencyOptions} placeholder={invoiceCurrency} />
      </div>
    </div>
  )
}
