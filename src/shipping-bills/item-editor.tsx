import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { Advanced } from './form-sections'
import { BillFormContext, BranchPath, dateType } from './form-types'
import { BillItemForm, Business, lineTotal, ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'
import { useReferenceData } from './reference-data-service'

interface ItemEditorProps {
  formCtx: BillFormContext
  invoiceIndex: number
  itemIndex: number
  item: BillItemForm
  currency: string
  businesses: Business[]
  onQuickAdd: (invoiceIndex: number, itemIndex: number) => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
  onRemove: () => void
  canRemove: boolean
}

/** Editor for one invoice item (goods line): classification, quantity, pricing, drawback and customs details. */
export function ItemEditor({
  formCtx,
  invoiceIndex,
  itemIndex,
  item,
  currency,
  businesses,
  onQuickAdd,
  onAddBranch,
  onRemove,
  canRemove
}: ItemEditorProps) {
  const { register } = formCtx.hooks
  const referenceData = useReferenceData()
  const schemeCodes = referenceData?.schemeCodes ?? []
  const quantityCodes = referenceData?.quantityCodes ?? []
  const igstPaymentStatuses = referenceData?.igstPaymentStatuses ?? []
  const accessoryStatuses = referenceData?.accessoryStatuses ?? []
  const tradeAgreementOptions = referenceData?.tradeAgreements ?? []

  const itemPath = `invoices.${invoiceIndex}.items.${itemIndex}` as const

  const selectedScheme = schemeCodes.find((scheme) => scheme.value === item.schemeCode)
  const showDrawback = Boolean(
    selectedScheme && (selectedScheme.drawback || selectedScheme.RODTEP || selectedScheme.ROSCTL)
  )

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
        <Input label="RITC / HS code" {...register(`${itemPath}.ritcCode`)} placeholder="e.g. 61091000" />
        <Select<ShippingBillFormValues>
          label="Scheme code"
          name={`${itemPath}.schemeCode`}
          options={schemeCodes}
          placeholder="Select scheme"
        />
        <Input
          label="Goods description"
          {...register(`${itemPath}.goodsDescription1`)}
          wrapClass="lg:col-span-4"
          placeholder="e.g. Cotton T-shirts"
        />
        <Input label="Quantity" type="number" {...register(`${itemPath}.quantity`)} />
        <Select<ShippingBillFormValues>
          label="Unit"
          name={`${itemPath}.unitOfMeasurement`}
          options={quantityCodes}
          rules={{ required: true }}
        />
        <Input label={`Unit price (${currency || 'currency'})`} type="number" {...register(`${itemPath}.unitPrice`)} />
        <Input
          label="Item Total"
          type="number"
          placeholder={`${currency} ${itemTotalPlaceholder(item)}`}
          {...register(`${itemPath}.lineTotal`)}
        />
        <Select<ShippingBillFormValues>
          label="IGST payment"
          name={`${itemPath}.igstPaymentStatus`}
          options={igstPaymentStatuses}
          placeholder="Select if applicable"
        />
      </div>
      {/* Drawback inputs (conditional on scheme) + item checkboxes */}
      <div className="mb-3 flex flex-wrap items-end gap-4">
        {showDrawback ? (
          <>
            <div className="w-36">
              <Input label="Drawback Serial no." {...register(`${itemPath}.drawbackSerialNumber`)} />
            </div>
            <div className="w-32">
              <Input label="Drawback Unit" {...register(`${itemPath}.drawbackUnit`)} />
            </div>
            <div className="w-36">
              <Input label="Drawback Quantity" type="number" {...register(`${itemPath}.drawbackQuantity`)} />
            </div>
          </>
        ) : null}
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`${itemPath}.rewardItem`)} />
          Claim reward
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`${itemPath}.thirdPartyItem`)} />
          Third-party item
        </label>
      </div>
      {item.thirdPartyItem && (
        <div className="my-4">
          <PartyFields
            formCtx={formCtx}
            ownerName={`${itemPath}.itemThirdPartyId`}
            branchName={`${itemPath}.itemThirdPartyBranchId`}
            label="Item third party"
            kind="business"
            parties={businesses.filter(
              (business) => business.isThirdParty || business.id === Number(item.itemThirdPartyId)
            )}
            onQuickAdd={() => onQuickAdd(invoiceIndex, itemIndex)}
            onAddBranch={(ownerId) => onAddBranch(ownerId, `${itemPath}.itemThirdPartyBranchId`)}
          />
        </div>
      )}
      <Advanced title="Item customs, taxes and incentives">
        <div className="mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select<ShippingBillFormValues>
            label="Unit of rate"
            name={`${itemPath}.unitOfRate`}
            options={quantityCodes}
            placeholder={item.unitOfMeasurement}
          />
          <Input label="Per Unit (Rate)" type="number" placeholder="1" {...register(`${itemPath}.numberOfUnits`)} />
          <Input label="Present market value" type="number" {...register(`${itemPath}.presentMarketValue`)} />
          <Input label="GCess" type="number" {...register(`${itemPath}.cess`)} />
          <Input
            label="Accessories description"
            wrapClass="lg:col-span-3"
            {...register(`${itemPath}.accessoriesDescription`)}
          />
          <Select<ShippingBillFormValues>
            label="Accessory status"
            name={`${itemPath}.accessoryStatus`}
            options={accessoryStatuses}
            placeholder="Select if relevant"
          />
          {item.igstPaymentStatus === 'P' && (
            <>
              <Input label="Taxable value" type="number" {...register(`${itemPath}.taxableValue`)} />
              <Input label="IGST amount" type="number" {...register(`${itemPath}.igstAmount`)} />
            </>
          )}

          <Input label="Origin district code" {...register(`${itemPath}.originDistrictCode`)} />
          <Select<ShippingBillFormValues>
            label="Trade agreement code"
            name={`${itemPath}.tradeAgreementsCode`}
            options={tradeAgreementOptions}
            placeholder="NCPTI"
          />
          <Input label="End use code" {...register(`${itemPath}.endUseOfItem`)} />
          <Input label="Packages for item" type="number" {...register(`${itemPath}.totalPackage`)} />
        </div>
        <Advanced title="AR4 / excise details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="AR4 number" {...register(`${itemPath}.ar4Number`)} />
            <Input label="AR4 date" type={dateType} {...register(`${itemPath}.ar4Date`)} />
          </div>
        </Advanced>
      </Advanced>
    </div>
  )
}

function itemTotalPlaceholder(item: BillItemForm): string {
  return lineTotal(item).toLocaleString(undefined, { maximumFractionDigits: 2 })
}
