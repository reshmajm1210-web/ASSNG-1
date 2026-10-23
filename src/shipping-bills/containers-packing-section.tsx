import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { Advanced, SectionHeading } from './form-primitives'
import { BillFormContext, DATE_INPUT_TYPE } from './form-types'
import type { ShippingBillLookups } from './lookup-service'
import type { ContainerForm, PackingRangeForm, ShippingBillFormValues } from './model'

interface ContainersPackingSectionProps {
  formCtx: BillFormContext
  containers: { id: string }[]
  packingRanges: { id: string }[]
  lookups: ShippingBillLookups
  onAddContainer: (container: ContainerForm) => void
  onRemoveContainer: (index: number) => void
  onAddPackingRange: (range: PackingRangeForm) => void
  onRemovePackingRange: (index: number) => void
}

export function ContainersPackingSection({
  formCtx,
  containers,
  packingRanges,
  lookups,
  onAddContainer,
  onRemoveContainer,
  onAddPackingRange,
  onRemovePackingRange
}: ContainersPackingSectionProps) {
  const { register } = formCtx.hooks

  return (
    <Card>
      <CardHeader title="Cargo & Package Detail" />
      <CardContent className="space-y-5">
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading
            title={`Containers (${containers.length})`}
            description="Add only when the cargo is containerized."
          />
          <Button size="sm" variant="outline" onClick={() => onAddContainer({ containerNumber: '' })}>
            + Add container
          </Button>
        </div>
        <div className="space-y-3">
          {containers.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex justify-between">
                <h3 className="text-sm font-semibold">Container {index + 1}</h3>
                <Button size="sm" variant="ghost" onClick={() => onRemoveContainer(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Container number" {...register(`containers.${index}.containerNumber`)} />
                <Select<ShippingBillFormValues>
                  label="Size"
                  name={`containers.${index}.containerSize`}
                  options={lookups.containerSizes}
                  placeholder="Select size"
                />
                <Input label="Seal number" {...register(`containers.${index}.exciseSealNumber`)} />
                <Input label="Seal date" type={DATE_INPUT_TYPE} {...register(`containers.${index}.sealDate`)} />
                <Select<ShippingBillFormValues>
                  label="Seal type"
                  name={`containers.${index}.sealType`}
                  options={lookups.containerSealTypes}
                  placeholder="Select if needed"
                />
                <Input label="Seal device ID" {...register(`containers.${index}.sealDeviceId`)} />
                <Input label="Movement document type" {...register(`containers.${index}.movementDocumentType`)} />
                <Input label="Movement document number" {...register(`containers.${index}.movementDocumentNumber`)} />
              </div>
            </div>
          ))}
        </div>

        <Advanced title={`Packing list ranges (${packingRanges.length})`}>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddPackingRange({ packingNumberFrom: '', packingNumberTo: '' })}>
              + Add packing range
            </Button>
            {packingRanges.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Range {index + 1}</span>
                  <Button size="sm" variant="ghost" onClick={() => onRemovePackingRange(index)}>
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
      </CardContent>
    </Card>
  )
}
