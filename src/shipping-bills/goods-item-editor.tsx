import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { Advanced } from './form-primitives'
import { BillFormContext, BranchPath, DATE_INPUT_TYPE } from './form-types'
import type { ShippingBillLookups } from './lookup-service'
import { BillItemForm, lineTotal, ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'

interface GoodsItemEditorProps {
  formCtx: BillFormContext
  invoiceIndex: number
  itemIndex: number
  item: BillItemForm
  invoiceCurrency: string
  lookups: ShippingBillLookups
  partyVersion: number
  canRemove: boolean
  onRemove: () => void
  onQuickAddThirdParty: () => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
}

export function GoodsItemEditor({
  formCtx,
  invoiceIndex,
  itemIndex,
  item,
  invoiceCurrency,
  lookups,
  partyVersion,
  canRemove,
  onRemove,
  onQuickAddThirdParty,
  onAddBranch
}: GoodsItemEditorProps) {
  const { register } = formCtx.hooks
  const selectedScheme = lookups.schemeCodes.find((s) => s.value === item.schemeCode)
  const showDrawback = Boolean(
    selectedScheme && (selectedScheme.drawback || selectedScheme.RODTEP || selectedScheme.ROSCTL)
  )
  const currencyLabel = invoiceCurrency ? invoiceCurrency : 'currency'

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Item {itemIndex + 1}</h4>
        {canRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <div className="mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          label="RITC / HS code"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ritcCode`)}
          placeholder="e.g. 61091000"
        />
        <Select<ShippingBillFormValues>
          label="Scheme code"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.schemeCode`}
          options={lookups.schemeCodes}
          placeholder="Select scheme"
        />
        <Input
          label="Goods description"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.goodsDescription1`)}
          wrapClass="lg:col-span-4"
          placeholder="e.g. Cotton T-shirts"
        />
        <Input label="Quantity" type="number" {...register(`invoices.${invoiceIndex}.items.${itemIndex}.quantity`)} />
        <Select<ShippingBillFormValues>
          label="Unit"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.unitOfMeasurement`}
          options={lookups.quantityCodes}
          rules={{ required: true }}
        />
        <Input
          label={`Unit price (${currencyLabel})`}
          type="number"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.unitPrice`)}
        />
        <Input
          label="Item Total"
          type="number"
          placeholder={`${invoiceCurrency} ${lineTotal(item).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.lineTotal`)}
        />
        <Select<ShippingBillFormValues>
          label="IGST payment"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.igstPaymentStatus`}
          options={lookups.igstPaymentStatuses}
          placeholder="Select if applicable"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-4">
        {showDrawback && (
          <>
            <div className="w-36">
              <Input
                label="Drawback Serial no."
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackSerialNumber`)}
              />
            </div>
            <div className="w-32">
              <Input label="Drawback Unit" {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackUnit`)} />
            </div>
            <div className="w-36">
              <Input
                label="Drawback Quantity"
                type="number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackQuantity`)}
              />
            </div>
          </>
        )}
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`invoices.${invoiceIndex}.items.${itemIndex}.rewardItem`)} />
          Claim reward
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`invoices.${invoiceIndex}.items.${itemIndex}.thirdPartyItem`)} />
          Third-party item
        </label>
      </div>

      {item.thirdPartyItem && (
        <div className="my-4">
          <PartyFields
            formCtx={formCtx}
            ownerName={`invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyId`}
            branchName={`invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyBranchId`}
            label="Item third party"
            kind="business"
            role="thirdParty"
            partyVersion={partyVersion}
            onQuickAdd={onQuickAddThirdParty}
            onAddBranch={(ownerId) =>
              onAddBranch(ownerId, `invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyBranchId`)
            }
          />
        </div>
      )}

      <Advanced title="Item customs, taxes and incentives">
        <div className="mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select<ShippingBillFormValues>
            label="Unit of rate"
            name={`invoices.${invoiceIndex}.items.${itemIndex}.unitOfRate`}
            options={lookups.quantityCodes}
            placeholder={item.unitOfMeasurement}
          />
          <Input
            label="Per Unit (Rate)"
            type="number"
            placeholder="1"
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.numberOfUnits`)}
          />
          <Input
            label="Present market value"
            type="number"
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.presentMarketValue`)}
          />
          <Input label="GCess" type="number" {...register(`invoices.${invoiceIndex}.items.${itemIndex}.cess`)} />
          <Input
            label="Accessories description"
            wrapClass="lg:col-span-3"
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.accessoriesDescription`)}
          />
          <Select<ShippingBillFormValues>
            label="Accessory status"
            name={`invoices.${invoiceIndex}.items.${itemIndex}.accessoryStatus`}
            options={lookups.accessoryStatuses}
            placeholder="Select if relevant"
          />
          {item.igstPaymentStatus === 'P' && (
            <>
              <Input
                label="Taxable value"
                type="number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.taxableValue`)}
              />
              <Input
                label="IGST amount"
                type="number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.igstAmount`)}
              />
            </>
          )}

          <Input
            label="Origin district code"
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.originDistrictCode`)}
          />
          <Select<ShippingBillFormValues>
            label="Trade agreement code"
            name={`invoices.${invoiceIndex}.items.${itemIndex}.tradeAgreementsCode`}
            options={lookups.tradeAgreements}
            placeholder="NCPTI"
          />
          <Input label="End use code" {...register(`invoices.${invoiceIndex}.items.${itemIndex}.endUseOfItem`)} />
          <Input
            label="Packages for item"
            type="number"
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.totalPackage`)}
          />
        </div>
        <Advanced title="AR4 / excise details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="AR4 number" {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Number`)} />
            <Input
              label="AR4 date"
              type={DATE_INPUT_TYPE}
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Date`)}
            />
          </div>
        </Advanced>
      </Advanced>
    </div>
  )
}
