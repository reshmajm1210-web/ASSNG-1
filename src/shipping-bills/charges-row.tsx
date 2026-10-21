import { getFormContext } from 'core/form'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { BillFieldPath } from './form-types'
import { ShippingBillFormValues } from './model'
import { useReferenceData } from './reference-data-service'

interface ChargesRowProps {
  label: string
  rateName: BillFieldPath
  amountName: BillFieldPath
  currencyName: BillFieldPath
  rateValue: string | undefined
  amountValue: string | undefined
  /** Currency shown as placeholder until a charge currency is picked. */
  invoiceCurrency: string
}

/**
 * One invoice charge line (Freight / Insurance / Commission / Discount /
 * Other Deductions): rate % and amount are mutually exclusive, with an
 * optional charge currency.
 */
export function ChargesRow({
  label,
  rateName,
  amountName,
  currencyName,
  rateValue,
  amountValue,
  invoiceCurrency
}: ChargesRowProps) {
  const { hooks } = getFormContext<ShippingBillFormValues>()
  const { register } = hooks
  const referenceData = useReferenceData()
  const currencyOptions = referenceData?.currencies ?? []

  return (
    <div className="p-2">
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <span className="w-28 shrink-0 font-medium text-gray-900">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            {...register(rateName)}
            className="text-right"
            disabled={amountValue !== '' && amountValue != null}
            placeholder="Rate"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
        <Input
          type="number"
          {...register(amountName)}
          className="py-1 text-right"
          disabled={rateValue !== '' && rateValue != null}
          placeholder="Amount"
        />
        <Select<ShippingBillFormValues> name={currencyName} options={currencyOptions} placeholder={invoiceCurrency} />
      </div>
    </div>
  )
}
