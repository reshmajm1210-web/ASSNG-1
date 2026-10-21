import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Input } from 'ui/inputs/input'
import { Advanced } from './form-sections'
import { BillFormContext } from './form-types'

interface PackingTabProps {
  formCtx: BillFormContext
}

/** Packing list ranges: package number from/to with packing code. */
export function PackingTab({ formCtx }: PackingTabProps) {
  const { register, control } = formCtx.hooks
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
              <Input label="Package from" type="number" {...register(`packingRanges.${index}.packingNumberFrom`)} />
              <Input label="Package to" type="number" {...register(`packingRanges.${index}.packingNumberTo`)} />
              <Input label="Packing code" {...register(`packingRanges.${index}.packingCode`)} />
            </div>
          </div>
        ))}
      </div>
    </Advanced>
  )
}
