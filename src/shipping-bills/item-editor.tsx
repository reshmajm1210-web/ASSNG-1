/**
 * One goods item inside an invoice.
 *
 * Holds the everyday columns (RITC/HS code, scheme, description, quantity, unit,
 * price) plus the collapsible customs/tax/incentive details (AR4, IGST, drawback,
 * RoDTEP, trade agreement). Every field belongs to
 * `invoices.<invoiceIndex>.items.<itemIndex>.*`; the two indexes are separate, and
 * this component receives both.
 */

import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import type { SelectOption } from 'ui/inputs/select'
import { Select } from 'ui/inputs/select'
import { Advanced } from './form-sections'
import type { BillFormContext, BranchPath, QuickAdd } from './form-types'
import { dateType } from './form-types'
import type { BillItemForm, ShippingBillFormValues } from './model'
import { lineTotal } from './model'
import { PartyFields } from './party-fields'
import type { SchemeCodeOption } from './reference-data-service'

interface ItemEditorProps {
  formCtx: BillFormContext
  invoiceIndex: number
  itemIndex: number
  item: BillItemForm
  /** Invoice currency, used in the unit-price / total labels. */
  currency: string
  schemeOptions: SchemeCodeOption[]
  quantityOptions: SelectOption[]
  tradeAgreements: SelectOption[]
  onQuickAdd: (role: QuickAdd['role'], invoiceIndex: number, itemIndex?: number) => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
  onRemove: () => void
  canRemove: boolean
}

export function ItemEditor({
  formCtx,
  invoiceIndex,
  itemIndex,
  item,
  currency,
  schemeOptions,
  quantityOptions,
  tradeAgreements,
  onQuickAdd,
  onAddBranch,
  onRemove,
  canRemove
}: ItemEditorProps) {
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
          {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.ritcCode`)}
          placeholder="e.g. 61091000"
        />
        <Select<ShippingBillFormValues>
          label="Scheme code"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.schemeCode`}
          options={schemeOptions}
          placeholder="Select scheme"
        />
        <Input
          label="Goods description"
          {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.goodsDescription1`)}
          wrapClass="lg:col-span-4"
          placeholder="e.g. Cotton T-shirts"
        />
        <Input
          label="Quantity"
          type="number"
          {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.quantity`)}
        />
        <Select<ShippingBillFormValues>
          label="Unit"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.unitOfMeasurement`}
          options={quantityOptions}
          rules={{ required: true }}
        />
        <Input
          label={`Unit price (${currency !== '' ? currency : 'currency'})`}
          type="number"
          {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.unitPrice`)}
        />
        <Input
          label="Item Total"
          type="number"
          placeholder={`${currency} ${lineTotal(item).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}

          {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.lineTotal`)}
        />
        <Select<ShippingBillFormValues>
          label="IGST payment"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.igstPaymentStatus`}
          options={[
            { value: 'NA', label: 'Not applicable' },
            { value: 'LUT', label: 'Under LUT / bond' },
            { value: 'P', label: 'Against payment' }
          ]}
          placeholder="Select if applicable"
        />
      </div>
      {/* Row 3: drawback inputs (conditional) + checkboxes */}
      <div className="mb-3 flex flex-wrap items-end gap-4">
        {(() => {
          const selectedScheme = schemeOptions.find((scheme) => scheme.value === item.schemeCode)
          const showDrawback =
            selectedScheme && (selectedScheme.drawback || selectedScheme.RODTEP || selectedScheme.ROSCTL)
          return showDrawback ? (
            <>
              <div className="w-36">
                <Input
                  label="Drawback Serial no."
                  {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackSerialNumber`)}
                />
              </div>
              <div className="w-32">
                <Input
                  label="Drawback Unit"
                  {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackUnit`)}
                />
              </div>
              <div className="w-36">
                <Input
                  label="Drawback Quantity"
                  type="number"
                  {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackQuantity`)}
                />
              </div>
            </>
          ) : null
        })()}
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.rewardItem`)} />
          Claim reward
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.thirdPartyItem`)} />
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
            onQuickAdd={() => onQuickAdd('itemThirdParty', invoiceIndex, itemIndex)}
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
            options={quantityOptions}
            placeholder={item.unitOfMeasurement}
          />
          <Input
            label="Per Unit (Rate)"
            type="number"
            placeholder="1"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.numberOfUnits`)}
          />
          <Input
            label="Present market value"
            type="number"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.presentMarketValue`)}
          />
          <Input
            label="GCess"
            type="number"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.cess`)}
          />
          <Input
            label="Accessories description"
            wrapClass="lg:col-span-3"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.accessoriesDescription`)}
          />
          <Select<ShippingBillFormValues>
            label="Accessory status"
            name={`invoices.${invoiceIndex}.items.${itemIndex}.accessoryStatus`}
            options={[
              { value: '0', label: 'No accessory' },
              { value: '1', label: 'Included free of cost' },
              { value: '2', label: 'Entered separately' }
            ]}
            placeholder="Select if relevant"
          />
          {item.igstPaymentStatus === 'P' && (
            <>
              <Input
                label="Taxable value"
                type="number"
                {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.taxableValue`)}
              />
              <Input
                label="IGST amount"
                type="number"
                {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.igstAmount`)}
              />
            </>
          )}

          <Input
            label="Origin district code"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.originDistrictCode`)}
          />
          <Select<ShippingBillFormValues>
            label="Trade agreement code"
            name={`invoices.${invoiceIndex}.items.${itemIndex}.tradeAgreementsCode`}
            options={tradeAgreements}
            placeholder="NCPTI"
          />
          <Input
            label="End use code"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.endUseOfItem`)}
          />
          <Input
            label="Packages for item"
            type="number"
            {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.totalPackage`)}
          />
        </div>
        <Advanced title="AR4 / excise details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="AR4 number"
              {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Number`)}
            />
            <Input
              label="AR4 date"
              type={dateType}
              {...formCtx.hooks.register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Date`)}
            />
          </div>
        </Advanced>
      </Advanced>
    </div>
  )
}
