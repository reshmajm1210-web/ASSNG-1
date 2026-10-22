/**
 * Packing list ranges (package numbers and packing code).
 *
 * Sits inside the cargo card on the "Others" tab; it owns its own field array so
 * the parent component does not need to manage it.
 */

import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Input } from 'ui/inputs/input'
import { Advanced } from './form-sections'
import type { BillFormContext } from './form-types'

interface PackingTabProps {
  formCtx: BillFormContext
}

export function PackingTab({ formCtx }: PackingTabProps) {
  const { control } = formCtx.hooks
  const {
    fields: packingRanges,
    append: addPackingRange,
    remove: removePackingRange
  } = useFieldArray({ control, name: 'packingRanges' })

  return (
    <Advanced title={`Packing list ranges (${packingRanges.length})`}>
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addPackingRange({ packingNumberFrom: '', packingNumberTo: '' })}>
          + Add packing range
        </Button>
        {packingRanges.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-gray-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Range {index + 1}</span>
              <Button size="sm" variant="ghost" onClick={() => removePackingRange(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Package from"
                type="number"
                {...formCtx.hooks.register(`packingRanges.${index}.packingNumberFrom`)}
              />
              <Input
                label="Package to"
                type="number"
                {...formCtx.hooks.register(`packingRanges.${index}.packingNumberTo`)}
              />
              <Input label="Packing code" {...formCtx.hooks.register(`packingRanges.${index}.packingCode`)} />
            </div>
          </div>
        ))}
      </div>
    </Advanced>
  )
}
