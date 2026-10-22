/**
 * One invoice: header (number, date, currency, contract), the money rows
 * (freight, insurance, commission, discount, other deductions, packing charges),
 * the buyer / third-party pickers and the goods items inside it.
 *
 * The five money rows are rendered by `ChargesRow` instead of five copies of the
 * same JSX; each item is rendered by `ItemEditor`.
 */

import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { ChargesRow } from './charges-row'
import { SectionHeading } from './form-sections'
import type { BillFormContext, BranchPath, QuickAdd } from './form-types'
import { dateType } from './form-types'
import { ItemEditor } from './item-editor'
import { emptyItem, invoiceTotal, type BillInvoiceForm, type ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'
import type { ReferenceData } from './reference-data-service'

interface InvoiceEditorProps {
  formCtx: BillFormContext
  index: number
  invoice: BillInvoiceForm
  reference: ReferenceData
  onQuickAdd: (role: QuickAdd['role'], invoiceIndex: number, itemIndex?: number) => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
  onRemove: () => void
  canRemove: boolean
}

export function InvoiceEditor({
  formCtx,
  index,
  invoice,
  reference,
  onQuickAdd,
  onAddBranch,
  onRemove,
  canRemove
}: InvoiceEditorProps) {
  const { register, control } = formCtx.hooks
  const {
    fields: items,
    append: addItem,
    remove: removeItem
  } = useFieldArray({ control, name: `invoices.${index}.items` })
  const buyerSame = formCtx.hooks.watch(`invoices.${index}.buyerSameAsConsignee`)

  return (
    <Card className="mb-4">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Invoice {index + 1}</h3>
        </div>
        {canRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            Remove invoice
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice number" {...register(`invoices.${index}.invoiceNumber`)} />
          <Input label="Invoice date" type={dateType} {...register(`invoices.${index}.invoiceDate`)} />
          <div className="flex gap-2">
            <div className="w-[100px] shrink-0">
              <Select<ShippingBillFormValues>
                label="Currency"
                name={`invoices.${index}.currency`}
                options={reference.currencies}
                rules={{ required: true }}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Total"
                type="number"
                min={0}
                {...register(`invoices.${index}.invoiceTotal`)}
                placeholder="0.00"
              />
            </div>
          </div>
          <Select<ShippingBillFormValues>
            label="Contract"
            name={`invoices.${index}.contractType`}
            options={reference.contractTypes}
            rules={{ required: true }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox {...register(`invoices.${index}.buyerSameAsConsignee`)} />
          Buyer & consignee are same
        </label>
        {!buyerSame && (
          <PartyFields
            formCtx={formCtx}
            ownerName={`invoices.${index}.buyerId`}
            branchName={`invoices.${index}.buyerBranchId`}
            label="Buyer"
            kind="business"
            onQuickAdd={() => onQuickAdd('buyer', index)}
            onAddBranch={(ownerId) => onAddBranch(ownerId, `invoices.${index}.buyerBranchId`)}
          />
        )}

        <div className="space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <ChargesRow
                formCtx={formCtx}
                invoiceIndex={index}
                kind="freight"
                label="Freight"
                currencyOptions={reference.currencies}
                invoiceCurrency={invoice.currency}
              />
              <ChargesRow
                formCtx={formCtx}
                invoiceIndex={index}
                kind="insurance"
                label="Insurance"
                currencyOptions={reference.currencies}
                invoiceCurrency={invoice.currency}
              />
            </div>
            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <ChargesRow
                formCtx={formCtx}
                invoiceIndex={index}
                kind="commission"
                label="Commission"
                currencyOptions={reference.currencies}
                invoiceCurrency={invoice.currency}
              />
              <ChargesRow
                formCtx={formCtx}
                invoiceIndex={index}
                kind="discount"
                label="Discount"
                currencyOptions={reference.currencies}
                invoiceCurrency={invoice.currency}
              />
            </div>
            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <ChargesRow
                formCtx={formCtx}
                invoiceIndex={index}
                kind="otherDeductions"
                label="Other Deductions"
                currencyOptions={reference.currencies}
                invoiceCurrency={invoice.currency}
              />
              <div className="p-2">
                <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                  <span className="w-28 shrink-0 font-medium text-gray-900">Packing Charges</span>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.packingCharges`)}
                    className="py-1 text-right"
                    placeholder="Amount"
                  />
                  <span className="w-14 text-sm text-gray-500">—</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Price includes"
              name={`invoices.${index}.freightInsuranceIncluded`}
              options={reference.priceInclusionOptions}
              placeholder="Select if applicable"
            />
            <Input label="Contract / order number" {...register(`invoices.${index}.contractNumber`)} />
            <Select<ShippingBillFormValues>
              label="Payment type"
              name={`invoices.${index}.natureOfPayment`}
              options={reference.paymentTypes}
              placeholder="Select if applicable"
            />
            <Input label="Payment period (days)" type="number" {...register(`invoices.${index}.periodOfPayment`)} />
          </div>
          <PartyFields
            formCtx={formCtx}
            ownerName={`invoices.${index}.thirdPartyId`}
            branchName={`invoices.${index}.thirdPartyBranchId`}
            label="Third party (optional)"
            kind="business"
            required={false}
            onQuickAdd={() => onQuickAdd('thirdParty', index)}
            onAddBranch={(ownerId) => onAddBranch(ownerId, `invoices.${index}.thirdPartyBranchId`)}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SectionHeading title="Goods" />
            <Button size="sm" variant="outline" onClick={() => addItem(emptyItem())}>
              + Add item
            </Button>
          </div>
          <div className="space-y-4">
            {items.map((field, itemIndex) => (
              <ItemEditor
                key={field.id}
                formCtx={formCtx}
                invoiceIndex={index}
                itemIndex={itemIndex}
                item={invoice.items[itemIndex] ?? emptyItem()}
                currency={invoice.currency}
                schemeOptions={reference.schemes}
                quantityOptions={reference.quantityCodes}
                tradeAgreements={reference.tradeAgreements}
                onQuickAdd={onQuickAdd}
                onAddBranch={onAddBranch}
                onRemove={() => removeItem(itemIndex)}
                canRemove={items.length > 1}
              />
            ))}
          </div>
        </div>

        <div className="text-right text-sm font-semibold">
          Invoice total: {invoice.currency}{' '}
          {invoiceTotal(invoice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      </CardContent>
    </Card>
  )
}
